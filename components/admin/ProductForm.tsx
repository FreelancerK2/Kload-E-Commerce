'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, Upload, Image as ImageIcon, List, Type } from 'lucide-react';
import { parseBulletPoints, bulletPointsToText, hasBulletPoints, convertToBulletPoints } from '@/lib/bullet-point-parser';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  images: string; // JSON array of base64 images
  category: string;
  tags: string;
  inStock: boolean;
  stockCount: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isTopRated?: boolean;
  isFlashDeal?: boolean;
}

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

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
  onError?: (message: string) => void;
  isLoading?: boolean;
}

export default function ProductForm({
  product,
  onSave,
  onCancel,
  onError,
  isLoading = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    discountPercentage: 0,
    images: '[]', // JSON array of base64 images
    category: '',
    tags: '',
    inStock: true,
    stockCount: 0,
    isFeatured: false,
    isNewArrival: false,
    isTrending: false,
    isTopRated: false,
    isFlashDeal: false,
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isBulletMode, setIsBulletMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setIsBulletMode(hasBulletPoints(product.description));
      if (product.images) {
        try {
          const images = JSON.parse(product.images);
          setImagePreviews(Array.isArray(images) ? images : []);
        } catch (error) {
          // If images is not valid JSON, treat it as a single image
          setImagePreviews(product.images ? [product.images] : []);
        }
      }
    }
  }, [product]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          const activeCategories = data.filter((cat: Category) => cat.isActive);
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Auto-calculate price when original price or discount percentage changes
  useEffect(() => {
    if (
      formData.originalPrice &&
      formData.originalPrice > 0 &&
      formData.discountPercentage &&
      formData.discountPercentage > 0
    ) {
      const calculatedPrice =
        formData.originalPrice -
        (formData.originalPrice * formData.discountPercentage) / 100;
      setFormData((prev) => ({ ...prev, price: calculatedPrice }));
    }
  }, [formData.originalPrice, formData.discountPercentage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      onError?.('Product name is required');
      return;
    }

    if (!formData.description.trim()) {
      onError?.('Product description is required');
      return;
    }

    if (formData.price <= 0) {
      onError?.('Price must be greater than 0');
      return;
    }

    if (!formData.category) {
      onError?.('Product category is required');
      return;
    }

    console.log('Submitting form data:', formData);
    onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const toggleBulletMode = () => {
    if (isBulletMode) {
      // Convert bullet points back to plain text
      const bulletPoints = parseBulletPoints(formData.description);
      const plainText = bulletPoints.map(point => point.text).join('\n');
      setFormData(prev => ({ ...prev, description: plainText }));
    } else {
      // Convert plain text to bullet points
      const bulletText = convertToBulletPoints(formData.description);
      setFormData(prev => ({ ...prev, description: bulletText }));
    }
    setIsBulletMode(!isBulletMode);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        onError?.('Please select only image files');
        return;
      }

      // Validate file size (max 5MB per file)
      if (file.size > 5 * 1024 * 1024) {
        onError?.('Each file must be less than 5MB');
        return;
      }
    }

    // Limit to 5 images
    if (imagePreviews.length + files.length > 5) {
      onError?.('Maximum 5 images allowed');
      return;
    }

    setUploading(true);
    try {
      const newImages: string[] = [];

      for (const file of files) {
        const result = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });
        newImages.push(result);
      }

      const updatedPreviews = [...imagePreviews, ...newImages];
      setImagePreviews(updatedPreviews);
      setFormData((prev) => ({
        ...prev,
        images: JSON.stringify(updatedPreviews),
      }));
    } catch (error) {
      console.error('Error uploading files:', error);
      onError?.('Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(updatedPreviews);
    setFormData((prev) => ({
      ...prev,
      images: JSON.stringify(updatedPreviews),
    }));
  };

  const removeAllImages = () => {
    setImagePreviews([]);
    setFormData((prev) => ({ ...prev, images: '[]' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
              {formData.originalPrice &&
                formData.originalPrice > 0 &&
                formData.discountPercentage &&
                formData.discountPercentage > 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    💡 Auto-calculated from discount: $
                    {(
                      formData.originalPrice -
                      (formData.originalPrice * formData.discountPercentage) /
                        100
                    ).toFixed(2)}
                  </div>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="Leave empty if no discount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Percentage
              </label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage || ''}
                onChange={handleChange}
                step="1"
                min="0"
                max="100"
                placeholder="0-100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Price Calculator */}
            <div className="col-span-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-3">
                  Price Calculator
                </h4>
                <div className="space-y-2 text-sm">
                  {formData.originalPrice &&
                  formData.originalPrice > 0 &&
                  formData.discountPercentage &&
                  formData.discountPercentage > 0 ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Original Price:</span>
                        <span className="font-medium text-gray-900">
                          ${formData.originalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium text-red-600">
                          -{formData.discountPercentage}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount Amount:</span>
                        <span className="font-medium text-red-600">
                          -$
                          {(
                            (formData.originalPrice *
                              formData.discountPercentage) /
                            100
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer Savings:</span>
                        <span className="font-medium text-green-600">
                          $
                          {(
                            (formData.originalPrice *
                              formData.discountPercentage) /
                            100
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-blue-200 pt-2">
                        <div className="flex justify-between">
                          <span className="text-blue-900 font-semibold">
                            Final Price:
                          </span>
                          <span className="text-blue-900 font-bold text-lg">
                            $
                            {(
                              formData.originalPrice -
                              (formData.originalPrice *
                                formData.discountPercentage) /
                                100
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-blue-700 mt-1">
                          💡 This will be saved as the product's selling price
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const originalPrice = formData.originalPrice || 0;
                            const discountPercentage =
                              formData.discountPercentage || 0;
                            const calculatedPrice =
                              originalPrice -
                              (originalPrice * discountPercentage) / 100;
                            setFormData((prev) => ({
                              ...prev,
                              price: calculatedPrice,
                            }));
                          }}
                          className="w-full mt-3 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          🎯 Auto-calculate Price
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 text-center py-2">
                      💡 Set Original Price and Discount Percentage to see
                      real-time calculation
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Display Categories */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Categories
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isFeatured: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Featured Products
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isNewArrival"
                    checked={formData.isNewArrival || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isNewArrival: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">New Arrivals</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isTrending"
                    checked={formData.isTrending || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isTrending: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Trending</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isTopRated"
                    checked={formData.isTopRated || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isTopRated: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Top Rated</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isFlashDeal"
                    checked={formData.isFlashDeal || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isFlashDeal: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Flash Deal</span>
                </label>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                💡 Select which categories this product should appear in on the
                main page
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Count
              </label>
              <input
                type="number"
                name="stockCount"
                value={formData.stockCount}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <button
                type="button"
                onClick={toggleBulletMode}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  isBulletMode
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {isBulletMode ? (
                  <>
                    <Type className="h-3 w-3" />
                    <span>Plain Text</span>
                  </>
                ) : (
                  <>
                    <List className="h-3 w-3" />
                    <span>Bullet Points</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={isBulletMode ? 6 : 3}
              placeholder={
                isBulletMode
                  ? "Enter bullet points (one per line):\n• Feature 1\n• Feature 2\n• **Bold Feature**"
                  : "Enter product description..."
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
            {isBulletMode && (
              <div className="text-xs text-gray-500 mt-1">
                💡 Use <code>**text**</code> for bold text. Each line will become a bullet point.
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Images (Max 5)
            </label>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Upload area */}
            <div className="space-y-3">
              {imagePreviews.length > 0 ? (
                <div className="space-y-3">
                  {/* Image grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagePreviews.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-50 rounded-lg border border-gray-300 overflow-hidden">
                          <img
                            src={image}
                            alt={`Product preview ${index + 1}`}
                            className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add more images button */}
                  {imagePreviews.length < 5 && (
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {uploading ? 'Uploading...' : 'Add More Images'}
                    </button>
                  )}

                  {/* Remove all button */}
                  <button
                    type="button"
                    onClick={removeAllImages}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove all images
                  </button>
                </div>
              ) : (
                <div
                  onClick={handleUploadClick}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Click to upload images'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB each (Max 5 images)
                  </p>
                </div>
              )}

              {imagePreviews.length === 0 && (
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose Images
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="tag1, tag2, tag3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="inStock"
              checked={formData.inStock}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">In Stock</label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
