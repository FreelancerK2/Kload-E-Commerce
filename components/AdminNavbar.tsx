'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Home,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminNavbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const adminNavigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      description: 'Overview and analytics',
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: Package,
      description: 'Manage inventory',
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
      description: 'Order management',
    },
    {
      name: 'Customers',
      href: '/admin/customers',
      icon: Users,
      description: 'Customer data',
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      description: 'Sales reports',
    },
    {
      name: 'Content',
      href: '/admin/content',
      icon: Settings,
      description: 'Site content',
    },
  ];

  return (
    <nav className="bg-white sticky top-0 z-50 py-3 shadow-sm border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Left side - Logo and Admin Badge */}
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">K</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-900">Kload Admin</h1>
                <span className="text-xs text-red-600 font-medium">
                  Administration Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Center - Admin Navigation */}
          <div className="hidden lg:flex items-center flex-1 justify-center">
            <div className="bg-gray-100 rounded-xl px-6 py-3 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-1">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-300 group relative ${
                        isActive
                          ? 'bg-red-600 text-white shadow-lg'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                      title={item.description}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.name}</span>
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-400 rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center flex-1 justify-center">
            <div className="bg-gray-100 rounded-xl px-3 py-2 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
                {adminNavigation.slice(0, 4).map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                        isActive
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right side - User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* Back to Store */}
            <Link
              href="/"
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all duration-300"
              title="Back to Store"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">
                Store
              </span>
            </Link>

            {/* User Info */}
            {isClient && user && (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user.firstName || user.emailAddresses?.[0]?.emailAddress}
                  </div>
                  <div className="text-xs text-red-600">Administrator</div>
                </div>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8',
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu for Additional Admin Options */}
        <div className="lg:hidden mt-3">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl px-3 py-2 shadow-xl border border-slate-700/50">
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
              {adminNavigation.slice(4).map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
