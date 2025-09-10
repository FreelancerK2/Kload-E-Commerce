'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import SimpleNavbar from './SimpleNavbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const [showNavbar, setShowNavbar] = useState(true);

  // Check if current path is an admin route
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    // Don't show navbar on certain pages
    const noNavbarRoutes = ['/login', '/signup'];
    setShowNavbar(!noNavbarRoutes.includes(pathname));
  }, [pathname]);

  // Don't render navbar on pages that don't need it
  if (!showNavbar) {
    return null;
  }

  // Don't render navbar on admin routes - AdminLayout handles it
  if (isAdminRoute) {
    return null;
  }

  // For all other routes, show simple navbar
  return <SimpleNavbar />;
}
