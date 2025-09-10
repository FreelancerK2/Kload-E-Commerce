'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlist';
import CustomPopup from './CustomPopup';
import StarRating from './StarRating';
import ProcessedProductImage from './ProcessedProductImage';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images: string;
  category: string;
  rating: number;
  inStock: boolean;
  stockCount?: number;
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode }: ProductCardProps) {
  const { addItem } = useCartStore();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();

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

  // Custom popup state
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercentage =
    product.discountPercentage ||
    (hasDiscount
      ? Math.round(
          ((product.originalPrice! - product.price) / product.originalPrice!) *
            100
        )
      : 0);

  const handleAddToCart = () => {
    // Check if product is in stock before adding to cart
    if (
      !product.inStock ||
      (product.stockCount !== undefined && product.stockCount === 0)
    ) {
      setPopup({
        isOpen: true,
        type: 'error',
        title: 'Out of Stock',
        message: 'This product is out of stock and cannot be added to cart.',
      });
      return;
    }

    // Check if adding this item would exceed available stock
    const existingItem = useCartStore
      .getState()
      .items.find((item) => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const stockCount = product.stockCount || 0;

    if (currentQuantity >= stockCount) {
      setPopup({
        isOpen: true,
        type: 'warning',
        title: 'Stock Limit Reached',
        message: `Sorry, only ${stockCount} items available in stock.`,
      });
      return;
    }

    console.log('Adding to cart:', {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.substring(0, 50) + '...',
      stockCount: product.stockCount,
    });

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: getFirstImage(product.images) || '',
      stockCount: product.stockCount,
    });

    // Success notification is handled by the store's toast system
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: getFirstImage(product.images) || '',
        category: product.category,
        rating: product.rating,
      });
    }
  };

  const handleRatingChange = (rating: number) => {
    setPopup({
      isOpen: true,
      type: 'success',
      title: 'Rating Submitted!',
      message: `Thank you for rating ${product.name} with ${rating} stars!`,
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20">
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm">
              Out of Stock
            </div>
          </div>
        )}
        <div className="flex">
          <Link
            href={`/products/${product.id}`}
            className="w-48 h-48 bg-gray-100 flex items-center justify-center overflow-hidden hover:bg-gray-200 transition-colors"
          >
            {(() => {
              const firstImage = getFirstImage(product.images);
              return firstImage ? (
                <ProcessedProductImage
                  src={firstImage}
                  alt={product.name}
                  className="hover:scale-105 transition-transform duration-200 w-full h-full object-contain p-2"
                  fallbackClassName="w-full h-full"
                />
              ) : null;
            })()}
            <div
              className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded"
              style={{
                display: getFirstImage(product.images) ? 'none' : 'flex',
              }}
            >
              <span className="text-gray-500">Product Image</span>
            </div>
          </Link>
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="hover:text-blue-600"
                  >
                    {product.name}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-2">{product.category}</p>

                {/* Stock Count Indicator */}
                {product.stockCount !== undefined && (
                  <div className="flex items-center mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.inStock
                          ? product.stockCount > 10
                            ? 'bg-green-100 text-green-800'
                            : product.stockCount > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.inStock
                        ? product.stockCount > 10
                          ? `In Stock (${product.stockCount})`
                          : product.stockCount > 0
                            ? `Low Stock (${product.stockCount})`
                            : 'Out of Stock'
                        : 'Out of Stock'}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <StarRating
                    productId={product.id}
                    currentRating={product.rating}
                    onRatingChange={handleRatingChange}
                    size="md"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {hasDiscount ? (
                      <>
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 line-through">
                            ${product.originalPrice!.toFixed(2)}
                          </span>
                          <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-medium">
                            -{discountPercentage}%
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleWishlistToggle}
                      className={`p-2 transition-colors ${
                        isInWishlist(product.id)
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart
                        className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`}
                      />
                    </button>
                    <button
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                      className={`px-6 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                        product.inStock
                          ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Link
          href={`/products/${product.id}`}
          className="block h-40 sm:h-48 bg-gray-100 flex items-center justify-center overflow-hidden hover:bg-gray-200 transition-colors"
        >
          {(() => {
            const firstImage = getFirstImage(product.images);
            return firstImage ? (
              <ProcessedProductImage
                src={firstImage}
                alt={product.name}
                className="hover:scale-105 transition-transform duration-200 w-full h-full object-contain p-2"
                fallbackClassName="w-full h-full"
                aggressive={true}
              />
            ) : null;
          })()}
          <div
            className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded"
            style={{ display: getFirstImage(product.images) ? 'none' : 'flex' }}
          >
            <span className="text-gray-500 text-sm sm:text-base">
              Product Image
            </span>
          </div>
        </Link>
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 p-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-white/80 ${
            isInWishlist(product.id)
              ? 'text-red-500 hover:text-red-600'
              : 'text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart
            className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`}
          />
        </button>
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
            -{discountPercentage}%
          </div>
        )}
        {!product.inStock && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium z-10">
            Out of Stock
          </div>
        )}

        {/* Stock Out Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium text-sm">
              Out of Stock
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base line-clamp-2">
          <Link
            href={`/products/${product.id}`}
            className="hover:text-blue-600"
          >
            {product.name}
          </Link>
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-2">
          {product.category}
        </p>

        {/* Stock Count Indicator */}
        {product.stockCount !== undefined && (
          <div className="flex items-center mb-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                product.inStock
                  ? product.stockCount > 10
                    ? 'bg-green-100 text-green-800'
                    : product.stockCount > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {product.inStock
                ? product.stockCount > 10
                  ? `In Stock (${product.stockCount})`
                  : product.stockCount > 0
                    ? `Low Stock (${product.stockCount})`
                    : 'Out of Stock'
                : 'Out of Stock'}
            </span>
          </div>
        )}

        <div className="mb-2">
          <StarRating
            productId={product.id}
            currentRating={product.rating}
            onRatingChange={handleRatingChange}
            size="md"
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-sm sm:text-base font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 line-through">
                    ${product.originalPrice!.toFixed(2)}
                  </span>
                  <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded font-medium">
                    -{discountPercentage}%
                  </span>
                </div>
              </>
            ) : (
              <span className="text-base sm:text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 min-h-[44px] min-w-[44px] justify-center ${
              product.inStock
                ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">
              {product.inStock ? 'Add' : 'Out of Stock'}
            </span>
            <span className="sm:hidden">{product.inStock ? '+' : '×'}</span>
          </button>
        </div>
      </div>

      {/* Custom Popup */}
      <CustomPopup
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        autoClose={true}
        autoCloseDelay={3000}
      />
    </div>
  );
}
