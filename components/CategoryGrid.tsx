'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
}

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();

          // Filter only active categories
          const activeCategories = data.filter((cat: Category) => cat.isActive);

          setCategories(activeCategories);
        } else {
          console.error('Failed to fetch categories:', response.status);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-wrap justify-start gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm p-3 text-center animate-pulse"
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-200"></div>
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-start gap-4">
      {categories.map((category) => (
        <Link key={category.id} href={`/shop?category=${category.slug}`}>
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 text-center group cursor-pointer transform hover:scale-105">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden">
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* SVG Icon Fallback */}
              <div
                className={`w-full h-full rounded-full flex items-center justify-center ${category.imageUrl ? 'hidden' : 'flex'}`}
                style={{ backgroundColor: category.color }}
              >
                {category.name === 'Electronics' && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="24" cy="20" r="4" fill="white" opacity="0.9" />
                    <circle cx="32" cy="20" r="4" fill="white" opacity="0.9" />
                    <path d="M20 20h8v2h-8z" fill="white" opacity="0.9" />
                  </svg>
                )}
                {category.name === 'Clothing' && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20 16h8v2h-8z" fill="white" opacity="0.9" />
                    <path d="M18 18h12v2H18z" fill="white" opacity="0.9" />
                    <path d="M16 20h16v2H16z" fill="white" opacity="0.9" />
                  </svg>
                )}
                {category.name === 'Accessories' && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="24" cy="20" r="8" fill="white" opacity="0.9" />
                    <circle cx="24" cy="20" r="6" fill={category.color} />
                  </svg>
                )}
                {category.name === 'Home & Garden' && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M24 16l-8 8v8h16v-8l-8-8z"
                      fill="white"
                      opacity="0.9"
                    />
                    <rect
                      x="22"
                      y="28"
                      width="4"
                      height="8"
                      fill={category.color}
                    />
                  </svg>
                )}
                {category.name === 'Sports' && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="24" cy="24" r="8" fill="white" opacity="0.9" />
                    <circle cx="24" cy="24" r="6" fill={category.color} />
                  </svg>
                )}
                {![
                  'Electronics',
                  'Clothing',
                  'Accessories',
                  'Home & Garden',
                  'Sports',
                ].includes(category.name) && (
                  <span className="text-white font-bold text-lg">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {/* Text Fallback for when image fails */}
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-lg hidden"
                style={{ backgroundColor: category.color }}
              >
                {category.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <span className="text-xs font-medium text-gray-900">
              {category.name}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
