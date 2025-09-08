'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlist';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import { ShoppingCart, Heart, Search, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { isAdminUser } from '@/lib/admin';
import { useRouter } from 'next/navigation';
import SearchSuggestions from './SearchSuggestions';

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const { getItemCount } = useCartStore();
  const { getItemCount: getWishlistCount } = useWishlistStore();

  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Recently Viewed', href: '/recently-viewed' },
    { name: 'Orders', href: '/orders' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  // Add admin link for admin users
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = isSignedIn && isAdminUser(userEmail);
  if (isAdmin) {
    navigation.push({ name: 'Admin', href: '/admin' });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
      setShowSuggestions(false);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setShowSuggestions(false);
    if (!isSearchOpen) {
      // Focus on search input when opening
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length >= 1);
  };

  const handleSuggestionSelect = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
    setShowSuggestions(false);
  };

  return (
    <nav className="bg-gradient-to-b from-teal-50/30 to-blue-100/30 sticky top-0 z-50 py-2 sm:py-3 backdrop-blur-sm relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Left side - Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Logo Icon - Black circle with white K */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-full flex items-center justify-center mix-blend-multiply">
                  <span className="text-white text-lg sm:text-2xl font-bold">
                    K
                  </span>
                </div>
                {/* Logo Text */}
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mix-blend-multiply">
                  Kload
                </h1>
              </div>
            </Link>
          </div>

          {/* Center - Navigation (responsive design) */}
          <div className="hidden md:flex items-center flex-1 justify-center">
            {/* Desktop Navigation - Enhanced transparent glassmorphism panel */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-2xl px-6 sm:px-8 py-2.5 sm:py-3 shadow-2xl border border-white/20 mix-blend-multiply relative overflow-hidden">
              {/* Subtle inner glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/2 to-white/5 rounded-2xl"></div>
              {/* Main content */}
              <div className="relative flex items-center space-x-8">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-sm font-medium transition-all duration-300 relative mix-blend-multiply px-3 py-2 rounded-xl hover:bg-white/10 ${
                        isActive
                          ? 'text-blue-600 font-semibold'
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      {item.name}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 transform scale-x-100 transition-transform duration-300 mix-blend-multiply rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Navigation - Enhanced transparent glassmorphism panel */}
          <div className="md:hidden flex items-center flex-1 justify-center">
            <div className="bg-white/10 backdrop-blur-2xl rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-2xl border border-white/20 mix-blend-multiply relative overflow-hidden max-w-[320px] sm:max-w-[360px]">
              {/* Subtle inner glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/2 to-white/5 rounded-2xl"></div>
              {/* Main content */}
              <div className="relative flex items-center space-x-3 overflow-x-auto scrollbar-hide px-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`text-xs sm:text-sm font-medium transition-all duration-300 relative mix-blend-multiply whitespace-nowrap flex-shrink-0 px-3 py-2 rounded-xl hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                        isActive
                          ? 'text-blue-600 font-semibold bg-white/10'
                          : 'text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      {item.name}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 transform scale-x-100 transition-transform duration-300 mix-blend-multiply rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right side - Icons and Actions (always right-aligned) */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-1.5 sm:p-2 text-gray-700 hover:text-gray-900 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              {isClient && getWishlistCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium shadow-lg">
                  {getWishlistCount()}
                </span>
              )}
            </Link>

            {/* Search Icon */}
            <button
              onClick={toggleSearch}
              className="p-1.5 sm:p-2 text-gray-700 hover:text-blue-600 transition-all duration-300 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl hover:bg-white/10 backdrop-blur-sm"
              aria-label="Search"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-1.5 sm:p-2 text-gray-700 hover:text-gray-900 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {isClient && getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium shadow-lg">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isSignedIn ? (
              <div className="min-h-[36px] min-w-[36px] flex items-center justify-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-gradient-to-r from-green-500/90 to-green-600/90 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 border border-white/20 shadow-lg backdrop-blur-sm min-h-[36px] min-w-[36px] flex items-center justify-center hover:shadow-xl hover:scale-105">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Expandable Search Bar - Absolutely Positioned */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 z-50 py-6 px-4 sm:px-0 animate-in slide-in-from-top-2 duration-300">
            <div className="max-w-lg mx-auto">
              <div ref={searchContainerRef} className="relative">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative bg-white/30 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300">
                    {/* Enhanced inner glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/8 via-white/3 to-white/8 rounded-2xl"></div>
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Search everything..."
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      className="relative w-full pl-12 pr-14 py-4 text-sm sm:text-base focus:outline-none text-gray-900 placeholder-gray-500 min-h-[56px] bg-transparent z-10"
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>

                {/* Search Suggestions */}
                <SearchSuggestions
                  query={searchQuery}
                  isVisible={showSuggestions}
                  onSelect={handleSuggestionSelect}
                  onClose={() => setShowSuggestions(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
