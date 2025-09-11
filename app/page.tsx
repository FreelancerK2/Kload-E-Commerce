'use client';

import Link from 'next/link';
import Image from 'next/image';
import CategoryGrid from '@/components/CategoryGrid';
import StarRating from '@/components/StarRating';
import RecentlyViewed from '@/components/RecentlyViewed';
import ProcessedProductImage from '@/components/ProcessedProductImage';
import {
  ArrowRight,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Headphones,
  CheckCircle,
  ArrowLeft,
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlist';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images: string;
  category: string;
  tags: string;
  inStock: boolean;
  stockCount: number;
  rating?: number;
  createdAt?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isTopRated?: boolean;
  isFlashDeal?: boolean;
}

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  heroImage?: string;
  backgroundColor?: string;
  removeBackground?: boolean;
  aggressiveRemoval?: boolean;
}

export default function Home() {
  const { addItem } = useCartStore();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFlashDealsPage, setCurrentFlashDealsPage] = useState(1);
  const itemsPerPage = 10;
  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: 'Your One-Stop Electronic Market',
    subtitle: 'Electronic Market',
    description:
      'Welcome to e-shop, a place where you can buy everything about electronics. Sale every day!',
    buttonText: 'Shop Now',
    buttonLink: '/shop',
    heroImage: '',
    backgroundColor: '#ffffff',
    removeBackground: false,
    aggressiveRemoval: false,
  });
  const [loading, setLoading] = useState(true);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [flashDealProducts, setFlashDealProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<
    'featured' | 'new' | 'trending' | 'topRated' | 'bestSeller'
  >('featured');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both featured products and hero content
        const [productsResponse, heroResponse] = await Promise.all([
          fetch('/api/products?limit=20'),
          fetch('/api/content'),
        ]);

        const productsData = await productsResponse.json();
        const heroData = await heroResponse.json();

        const allProducts: Product[] = productsData.products || [];

        // Set featured products (products marked as featured)
        setFeaturedProducts(
          allProducts.filter((p: Product) => p.isFeatured).slice(0, 10)
        );

        // Set new arrivals (products marked as new arrivals, sorted by creation date)
        const newArrivalsList = allProducts.filter(
          (p: Product) => p.isNewArrival
        );
        const sortedByDate = [...newArrivalsList].sort(
          (a: Product, b: Product) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        setNewArrivals(sortedByDate.slice(0, 10));

        // Set trending products (products marked as trending)
        setTrendingProducts(
          allProducts.filter((p: Product) => p.isTrending).slice(0, 10)
        );

        // Set top rated products (products marked as top rated, sorted by rating)
        const topRatedList = allProducts.filter((p: Product) => p.isTopRated);
        const sortedByRating = [...topRatedList].sort(
          (a: Product, b: Product) => (b.rating || 0) - (a.rating || 0)
        );
        setTopRatedProducts(sortedByRating.slice(0, 10));

        // Set best seller products (products with highest ratings and most sales - simulated by rating and price)
        const bestSellerList = allProducts
          .filter((p: Product) => p.inStock) // Only in-stock products
          .sort((a: Product, b: Product) => {
            // Sort by rating first (if available), then by price (lower price = more sales)
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            const ratingDiff = ratingB - ratingA;
            if (ratingDiff !== 0) return ratingDiff;
            return a.price - b.price;
          });
        setBestSellerProducts(bestSellerList.slice(0, 10));

        // Set flash deal products (products marked as flash deals)
        const flashDealList = allProducts.filter((p: Product) => p.isFlashDeal);
        setFlashDealProducts(flashDealList.slice(0, 10));

        // Extract hero content from the response
        console.log('Hero data response:', heroData);
        if (heroData.content) {
          console.log('Hero content array:', heroData.content);
          const heroSection = heroData.content.find(
            (item: any) => item.section === 'hero'
          );
          console.log('Found hero section:', heroSection);
          if (heroSection) {
            const newHeroContent = {
              title: heroSection.title || 'Your One-Stop Electronic Market',
              subtitle: heroSection.subtitle || 'Electronic Market',
              description:
                heroSection.description ||
                'Welcome to e-shop, a place where you can buy everything about electronics. Sale every day!',
              buttonText: heroSection.buttonText || 'Shop Now',
              buttonLink: heroSection.buttonLink || '/shop',
              heroImage:
                heroSection.heroImage || heroSection.backgroundImage || '',
              backgroundColor: heroSection.backgroundColor || '#ffffff',
              removeBackground: heroSection.removeBackground || false,
              aggressiveRemoval: heroSection.aggressiveRemoval || false,
            };

            console.log('Setting hero content:', newHeroContent);
            console.log(
              'Hero image length:',
              heroSection.heroImage
                ? heroSection.heroImage.length
                : 'no heroImage'
            );
            console.log(
              'Background image length:',
              heroSection.backgroundImage
                ? heroSection.backgroundImage.length
                : 'no backgroundImage'
            );
            console.log('Full hero section:', heroSection);
            setHeroContent(newHeroContent);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh content when page becomes visible (useful after admin changes)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const getFirstImage = (images: string) => {
    try {
      const parsedImages = JSON.parse(images);
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        return parsedImages[0];
      }
    } catch (error) {
      // If not valid JSON, treat as single image
      if (images && images.trim() !== '') {
        return images;
      }
    }
    return null;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getCurrentProducts = () => {
    switch (activeCategory) {
      case 'featured':
        return featuredProducts;
      case 'new':
        return newArrivals;
      case 'trending':
        return trendingProducts;
      case 'topRated':
        return topRatedProducts;
      case 'bestSeller':
        return bestSellerProducts;
      default:
        return featuredProducts;
    }
  };

  // Pagination component
  const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
  }) => {
    // Debug logging
    console.log('Pagination Debug:', {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      shouldShow: totalPages > 1,
    });

    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalItems} products
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const [processedImages, setProcessedImages] = useState<{
    [key: string]: string;
  }>({});
  const [aggressiveBackgroundRemoval, setAggressiveBackgroundRemoval] =
    useState(false);

  // Function to reprocess all images when background removal mode changes
  const reprocessAllImages = () => {
    console.log('🔄 Clearing all processed images for reprocessing...');
    setProcessedImages({}); // Clear processed images to force reprocessing
  };

  // Process images immediately when they're available
  useEffect(() => {
    const processAllProductImages = async () => {
      const allProducts = [
        ...featuredProducts,
        ...newArrivals,
        ...trendingProducts,
        ...topRatedProducts,
        ...bestSellerProducts,
        ...flashDealProducts,
      ];

      for (const product of allProducts) {
        if (product.images && !processedImages[product.id]) {
          const firstImage = getFirstImage(product.images);
          if (firstImage) {
            console.log('🖼️ Processing image for:', product.name);

            const imageData = firstImage.startsWith('data:')
              ? firstImage
              : `data:image/jpeg;base64,${firstImage}`;

            try {
              const processedImage = aggressiveBackgroundRemoval
                ? await removeBackgroundAggressively(imageData)
                : await removeBackgroundFromImage(imageData);

              setProcessedImages((prev) => ({
                ...prev,
                [product.id]: processedImage,
              }));
            } catch (error) {
              console.error(
                '❌ Error processing image for',
                product.name,
                error
              );
            }
          }
        }
      }
    };

    // Process hero image if available
    const processHeroImage = async () => {
      if (heroContent.heroImage && !processedImages['hero']) {
        console.log('🖼️ Processing hero image...');

        try {
          const imageData = heroContent.heroImage.startsWith('data:')
            ? heroContent.heroImage
            : `data:image/jpeg;base64,${heroContent.heroImage}`;

          const processedImage = aggressiveBackgroundRemoval
            ? await removeBackgroundAggressively(imageData)
            : await removeBackgroundFromImage(imageData);

          setProcessedImages((prev) => ({
            ...prev,
            hero: processedImage,
          }));

          console.log('✅ Hero image processed successfully');
        } catch (error) {
          console.error('❌ Error processing hero image:', error);
        }
      }
    };

    // Process both product images and hero image
    if (
      featuredProducts.length > 0 ||
      newArrivals.length > 0 ||
      trendingProducts.length > 0 ||
      topRatedProducts.length > 0 ||
      bestSellerProducts.length > 0 ||
      flashDealProducts.length > 0
    ) {
      processAllProductImages();
    }

    processHeroImage();
  }, [
    featuredProducts,
    newArrivals,
    trendingProducts,
    topRatedProducts,
    bestSellerProducts,
    flashDealProducts,
    heroContent.heroImage,
    aggressiveBackgroundRemoval,
    processedImages,
  ]);

  // Reset pagination when active category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const removeBackgroundFromImage = async (
    imageData: string
  ): Promise<string> => {
    console.log('🔄 Starting background removal...', {
      imageDataLength: imageData.length,
    });

    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        console.log('📸 Image loaded:', {
          width: img.width,
          height: img.height,
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.log('❌ No canvas context');
          resolve(imageData);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        console.log('🎨 Processing image data:', {
          totalPixels: data.length / 4,
          width: canvas.width,
          height: canvas.height,
        });

        let transparentPixels = 0;

        // Enhanced background removal with better white detection
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Calculate brightness and color similarity
          const brightness = (r + g + b) / 3;
          const maxColor = Math.max(r, g, b);
          const minColor = Math.min(r, g, b);
          const colorRange = maxColor - minColor;

          // More sophisticated white/light background detection
          if (
            // Pure white or very light colors
            (r > 240 && g > 240 && b > 240) ||
            // High brightness with low color variation (typical of white backgrounds)
            (brightness > 220 && colorRange < 30) ||
            // Very light grays
            (brightness > 200 && colorRange < 15) ||
            // Near-white colors with high brightness
            (brightness > 230 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25)
          ) {
            data[i + 3] = 0; // Make transparent
            transparentPixels++;
          }
        }

        // Second pass: Remove light frames and edges
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;

          // Remove light frames but be more conservative
          if (
            brightness > 190 &&
            Math.abs(r - g) < 20 &&
            Math.abs(g - b) < 20
          ) {
            data[i + 3] = 0; // Make transparent
            // Don't increment transparentPixels here since we already counted it in the first pass
          }
        }

        console.log('✨ Background removal complete:', {
          transparentPixels,
          totalPixels: data.length / 4,
          percentage: Math.round((transparentPixels / (data.length / 4)) * 100),
        });

        ctx.putImageData(imgData, 0, 0);
        const result = canvas.toDataURL('image/png');
        console.log('✅ Final result:', { resultLength: result.length });
        resolve(result);
      };

      img.onerror = (error) => {
        console.log('❌ Image load error:', error);
        resolve(imageData);
      };

      img.src = imageData;
    });
  };

  const removeBackgroundAggressively = async (
    imageData: string
  ): Promise<string> => {
    console.log('🔥 Starting AGGRESSIVE background removal...', {
      imageDataLength: imageData.length,
    });

    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        console.log('📸 Aggressive mode - Image loaded:', {
          width: img.width,
          height: img.height,
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.log('❌ Aggressive mode - No canvas context');
          resolve(imageData);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        console.log('🎨 Aggressive mode - Processing image data:', {
          totalPixels: data.length / 4,
          width: canvas.width,
          height: canvas.height,
        });

        let transparentPixels = 0;

        // Very aggressive white/light background removal
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const brightness = (r + g + b) / 3;
          const maxColor = Math.max(r, g, b);
          const minColor = Math.min(r, g, b);
          const colorRange = maxColor - minColor;

          // Much more aggressive thresholds
          if (
            // Pure white
            (r > 235 && g > 235 && b > 235) ||
            // High brightness with low color variation
            (brightness > 200 && colorRange < 50) ||
            // Light grays and near-whites
            (brightness > 180 && colorRange < 40) ||
            // Any very light color
            (r > 200 && g > 200 && b > 200) ||
            // Near-white with slight tint
            (brightness > 210 &&
              Math.abs(r - g) < 35 &&
              Math.abs(g - b) < 35) ||
            // Very light pastels
            (brightness > 190 && colorRange < 60)
          ) {
            data[i + 3] = 0; // Make transparent
            transparentPixels++;
          }
        }

        // Remove light frames aggressively
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;

          if (
            brightness > 170 &&
            Math.abs(r - g) < 30 &&
            Math.abs(g - b) < 30
          ) {
            data[i + 3] = 0;
            // Don't increment transparentPixels here since we already counted it in the first pass
          }
        }

        console.log('🔥 Aggressive background removal complete:', {
          transparentPixels,
          totalPixels: data.length / 4,
          percentage: Math.round((transparentPixels / (data.length / 4)) * 100),
        });

        ctx.putImageData(imgData, 0, 0);
        const result = canvas.toDataURL('image/png');
        console.log('✅ Aggressive mode - Final result:', {
          resultLength: result.length,
        });
        resolve(result);
      };

      img.onerror = (error) => {
        console.log('❌ Aggressive mode - Image load error:', error);
        resolve(imageData);
      };

      img.src = imageData;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative py-16 mb-4"
        style={{
          background: heroContent.backgroundColor || '#ffffff',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center min-h-[300px] md:min-h-[400px]">
            <div className="lg:col-span-1">
              {/* Left Side - Text Content */}
              <div className="space-y-6 w-full">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight drop-shadow-lg">
                  {heroContent.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed drop-shadow-lg font-medium">
                  {heroContent.description}
                </p>
                <div className="pt-4">
                  <Link
                    href={heroContent.buttonLink}
                    className="bg-orange-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold hover:bg-orange-600 transition-all duration-300 inline-flex items-center text-base md:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 drop-shadow-lg"
                  >
                    {heroContent.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 flex justify-center">
              {/* Right Side - Hero Image or Default Electronics Layout */}
              {heroContent.heroImage ? (
                // Display uploaded hero image
                <div className="relative flex items-center justify-center h-full w-full max-w-full">
                  <img
                    src={processedImages['hero'] || heroContent.heroImage}
                    alt="Hero section image"
                    className={`w-full max-w-[280px] lg:max-w-[350px] h-64 lg:h-80 object-contain ${
                      processedImages['hero'] ? 'opacity-100' : 'opacity-50'
                    }`}
                    style={{ backgroundColor: 'transparent' }}
                  />
                </div>
              ) : (
                // Default electronics layout (your current flat lay)
                <div className="relative flex items-center justify-center h-full w-full max-w-full">
                  <div className="w-full max-w-[320px] lg:max-w-[400px] h-80 lg:h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className="text-center text-gray-400">
                      <svg
                        className="w-20 h-20 mx-auto mb-4 text-blue-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2z"
                        />
                      </svg>
                      <p className="text-lg font-medium text-gray-500">
                        Premium Electronics
                      </p>
                      <p className="text-sm text-gray-400">
                        Discover amazing products
                      </p>
                    </div>
                  </div>
                  {/* Debug info */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    No hero image: {heroContent.heroImage || 'undefined'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="pt-2 pb-4 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-left">
            Categories
          </h2>

          <CategoryGrid />
        </div>
      </section>

      {/* Service Highlights Section */}
      <section className="py-4 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Responsive */}
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <Headphones className="h-8 w-8 text-gray-900" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-gray-900 mb-0.5">
                  Responsive
                </h3>
                <p className="text-xs text-gray-600">
                  Customer service available 24/7
                </p>
              </div>
            </div>

            {/* Secure */}
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <Shield className="h-8 w-8 text-gray-900" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-gray-900 mb-0.5">
                  Secure
                </h3>
                <p className="text-xs text-gray-600">
                  Certified marketplace since 2017
                </p>
              </div>
            </div>

            {/* Shipping */}
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <Truck className="h-8 w-8 text-gray-900" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-gray-900 mb-0.5">
                  Shipping
                </h3>
                <p className="text-xs text-gray-600">
                  Free, fast, and reliable worldwide
                </p>
              </div>
            </div>

            {/* Transparent */}
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <RefreshCw className="h-8 w-8 text-gray-900" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-gray-900 mb-0.5">
                  Transparent
                </h3>
                <p className="text-xs text-gray-600">
                  Hassle-free return policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="pt-8 pb-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Product Categories
            </h2>
            <Link
              href="/shop"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setActiveCategory('featured')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeCategory === 'featured'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Featured Products
              </button>
              <button
                onClick={() => setActiveCategory('new')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeCategory === 'new'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                New Arrivals
              </button>
              <button
                onClick={() => setActiveCategory('trending')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeCategory === 'trending'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Trending
              </button>
              <button
                onClick={() => setActiveCategory('topRated')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeCategory === 'topRated'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Top Rated
              </button>
              <button
                onClick={() => setActiveCategory('bestSeller')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeCategory === 'bestSeller'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Best Sellers
              </button>
            </div>
          </div>

          {/* Product Carousel */}
          <div className="relative">
            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : getCurrentProducts().length > 0 ? (
                getCurrentProducts()
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((product) => {
                    const firstImage = getFirstImage(product.images);
                    const hasDiscount =
                      product.originalPrice &&
                      product.originalPrice > product.price;
                    const discountPercentage = hasDiscount
                      ? Math.round(
                          ((product.originalPrice! - product.price) /
                            product.originalPrice!) *
                            100
                        )
                      : 0;

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                      >
                        <div className="relative">
                          <Link
                            href={`/products/${product.id}`}
                            className="block"
                          >
                            <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden hover:bg-gray-200 transition-colors">
                              {firstImage ? (
                                <ProcessedProductImage
                                  src={firstImage}
                                  alt={product.name}
                                  className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-200"
                                  fallbackClassName="w-full h-full"
                                />
                              ) : (
                                <div className="w-24 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">
                                    No Image
                                  </span>
                                </div>
                              )}
                            </div>
                          </Link>
                          <button
                            onClick={() => {
                              if (isInWishlist(product.id)) {
                                removeFromWishlist(product.id);
                              } else {
                                addToWishlist({
                                  id: product.id,
                                  name: product.name,
                                  price: product.price,
                                  image: getFirstImage(product.images) || '',
                                  category: product.category,
                                  rating: product.rating || 0,
                                });
                              }
                            }}
                            className={`absolute top-2 left-2 p-1.5 rounded-full transition-colors ${
                              isInWishlist(product.id)
                                ? 'text-red-500 bg-white/90 hover:bg-white'
                                : 'text-gray-400 bg-white/90 hover:text-red-500 hover:bg-white'
                            }`}
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                isInWishlist(product.id) ? 'fill-current' : ''
                              }`}
                            />
                          </button>
                          {hasDiscount && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                              {discountPercentage}% OFF
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">
                            <Link
                              href={`/products/${product.id}`}
                              className="hover:text-blue-600"
                            >
                              {product.name}
                            </Link>
                          </h3>
                          <div className="flex items-center mb-2">
                            <StarRating
                              productId={product.id}
                              currentRating={product.rating || 5}
                              readonly={true}
                              size="sm"
                            />
                          </div>
                          {/* Stock Information */}
                          <div className="mb-2">
                            {!product.inStock ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Out of Stock
                              </span>
                            ) : product.stockCount <= 10 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Low Stock ({product.stockCount})
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                In Stock ({product.stockCount})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                {formatPrice(product.price)}
                              </span>
                              {hasDiscount && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.originalPrice!)}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                addItem({
                                  id: product.id,
                                  name: product.name,
                                  price: product.price,
                                  image: getFirstImage(product.images) || '',
                                  stockCount: product.stockCount,
                                })
                              }
                              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200 flex items-center gap-1"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                // No products message
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">
                    No{' '}
                    {activeCategory === 'featured'
                      ? 'featured products'
                      : activeCategory === 'new'
                        ? 'new arrivals'
                        : activeCategory === 'trending'
                          ? 'trending products'
                          : activeCategory === 'topRated'
                            ? 'top rated products'
                            : 'best seller products'}{' '}
                    available at the moment.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination for Main Product Section */}
            {getCurrentProducts().length > 0 && (
              <>
                {console.log('Main Products Debug:', {
                  category: activeCategory,
                  totalProducts: getCurrentProducts().length,
                  currentPage,
                  totalPages: Math.ceil(
                    getCurrentProducts().length / itemsPerPage
                  ),
                })}
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(
                    getCurrentProducts().length / itemsPerPage
                  )}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={getCurrentProducts().length}
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Flash Deals Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Flash Deals for You
            </h2>
            <Link
              href="/shop"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              See All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {flashDealProducts.length > 0 ? (
              flashDealProducts
                .slice(
                  (currentFlashDealsPage - 1) * itemsPerPage,
                  currentFlashDealsPage * itemsPerPage
                )
                .map((product) => {
                  const firstImage = getFirstImage(product.images);
                  const hasDiscount =
                    product.originalPrice &&
                    product.originalPrice > product.price;
                  const discountPercentage = hasDiscount
                    ? Math.round(
                        ((product.originalPrice! - product.price) /
                          product.originalPrice!) *
                          100
                      )
                    : 0;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative">
                        <Link
                          href={`/products/${product.id}`}
                          className="block"
                        >
                          <div className="h-40 sm:h-48 bg-gray-100 flex items-center justify-center overflow-hidden hover:bg-gray-200 transition-colors">
                            {firstImage ? (
                              <ProcessedProductImage
                                src={firstImage}
                                alt={product.name}
                                className="hover:scale-105 transition-transform duration-200 w-full h-full object-contain p-2"
                                fallbackClassName="w-full h-full"
                              />
                            ) : null}
                            <div
                              className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded"
                              style={{
                                display: getFirstImage(product.images)
                                  ? 'none'
                                  : 'flex',
                              }}
                            >
                              <span className="text-gray-500 text-sm sm:text-base">
                                Product Image
                              </span>
                            </div>
                          </div>
                        </Link>
                        <button
                          onClick={() => {
                            if (isInWishlist(product.id)) {
                              removeFromWishlist(product.id);
                            } else {
                              addToWishlist({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: getFirstImage(product.images) || '',
                                category: product.category,
                                rating: product.rating || 0,
                              });
                            }
                          }}
                          className={`absolute top-2 left-2 p-1.5 rounded-full transition-colors z-20 ${
                            isInWishlist(product.id)
                              ? 'text-red-500 bg-white/90 hover:bg-white'
                              : 'text-gray-400 bg-white/90 hover:text-red-500 hover:bg-white'
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isInWishlist(product.id) ? 'fill-current' : ''
                            }`}
                          />
                        </button>
                        {hasDiscount && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium z-10">
                            {discountPercentage}% OFF
                          </div>
                        )}
                        {!product.inStock && (
                          <div className="absolute top-2 left-12 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium z-10">
                            Out of Stock
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
                            currentRating={product.rating || 5}
                            readonly={true}
                            size="md"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            {hasDiscount ? (
                              <>
                                <span className="text-sm sm:text-base font-bold text-gray-900">
                                  {formatPrice(product.price)}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-500 line-through">
                                    {formatPrice(product.originalPrice!)}
                                  </span>
                                  <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded font-medium">
                                    -{discountPercentage}%
                                  </span>
                                </div>
                              </>
                            ) : (
                              <span className="text-base sm:text-lg font-bold text-gray-900">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              addItem({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: getFirstImage(product.images) || '',
                                stockCount: product.stockCount,
                              })
                            }
                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200 flex items-center gap-1"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              // Fallback when no flash deals are available
              <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-5 text-center py-12">
                <p className="text-gray-500">
                  No flash deals available at the moment. Check back soon for
                  amazing offers!
                </p>
              </div>
            )}

            {/* Pagination for Flash Deals Section */}
            {flashDealProducts.length > 0 && (
              <>
                {console.log('Flash Deals Debug:', {
                  totalProducts: flashDealProducts.length,
                  currentPage: currentFlashDealsPage,
                  totalPages: Math.ceil(
                    flashDealProducts.length / itemsPerPage
                  ),
                })}
                <Pagination
                  currentPage={currentFlashDealsPage}
                  totalPages={Math.ceil(
                    flashDealProducts.length / itemsPerPage
                  )}
                  onPageChange={setCurrentFlashDealsPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={flashDealProducts.length}
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Recently Viewed Section */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <RecentlyViewed limit={5} showTitle={true} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {/* K Logo */}
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">K</span>
                </div>
                {/* Brand Name */}
                <h3 className="text-xl font-bold">Kload</h3>
              </div>
              <p className="text-gray-400">
                Your trusted destination for quality products and exceptional
                service.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/shop" className="text-gray-400 hover:text-white">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-400 hover:text-white"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-white"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/shipping"
                    className="text-gray-400 hover:text-white"
                  >
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="text-gray-400 hover:text-white"
                  >
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-white"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {/* Small K Logo */}
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">K</span>
              </div>
              <span className="text-gray-400">
                © 2024 Kload. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
