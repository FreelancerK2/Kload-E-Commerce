'use client';

import { ShoppingCart, Heart, Package, Search, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  type: 'cart' | 'wishlist' | 'orders' | 'products' | 'search' | 'error';
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  type,
  title,
  description,
  actionText,
  actionHref,
  icon
}: EmptyStateProps) {
  const getDefaultIcon = () => {
    switch (type) {
      case 'cart':
        return <ShoppingCart className="h-16 w-16 text-gray-400" />;
      case 'wishlist':
        return <Heart className="h-16 w-16 text-gray-400" />;
      case 'orders':
        return <Package className="h-16 w-16 text-gray-400" />;
      case 'products':
        return <Package className="h-16 w-16 text-gray-400" />;
      case 'search':
        return <Search className="h-16 w-16 text-gray-400" />;
      case 'error':
        return <AlertCircle className="h-16 w-16 text-gray-400" />;
      default:
        return <Package className="h-16 w-16 text-gray-400" />;
    }
  };

  const getDefaultAction = () => {
    switch (type) {
      case 'cart':
        return { text: 'Start Shopping', href: '/shop' };
      case 'wishlist':
        return { text: 'Browse Products', href: '/shop' };
      case 'orders':
        return { text: 'Shop Now', href: '/shop' };
      case 'products':
        return { text: 'Add Products', href: '/admin' };
      case 'search':
        return { text: 'Browse All Products', href: '/shop' };
      default:
        return { text: 'Go Home', href: '/' };
    }
  };

  const defaultAction = getDefaultAction();
  const finalActionText = actionText || defaultAction.text;
  const finalActionHref = actionHref || defaultAction.href;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-6">
        {icon || getDefaultIcon()}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md">
        {description}
      </p>
      
      {finalActionHref && (
        <Link
          href={finalActionHref}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200"
        >
          {finalActionText}
        </Link>
      )}
    </div>
  );
}

// Predefined empty states for common scenarios
export const EmptyStates = {
  Cart: () => (
    <EmptyState
      type="cart"
      title="Your cart is empty"
      description="Looks like you haven't added any items to your cart yet. Start shopping to fill it up!"
    />
  ),
  
  Wishlist: () => (
    <EmptyState
      type="wishlist"
      title="Your wishlist is empty"
      description="Save items you love by adding them to your wishlist. They'll be waiting for you here!"
    />
  ),
  
  Orders: () => (
    <EmptyState
      type="orders"
      title="No orders yet"
      description="You haven't placed any orders yet. Start shopping to see your order history here!"
    />
  ),
  
  Products: () => (
    <EmptyState
      type="products"
      title="No products found"
      description="We couldn't find any products matching your criteria. Try adjusting your search or filters."
    />
  ),
  
  Search: (query: string) => (
    <EmptyState
      type="search"
      title={`No results for "${query}"`}
      description="We couldn't find any products matching your search. Try different keywords or browse our categories."
    />
  ),
  
  Error: (message?: string) => (
    <EmptyState
      type="error"
      title="Something went wrong"
      description={message || "We encountered an error while loading this page. Please try again."}
      actionText="Try Again"
      actionHref={typeof window !== 'undefined' ? window.location.pathname : '/'}
    />
  )
};
