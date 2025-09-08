'use client';

import Link from 'next/link';
import { useRecentlyViewedStore } from '@/lib/recently-viewed';
import { formatPrice } from '@/lib/utils';
import { X, Eye } from 'lucide-react';
import ProcessedProductImage from './ProcessedProductImage';
import { useState, useEffect } from 'react';

interface RecentlyViewedProps {
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

export default function RecentlyViewed({
  limit = 5,
  showTitle = true,
  className = '',
}: RecentlyViewedProps) {
  const { getRecentItems, removeItem, clearAll } = useRecentlyViewedStore();
  const [isClient, setIsClient] = useState(false);
  const [recentItems, setRecentItems] = useState<any[]>([]);

  useEffect(() => {
    setIsClient(true);
    setRecentItems(getRecentItems(limit));
  }, [getRecentItems, limit]);

  // Don't render anything on server side to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    >
      {showTitle && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Recently Viewed
            </h3>
          </div>
          <button
            onClick={clearAll}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="p-4">
        <div className="space-y-3">
          {recentItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 group">
              <Link
                href={`/products/${item.id}`}
                className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden hover:bg-gray-200 transition-colors"
              >
                <ProcessedProductImage
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-contain p-1"
                  fallbackClassName="w-full h-full"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.id}`} className="block">
                  <h4 className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {item.category}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.price)}
                  </p>
                </Link>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove from recently viewed"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {recentItems.length >= limit && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <Link
              href="/recently-viewed"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View All Recently Viewed →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
