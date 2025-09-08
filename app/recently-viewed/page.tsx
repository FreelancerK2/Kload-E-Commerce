'use client';

import { useRecentlyViewedStore } from '@/lib/recently-viewed';
import { formatPrice, formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';
import { Eye, Trash2, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlist';
import ProcessedProductImage from '@/components/ProcessedProductImage';
import { useState, useEffect } from 'react';

export default function RecentlyViewedPage() {
  const { items, removeItem, clearAll } = useRecentlyViewedStore();
  const { addItem } = useCartStore();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on server side to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              No Recently Viewed Items
            </h1>
            <p className="text-gray-600 mb-8">
              Start browsing products to see your recently viewed items here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Eye className="h-8 w-8 text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Recently Viewed Items
            </h1>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {items.length} items
            </span>
          </div>

          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <Link href={`/products/${item.id}`} className="block">
                  <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden hover:bg-gray-200 transition-colors">
                    <ProcessedProductImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-200"
                      fallbackClassName="w-full h-full"
                    />
                  </div>
                </Link>

                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove from recently viewed"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4">
                <Link href={`/products/${item.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {item.name}
                  </h3>
                </Link>

                <p className="text-sm text-gray-600 mb-2">{item.category}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(item.price)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(item.viewedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      addItem({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        stockCount: 1,
                      })
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>

                  <button
                    onClick={() => {
                      if (isInWishlist(item.id)) {
                        removeFromWishlist(item.id);
                      } else {
                        addToWishlist({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          category: item.category,
                          rating: item.rating || 0,
                        });
                      }
                    }}
                    className={`p-2 rounded-md border transition-colors ${
                      isInWishlist(item.id)
                        ? 'border-red-300 bg-red-50 text-red-500'
                        : 'border-gray-300 text-gray-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${isInWishlist(item.id) ? 'fill-current' : ''}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
