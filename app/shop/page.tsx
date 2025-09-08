'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Filter, Grid, List, ChevronDown, Search } from 'lucide-react';

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
  createdAt?: string;
}

// Categories will be dynamically generated from products
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products
    .filter((product: Product) => {
      const categoryMatch =
        selectedCategory === 'All' || product.category === selectedCategory;
      const priceMatch =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      const stockMatch = showOutOfStock || product.inStock;
      const searchMatch =
        searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && priceMatch && stockMatch && searchMatch;
    })
    .sort((a: Product, b: Product) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return (
            new Date(b.createdAt || '').getTime() -
            new Date(a.createdAt || '').getTime()
          );
        default:
          return 0;
      }
    });

  // Generate categories dynamically from products
  const categories = [
    'All',
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  // Debug info
  console.log('Shop page render:', {
    loading,
    productsCount: products.length,
    filteredCount: filteredProducts.length,
    categories: categories,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 rounded-md hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>

              <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selectedCategory === category}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Price Range
                  </h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Stock Status
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showOutOfStock}
                        onChange={(e) => setShowOutOfStock(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Show out of stock items
                      </span>
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setPriceRange([0, 2000]);
                    setShowOutOfStock(true);
                    setSearchQuery('');
                  }}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                {/* Left Side - Product Count */}
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="bg-blue-50 text-blue-700 px-2 py-1.5 rounded-lg">
                    <span className="text-xs sm:text-sm font-medium">
                      Showing {filteredProducts.length} of {products.length}{' '}
                      products
                    </span>
                    {products.length > 0 && (
                      <span className="ml-2 text-xs bg-blue-100 px-1.5 py-0.5 rounded-full">
                        {products.filter((p) => p.inStock).length} in stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Center - Search Bar */}
                <div className="flex items-center gap-2 flex-1 lg:flex-none lg:w-80">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-gray-900 placeholder-gray-500 min-h-[36px] shadow-sm"
                    />
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs px-2 py-1.5 rounded-lg hover:text-gray-800 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Right Side - Sort and View Controls */}
                <div className="flex items-center gap-3">
                  {/* Sort Controls */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                      Sort by:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 min-h-[36px] bg-white shadow-sm"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Mode Controls */}
                  <div className="flex items-center gap-1 bg-gray-50 p-0.5 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-all duration-200 min-h-[36px] min-w-[36px] flex items-center justify-center ${
                        viewMode === 'grid'
                          ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Grid View"
                    >
                      <Grid className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md transition-all duration-200 min-h-[36px] min-w-[36px] flex items-center justify-center ${
                        viewMode === 'list'
                          ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title="List View"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Debug: {products.length} products loaded
                </p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div
                className={`grid gap-4 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'
                    : 'grid-cols-1'
                }`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      rating: 4.5, // Default rating for products
                    }}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found matching your criteria.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Debug: {products.length} total products,{' '}
                  {filteredProducts.length} filtered
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setPriceRange([0, 2000]);
                    setSearchQuery('');
                  }}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 ml-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Reload Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
