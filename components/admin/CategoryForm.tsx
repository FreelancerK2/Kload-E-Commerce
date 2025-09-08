'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Palette,
  Eye,
  EyeOff,
  Upload,
  XCircle,
} from 'lucide-react';

interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
}

interface CategoryFormProps {
  category?: Category | null;
  onSave: (category: Category) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function CategoryForm({
  category,
  onSave,
  onCancel,
  isEditing = false,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<Category>({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    color: '#3B82F6',
    isActive: true,
    sortOrder: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (category) {
      setFormData(category);
    }
  }, [category]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));
    if (!isEditing) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(name) }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (formData.sortOrder < 0) {
      newErrors.sortOrder = 'Sort order must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  const presetColors = [
    '#3B82F6',
    '#8B5CF6',
    '#10B981',
    '#F97316',
    '#EF4444',
    '#6366F1',
    '#EC4899',
    '#14B8A6',
    '#EAB308',
    '#6B7280',
  ];

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
        setIsUploading(false);
      };
      reader.onerror = () => {
        setUploadError('Failed to read file.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[8px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-black ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Electronics"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-black ${
                errors.slug ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., electronics"
            />
            {errors.slug && (
              <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
            )}
            <p className="text-gray-600 text-xs mt-1">
              URL-friendly version of the name
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-black"
              placeholder="Brief description of the category..."
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Image
            </label>

            {/* Image Preview */}
            {formData.imageUrl && (
              <div className="mb-3 relative">
                <img
                  src={formData.imageUrl}
                  alt="Category preview"
                  className="w-32 h-24 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Upload Controls */}
            <div className="flex space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={openFileDialog}
                disabled={isUploading}
                className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Choose Image</span>
                  </>
                )}
              </button>
            </div>

            {/* URL Input (Optional) */}
            <div className="mt-2">
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-black"
                placeholder="Or paste image URL here..."
              />
            </div>

            {/* Error Display */}
            {uploadError && (
              <p className="text-red-500 text-sm mt-1">{uploadError}</p>
            )}

            {/* Help Text */}
            <p className="text-gray-600 text-xs mt-1">
              Upload an image or paste a URL. Max size: 5MB
            </p>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
              />
              <div className="flex space-x-1">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                    className={`w-6 h-6 rounded-full border-2 ${
                      formData.color === color
                        ? 'border-gray-800'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Sort Order
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sortOrder: parseInt(e.target.value) || 0,
                }))
              }
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-100 text-black ${
                errors.sortOrder ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
            />
            {errors.sortOrder && (
              <p className="text-red-500 text-sm mt-1">{errors.sortOrder}</p>
            )}
            <p className="text-gray-600 text-xs mt-1">
              Lower numbers appear first
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
              }
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                formData.isActive
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {formData.isActive ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Inactive</span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Update Category' : 'Create Category'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
