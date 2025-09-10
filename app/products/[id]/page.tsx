'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Star, CreditCard, Share2 } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlist';
import { useRecentlyViewedStore } from '@/lib/recently-viewed';
import StarRating from '@/components/StarRating';
import { parseBulletPoints, hasBulletPoints } from '@/lib/bullet-point-parser';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images: string;
  category: string;
  description: string;
  stockCount: number;
  inStock: boolean;
  rating: number;
  createdAt?: string;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { addItem } = useCartStore();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const { addItem: addToRecentlyViewed } = useRecentlyViewedStore();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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

  // Fetch related products based on category
  const fetchRelatedProducts = async (
    category: string,
    currentProductId: string
  ) => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        const allProducts = data.products || [];

        // Filter products by same category, exclude current product, and limit to 4
        const related = allProducts
          .filter(
            (p: Product) => p.category === category && p.id !== currentProductId
          )
          .slice(0, 4);

        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/products/${resolvedParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data.product);

          // Add to recently viewed
          if (data.product) {
            const firstImage = getFirstImage(data.product.images);
            addToRecentlyViewed({
              id: data.product.id,
              name: data.product.name,
              price: data.product.price,
              image: firstImage || '',
              category: data.product.category,
              rating: data.product.rating,
            });
          }

          // Fetch related products after product is loaded
          if (data.product) {
            fetchRelatedProducts(data.product.category, data.product.id);
          }
        } else {
          setError('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Error loading product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params]);

  const handleAddToCart = () => {
    if (!product) return;

    // Get the first image from the images array
    const firstImage = getFirstImage(product.images);

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: firstImage || '',
      stockCount: product.stockCount,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Get the first image from the images array
    const firstImage = getFirstImage(product.images);

    // Add to cart first
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: firstImage || '',
      stockCount: product.stockCount,
    });

    // Redirect to checkout
    window.location.href = '/checkout';
  };

  const handleShare = async () => {
    if (!product) return;

    const productUrl = window.location.href;
    const shareText = `Check out this amazing product: ${product.name} - $${product.price}`;

    if (navigator.share) {
      // Use native share API if available (mobile devices)
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: productUrl,
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${productUrl}`);
        alert('Product link copied to clipboard!');
      } catch (error) {
        // Fallback: Show share options
        const shareOptions = [
          `Facebook: https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
          `Twitter: https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`,
          `WhatsApp: https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`,
          `Email: mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(shareText + '\n' + productUrl)}`,
        ];

        const shareMessage = `Share this product:\n\n${shareOptions.join('\n\n')}\n\nOr copy this link: ${productUrl}`;
        alert(shareMessage);
      }
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      // Get the first image from the images array
      const firstImage = getFirstImage(product.images);

      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: firstImage || '',
        category: product.category,
        rating: product.rating,
      });
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (!product) return;

    if (newQuantity >= 1 && newQuantity <= product.stockCount) {
      setQuantity(newQuantity);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSubmittingReview(true);
    try {
      // Here you would typically send the review to your API
      // For now, we'll simulate a successful submission
      console.log('Submitting review:', {
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        content: reviewContent,
      });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset form
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewTitle('');
      setReviewContent('');

      // Show success message (you can add a toast notification here)
      alert('Review submitted successfully! Thank you for your feedback.');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">
              {error || 'Product not found'}
            </p>
            <Link href="/shop" className="text-blue-600 hover:text-blue-800">
              ← Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-gray-900">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/shop" className="hover:text-gray-900">
                Shop
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href={`/shop?category=${product.category}`}
                className="hover:text-gray-900"
              >
                {product.category}
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {(() => {
                const firstImage = getFirstImage(product.images);
                return firstImage ? (
                  <img
                    src={
                      firstImage.startsWith('data:')
                        ? firstImage
                        : `data:image/jpeg;base64,${firstImage}`
                    }
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null;
              })()}
              <div
                className="w-full h-full flex items-center justify-center text-gray-400"
                style={{
                  display: getFirstImage(product.images) ? 'none' : 'flex',
                }}
              >
                <span className="text-gray-500">Product Image</span>
              </div>
            </div>

            {/* Image Gallery Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {/* Main Product Image */}
              <button
                onClick={() => setSelectedImage(0)}
                className={`aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden ${
                  selectedImage === 0 ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {(() => {
                  const firstImage = getFirstImage(product.images);
                  return firstImage ? (
                    <img
                      src={
                        firstImage.startsWith('data:')
                          ? firstImage
                          : `data:image/jpeg;base64,${firstImage}`
                      }
                      alt={`${product.name} - Main View`}
                      className="w-full h-full object-cover"
                      style={{
                        filter: 'brightness(1.2) contrast(1.5) saturate(1.2)',
                        mixBlendMode: 'multiply',
                      }}
                    />
                  ) : (
                    <span className="text-gray-500 text-xs">Main</span>
                  );
                })()}
              </button>

              {/* Additional Views from Image Array */}
              {(() => {
                const imageArray = (() => {
                  if (!product.images) return [];
                  try {
                    const parsed = JSON.parse(product.images);
                    return Array.isArray(parsed) ? parsed : [product.images];
                  } catch (error) {
                    return [product.images];
                  }
                })();

                // Show up to 4 images total (including the first one)
                const additionalImages = imageArray.slice(1, 4);

                return additionalImages.map((image, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setSelectedImage(index + 1)}
                    className={`aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden ${
                      selectedImage === index + 1 ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={
                        image.startsWith('data:')
                          ? image
                          : `data:image/jpeg;base64,${image}`
                      }
                      alt={`${product.name} - View ${index + 2}`}
                      className="w-full h-full object-cover"
                      style={{
                        filter: 'brightness(1.2) contrast(1.5) saturate(1.2)',
                        mixBlendMode: 'multiply',
                      }}
                    />
                  </button>
                ));
              })()}

              {/* Fill remaining slots with placeholders if less than 4 images */}
              {(() => {
                const imageArray = (() => {
                  if (!product.images) return [];
                  try {
                    const parsed = JSON.parse(product.images);
                    return Array.isArray(parsed) ? parsed : [product.images];
                  } catch (error) {
                    return [product.images];
                  }
                })();

                const totalImages = imageArray.length;
                const remainingSlots = Math.max(0, 4 - totalImages);

                return Array.from({ length: remainingSlots }, (_, index) => (
                  <button
                    key={`placeholder-${index}`}
                    className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden"
                    disabled
                  >
                    <div className="text-gray-500 text-xs">
                      View {totalImages + index + 1}
                    </div>
                  </button>
                ));
              })()}
            </div>

            {/* Image Description */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {(() => {
                  const imageArray = (() => {
                    if (!product.images) return [];
                    try {
                      const parsed = JSON.parse(product.images);
                      return Array.isArray(parsed) ? parsed : [product.images];
                    } catch (error) {
                      return [product.images];
                    }
                  })();

                  const totalImages = imageArray.length;
                  const descriptions = [
                    'Main product view',
                    'Side view showing design details',
                    'Close-up of key features',
                    'Additional product angles',
                  ];

                  return (
                    <>
                      <strong>
                        Image {selectedImage + 1} of {totalImages}:
                      </strong>{' '}
                      {descriptions[selectedImage] || 'Product view'}
                    </>
                  );
                })()}
              </p>
            </div>
          </div>

          {/* Product Description - Moved below images */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              Product Description
            </h4>
            {hasBulletPoints(product.description) ? (
              <ul className="text-gray-600 text-sm leading-relaxed space-y-1">
                {parseBulletPoints(product.description).map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-400 mr-2 mt-0.5">•</span>
                    <span className={point.isBold ? 'font-semibold text-gray-800' : ''}>
                      {point.text}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            <div className="mb-4">
              <StarRating
                productId={product.id}
                currentRating={product.rating}
                size="lg"
              />
              <span className="text-sm text-gray-600 ml-2">(reviews)</span>
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-6">
              ${product.price.toFixed(2)}
            </div>

            {/* Discount Information */}
            {product.originalPrice && product.discountPercentage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium text-lg mb-2">
                  🎉 {product.discountPercentage}% OFF!
                </p>
                <p className="text-sm text-green-600 mb-1">
                  Original Price:{' '}
                  <span className="line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                </p>
                <p className="text-sm text-green-600">
                  You Save:{' '}
                  <span className="font-semibold">
                    ${(product.originalPrice - product.price || 0).toFixed(2)}
                  </span>
                </p>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              {product.inStock ? (
                <p className="text-green-600 font-medium">
                  In Stock ({product.stockCount} available)
                </p>
              ) : (
                <p className="text-red-600 font-medium">Out of Stock</p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Quantity
              </label>
              <div className="flex items-center border border-gray-300 rounded-md w-32">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 text-gray-900"
                >
                  -
                </button>
                <span className="px-4 py-2 text-center flex-1 text-gray-900 font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stockCount}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 text-gray-900"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Buy Now
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 border border-gray-300 rounded-lg transition-all duration-200 hover:shadow-sm ${
                    isInWishlist(product.id)
                      ? 'bg-red-50 border-red-300 hover:bg-red-100'
                      : 'hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isInWishlist(product.id)
                        ? 'text-red-500 fill-current'
                        : 'text-gray-600'
                    }`}
                  />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 border border-gray-300 rounded-lg transition-all duration-200 hover:shadow-sm hover:bg-gray-50 hover:border-gray-400"
                  title="Share this product"
                >
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Features Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Key Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center text-gray-900">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span>Premium Quality</span>
                </div>
                <div className="flex items-center text-gray-900">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span>Fast Shipping</span>
                </div>
                <div className="flex items-center text-gray-900">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span>30-Day Returns</span>
                </div>
                <div className="flex items-center text-gray-900">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span>Warranty Included</span>
                </div>
                <div className="flex items-center text-gray-900">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span>Customer Support</span>
                </div>
                <div className="flex items-center text-gray-900">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Specifications
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-900">Category</span>
                  <span className="font-medium text-gray-900">
                    {product.category}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-900">SKU</span>
                  <span className="font-medium text-gray-900">
                    {product.id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-900">Availability</span>
                  <span className="font-medium text-gray-900">
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-900">Stock Count</span>
                  <span className="font-medium text-gray-900">
                    {product.stockCount} units
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-900">Added Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(product.createdAt || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-blue-600 text-xs">🚚</span>
                  </div>
                  <span>Free shipping</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-green-600 text-xs">🛡️</span>
                  </div>
                  <span>Secure payment</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-purple-600 text-xs">↩️</span>
                  </div>
                  <span>30-day returns</span>
                </div>
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Reviews
              </h3>

              {/* Review Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                    <div>
                      <span className="text-lg font-semibold text-gray-900">
                        4.5
                      </span>
                      <span className="text-sm text-gray-600 ml-1">
                        out of 5
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Write a Review
                  </button>
                </div>
                <p className="text-sm text-gray-600">Based on 12 reviews</p>
              </div>

              {/* Write Review Form */}
              {showReviewForm && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Write Your Review
                  </h4>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className={`text-2xl ${
                              star <= reviewRating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            } hover:text-yellow-400 transition-colors`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Title
                      </label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Summarize your experience"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review
                      </label>
                      <textarea
                        value={reviewContent}
                        onChange={(e) => setReviewContent(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                        required
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                          submittingReview
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewRating(0);
                          setReviewTitle('');
                          setReviewContent('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400 mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">5.0</span>
                    </div>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                  <h5 className="font-medium text-gray-900 mb-1">
                    Excellent Quality!
                  </h5>
                  <p className="text-sm text-gray-700 mb-2">
                    "Excellent quality and fast delivery. Highly recommend this
                    product! The sound quality is amazing and the build is very
                    sturdy."
                  </p>
                  <p className="text-xs text-gray-500">
                    - Sarah M. (Verified Buyer)
                  </p>
                </div>

                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">5.0</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    "Great value for money. The product exceeded my
                    expectations."
                  </p>
                  <p className="text-xs text-gray-500">
                    - John D. (Verified Buyer)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Related Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.length > 0
              ? relatedProducts.map((relatedProduct) => {
                  const firstImage = getFirstImage(relatedProduct.images);
                  return (
                    <div
                      key={relatedProduct.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                        {firstImage ? (
                          <img
                            src={
                              firstImage.startsWith('data:')
                                ? firstImage
                                : `data:image/jpeg;base64,${firstImage}`
                            }
                            alt={relatedProduct.name}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No Image
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 text-base line-clamp-2">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {relatedProduct.category}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">
                            ${relatedProduct.price.toFixed(2)}
                          </span>
                          <Link
                            href={`/products/${relatedProduct.id}`}
                            className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              : // Show placeholder when no related products
                [1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        No Related Products
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 text-base">
                        No Related Products
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Check back later for related items
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">
                          --
                        </span>
                        <span className="text-gray-400 text-sm">
                          Unavailable
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
