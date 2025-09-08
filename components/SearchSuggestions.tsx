'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Tag } from 'lucide-react';
import Image from 'next/image';

interface SearchSuggestion {
  id: string;
  name: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  rating?: number;
  image?: string;
  type: 'product' | 'category';
}

interface SearchSuggestionsProps {
  query: string;
  isVisible: boolean;
  onSelect: (suggestion: SearchSuggestion) => void;
  onClose: () => void;
}

export default function SearchSuggestions({
  query,
  isVisible,
  onSelect,
  onClose,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(query)}&limit=8`
        );
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, suggestions, selectedIndex, onClose]);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      router.push(`/products/${suggestion.id}`);
    } else {
      router.push(`/shop?category=${encodeURIComponent(suggestion.name)}`);
    }
    onSelect(suggestion);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getFirstImage = (images: string) => {
    try {
      const parsedImages = JSON.parse(images);
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        return parsedImages[0];
      }
    } catch (error) {
      if (images && images.trim() !== '') {
        return images;
      }
    }
    return null;
  };

  if (
    !isVisible ||
    (!loading && suggestions.length === 0 && query.length >= 2)
  ) {
    return null;
  }

  return (
    <div
      ref={suggestionsRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto animate-in slide-in-from-top-2 duration-200"
    >
      {loading ? (
        <div className="p-6 text-center text-gray-600">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500/30 border-t-blue-600"></div>
            <span className="text-sm font-medium">Searching...</span>
          </div>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="py-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`mx-2 mb-1 px-4 py-3 cursor-pointer transition-all duration-200 flex items-center gap-4 rounded-xl ${index === selectedIndex
                  ? 'bg-blue-500/10 border border-blue-200/50 shadow-sm'
                  : 'hover:bg-white/60 hover:shadow-sm'
                }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.type === 'product' ? (
                <>
                  <div className="flex-shrink-0 w-12 h-12 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center overflow-hidden border border-white/30 shadow-sm">
                    {suggestion.image ? (
                      <img
                        src={
                          suggestion.image.startsWith('data:')
                            ? suggestion.image
                            : `data:image/jpeg;base64,${suggestion.image}`
                        }
                        alt={suggestion.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-blue-500/70 flex-shrink-0" />
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {suggestion.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-sm font-bold text-gray-900">
                        {suggestion.price && formatPrice(suggestion.price)}
                      </span>
                      {suggestion.originalPrice &&
                        suggestion.price &&
                        suggestion.originalPrice > suggestion.price && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(suggestion.originalPrice)}
                          </span>
                        )}
                      {suggestion.category && (
                        <span className="text-xs text-blue-600 bg-blue-50/80 px-2 py-1 rounded-lg border border-blue-200/50">
                          {suggestion.category}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50/80 backdrop-blur-sm rounded-xl flex items-center justify-center border border-blue-200/50 shadow-sm">
                    <Tag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <p className="text-sm font-semibold text-gray-800">
                        Browse {suggestion.name}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      View all products in this category
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : query.length >= 2 ? (
        <div className="p-6 text-center text-gray-600">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100/50 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-gray-200/50">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            No products found for "{query}"
          </p>
          <p className="text-xs text-gray-500">
            Try searching with different keywords
          </p>
        </div>
      ) : null}
    </div>
  );
}
