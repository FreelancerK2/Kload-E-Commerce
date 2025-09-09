'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWishlistStore, WishlistItem } from '@/lib/wishlist';
import { useCartStore } from '@/lib/store';
import { Star, ShoppingCart, Heart, Trash2 } from 'lucide-react';
import ProcessedProductImage from '@/components/ProcessedProductImage';

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAddToCart = (item: WishlistItem) => {
    setIsLoading(item.id);
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
    setTimeout(() => setIsLoading(null), 500);
  };

  const handleRemoveFromWishlist = (id: string) => {
    removeItem(id);
  };

  // Helper function to render stars with half-star support
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="h-4 w-4 fill-current text-yellow-400"
        />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-yellow-400" />
          <Star
            className="h-4 w-4 fill-current text-yellow-400 absolute top-0 left-0"
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
        </div>
      );
    }

    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-yellow-400" />
      );
    }

    return stars;
  };

  // Helper function to get first image from JSON array or single image
  const getFirstImage = (images: string) => {
    if (!images) return null;
    try {
      const imageArray = JSON.parse(images);
      if (Array.isArray(imageArray) && imageArray.length > 0) {
        return imageArray[0];
      }
    } catch (error) {
      // If not valid JSON, treat as single image
      return images;
    }
    return null;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your Wishlist is Empty
            </h1>
            <p className="text-gray-600 mb-6">
              Start adding items to your wishlist by browsing our products
            </p>
            <Link
              href="/shop"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your
            wishlist
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {(() => {
                    const firstImage = getFirstImage(item.image);
                    return firstImage ? (
                      <ProcessedProductImage
                        src={firstImage}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                        fallbackClassName="w-full h-full"
                        aggressive={true}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                        onError={() => {
                          // Handle error if needed
                        }}
                      />
                    ) : null;
                  })()}
                  <div
                    className="w-full h-full flex items-center justify-center text-gray-400"
                    style={{
                      display: getFirstImage(item.image) ? 'none' : 'flex',
                    }}
                  >
                    <span className="text-gray-500">Product Image</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  <Link
                    href={`/products/${item.id}`}
                    className="hover:text-blue-600"
                  >
                    {item.name}
                  </Link>
                </h3>
                <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                <div className="flex items-center mb-2">
                  <div className="flex">{renderStars(item.rating)}</div>
                  <span className="text-sm text-gray-600 ml-2">
                    ({item.rating})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={isLoading === item.id}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {isLoading === item.id ? 'Adding...' : 'Add to Cart'}
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
