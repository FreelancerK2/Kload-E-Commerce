'use client';

import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAdminUser } from '@/lib/admin';
import AdminNavbar from './AdminNavbar';
import UserNavbar from './UserNavbar';

export default function ConditionalNavbar() {
  const { isSignedIn, user, isLoaded } = useUser();
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

  // For all other routes, show user navbar
  return <UserNavbar />;
}
