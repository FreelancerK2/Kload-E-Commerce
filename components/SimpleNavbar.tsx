'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlist';
import { ShoppingCart, Heart, Search, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SearchSuggestions from './SearchSuggestions';

export default function SimpleNavbar() {
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

  const userNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Recently Viewed', href: '/recently-viewed' },
    { name: 'Orders', href: '/orders' },
    { name: 'Wishlist', href: '/wishlist' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    router.push(`/shop?search=${encodeURIComponent(suggestion)}`);
    setIsSearchOpen(false);
    setShowSuggestions(false);
  };

  const cartCount = isClient ? getItemCount() : 0;
  const wishlistCount = isClient ? getWishlistCount() : 0;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">Kload</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {userNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    pathname === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4">
            <div className="relative" ref={searchContainerRef}>
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </form>

              {/* Search Suggestions */}
              {showSuggestions && (
                <SearchSuggestions
                  query={searchQuery}
                  isVisible={showSuggestions}
                  onSelect={() => setShowSuggestions(false)}
                  onClose={() => setShowSuggestions(false)}
                />
              )}
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              <Heart className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Sign In Button */}
            <Link
              href="/login"
              className="bg-gradient-to-r from-green-500/90 to-green-600/90 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 border border-white/20 shadow-lg backdrop-blur-sm min-h-[36px] min-w-[36px] flex items-center justify-center hover:shadow-xl hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
