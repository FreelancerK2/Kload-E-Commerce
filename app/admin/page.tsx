'use client';

import { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { isAdminUser } from '@/lib/admin';
import ProductForm from '@/components/admin/ProductForm';
import CategoryForm from '@/components/admin/CategoryForm';
import InvoiceGenerator from '@/components/admin/InvoiceGenerator';
import CustomPopup from '@/components/CustomPopup';
import CustomerAvatar from '@/components/CustomerAvatar';
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  BarChart3,
  Shield,
  X,
  Image as ImageIcon,
  Type,
  Palette,
  Download,
  Home,
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: any[];
  topProducts: any[];
}

export default function AdminDashboard() {
  const { user, isSignedIn } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Products state
  const [products, setProducts] = useState<any[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productLoading, setProductLoading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [orderLoading, setOrderLoading] = useState(false);

  // Customers state
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Content Management state
  const [heroContent, setHeroContent] = useState<{
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    heroImage?: string;
    backgroundColor?: string;
    removeBackground?: boolean;
    aggressiveRemoval?: boolean;
  }>({
    title: 'Your One-Stop Electronic Market',
    subtitle: 'Electronic Market',
    description:
      'Welcome to e-shop, a place where you can buy electronics. Sale every day!',
    buttonText: 'Shop Now',
    buttonLink: '/shop',
    heroImage: '',
    backgroundColor: '#ffffff',
    removeBackground: false,
    aggressiveRemoval: false,
  });
  const [contentLoading, setContentLoading] = useState(false);
  const [contentSaved, setContentSaved] = useState(false);
  const [heroImageUploading, setHeroImageUploading] = useState(false);

  // Image modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProductImage, setSelectedProductImage] = useState<string>('');
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] =
    useState<any>(null);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successType, setSuccessType] = useState<
    'create' | 'update' | 'delete'
  >('create');
  const [countdown, setCountdown] = useState(3);

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Delete confirmation popup state
  const [deletePopup, setDeletePopup] = useState<{
    isOpen: boolean;
    type: 'product' | 'order' | 'customer';
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: 'product',
    id: '',
    name: '',
  });

  useEffect(() => {
    if (isSignedIn) {
      fetchDashboardStats();
      fetchOrders(); // Also fetch orders for the dashboard
      fetchHeroContent(); // Fetch hero content for content management
      fetchCategories(); // Fetch categories for initial load
    } else {
      setLoading(false);
    }
  }, [isSignedIn]);

  // Function to convert base64 to blob URL for better image display
  const convertBase64ToBlobUrl = (base64String: string) => {
    try {
      const byteCharacters = atob(base64String.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error converting base64 to blob:', error);
      return base64String; // Fallback to original
    }
  };

  // Function to compress and resize image
  const compressImage = (
    base64String: string,
    maxWidth: number = 600,
    maxHeight: number = 400,
    quality: number = 0.5
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(base64String);
          return;
        }

        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

        console.log(
          `Image compressed: ${base64String.length} -> ${compressedBase64.length} characters`
        );
        console.log(
          `Dimensions: ${img.naturalWidth}x${img.naturalHeight} -> ${width}x${height}`
        );
        console.log(
          `Compression ratio: ${((1 - compressedBase64.length / base64String.length) * 100).toFixed(1)}%`
        );

        resolve(compressedBase64);
      };
      img.onerror = () => resolve(base64String);
      img.src = base64String;
    });
  };

  // Function for aggressive compression (very small size)
  const aggressiveCompress = (base64String: string): Promise<string> => {
    return compressImage(base64String, 400, 300, 0.3);
  };

  // Auto-close success modal after 3 seconds
  useEffect(() => {
    if (showSuccessModal) {
      setCountdown(3);
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);

      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownTimer);
      };
    }
  }, [showSuccessModal]);

  // Keyboard shortcuts for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSuccessModal) {
          setShowSuccessModal(false);
        }
        if (showErrorModal) {
          setShowErrorModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSuccessModal, showErrorModal]);

  // Fetch data based on active tab
  useEffect(() => {
    if (isSignedIn) {
      switch (activeTab) {
        case 'products':
          fetchProducts();
          break;
        case 'categories':
          fetchCategories();
          break;
        case 'orders':
          fetchOrders();
          break;
        case 'customers':
          fetchCustomers();
          break;
      }
    }
  }, [activeTab, isSignedIn]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error(
          'Admin orders response not ok:',
          response.status,
          response.statusText
        );
        const errorText = await response.text();
        console.error('Error response body:', errorText);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Category management functions
  const handleCategorySave = async (categoryData: any) => {
    try {
      setCategoryLoading(true);
      const url = editingCategory
        ? '/api/admin/categories'
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const requestBody = editingCategory
        ? { ...categoryData, id: editingCategory.id }
        : categoryData;
      console.log('🔄 Saving category:', { method, url, requestBody });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        setShowCategoryForm(false);
        setEditingCategory(null);
        fetchCategories();
        setSuccessMessage(
          editingCategory
            ? 'Category updated successfully!'
            : 'Category created successfully!'
        );
        setSuccessType(editingCategory ? 'update' : 'create');
        setShowSuccessModal(true);
      } else {
        // Get the actual error message from the API response
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to save category';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setSuccessMessage('Failed to save category');
      setSuccessType('create');
      setShowErrorModal(true);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleCategoryDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      setCategoryLoading(true);
      const response = await fetch(`/api/admin/categories?id=${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCategories();
        setSuccessMessage('Category deleted successfully!');
        setSuccessType('delete');
        setShowSuccessModal(true);
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setSuccessMessage('Failed to delete category');
      setSuccessType('create');
      setShowErrorModal(true);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleCategoryEdit = (category: any) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleCategoryCancel = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const fetchCustomers = async () => {
    try {
      setCustomerLoading(true);
      const response = await fetch('/api/admin/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setCustomerLoading(false);
    }
  };

  // Content Management functions
  const handleContentChange = (
    field: string,
    value: string | number | boolean
  ) => {
    console.log('🔄 handleContentChange called:', {
      field,
      value,
      currentHeroContent: heroContent,
    });
    setHeroContent((prev) => {
      const newContent = {
        ...prev,
        [field]: value,
      };
      console.log('🔄 New hero content:', newContent);
      return newContent;
    });
  };

  const removeBackgroundFromImage = (
    imageData: string,
    aggressiveRemoval: boolean = false
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('Starting background removal...', { aggressiveRemoval });

      const img = new Image();
      img.crossOrigin = 'anonymous'; // Handle CORS issues

      img.onload = () => {
        console.log('Image loaded, dimensions:', img.width, 'x', img.height);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        console.log('Processing image data, total pixels:', data.length / 4);

        let removedPixels = 0;

        // First pass: Remove all light backgrounds and frames - MUCH MORE AGGRESSIVE
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Calculate brightness and color difference
          const brightness = (r + g + b) / 3;
          const maxDiff = Math.max(
            Math.abs(r - g),
            Math.abs(g - b),
            Math.abs(r - b)
          );

          // Remove pure white pixels (including frame borders) - MUCH LOWER THRESHOLD
          if (r > 220 && g > 220 && b > 220) {
            data[i + 3] = 0; // Make transparent
            removedPixels++;
          }
          // Remove very light gray/white pixels (including light frames) - MUCH LOWER THRESHOLD
          else if (brightness > 200 && maxDiff < 35) {
            data[i + 3] = 0;
            removedPixels++;
          }
          // Remove light backgrounds and frames with low color variation - MUCH LOWER THRESHOLD
          else if (brightness > 180 && maxDiff < 45) {
            data[i + 3] = 0;
            removedPixels++;
          }
          // Remove off-white and cream colored frames - MUCH LOWER THRESHOLD
          else if (r > 210 && g > 205 && b > 200 && maxDiff < 40) {
            data[i + 3] = 0;
            removedPixels++;
          }
          // Remove light beige/cream frames - MUCH LOWER THRESHOLD
          else if (r > 205 && g > 200 && b > 195 && maxDiff < 35) {
            data[i + 3] = 0;
            removedPixels++;
          }
          // Remove any pixel that's too close to white - MUCH LOWER THRESHOLD
          else if (brightness > 190 && maxDiff < 50) {
            data[i + 3] = 0;
            removedPixels++;
          }
          // Remove any remaining light pixels that might be backgrounds - MUCH LOWER THRESHOLD
          else if (brightness > 170 && maxDiff < 55) {
            data[i + 3] = 0;
            removedPixels++;
          }
          // Remove any pixel that's still too light - CATCH ALL
          else if (brightness > 160 && maxDiff < 60) {
            data[i + 3] = 0;
            removedPixels++;
          }
        }

        console.log('First pass completed, removed pixels:', removedPixels);

        // Second pass: Edge detection for frame removal (always active for better results)
        let edgeRemovedPixels = 0;
        // Look for sharp transitions from product to frame
        for (let y = 1; y < canvas.height - 1; y++) {
          for (let x = 1; x < canvas.width - 1; x++) {
            const idx = (y * canvas.width + x) * 4;

            // Check if current pixel is transparent (already processed)
            if (data[idx + 3] === 0) continue;

            // Get surrounding pixels
            const left = (y * canvas.width + (x - 1)) * 4;
            const right = (y * canvas.width + (x + 1)) * 4;
            const top = ((y - 1) * canvas.width + x) * 4;
            const bottom = ((y + 1) * canvas.width + x) * 4;

            // Calculate edge strength
            const edgeStrength =
              Math.abs(data[idx] - data[left]) +
              Math.abs(data[idx] - data[right]) +
              Math.abs(data[idx] - data[top]) +
              Math.abs(data[idx] - data[bottom]);

            // If pixel is light and has strong edges, it's likely a frame border
            if (
              data[idx] > 200 &&
              data[idx + 1] > 200 &&
              data[idx + 2] > 200 &&
              edgeStrength > 80
            ) {
              data[idx + 3] = 0; // Make transparent
              edgeRemovedPixels++;
            }
          }
        }

        // Enhanced frame detection: Look for white rectangular frames - MUCH MORE AGGRESSIVE
        let frameRemovedPixels = 0;
        const frameThreshold = 180; // MUCH LOWER threshold for frame detection

        // Scan for horizontal frame lines - MORE AGGRESSIVE
        for (let y = 0; y < canvas.height; y++) {
          let consecutiveLightPixels = 0;
          let startX = 0;

          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;

            if (data[idx + 3] > 0) {
              // If pixel is visible
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              if (
                r > frameThreshold &&
                g > frameThreshold &&
                b > frameThreshold
              ) {
                consecutiveLightPixels++;
                if (consecutiveLightPixels === 1) {
                  startX = x;
                }
              } else {
                // If we had a long line of light pixels, it's likely a frame - LOWER THRESHOLD
                if (consecutiveLightPixels > canvas.width * 0.2) {
                  // More than 20% of width (was 30%)
                  for (let fx = startX; fx < x; fx++) {
                    const frameIdx = (y * canvas.width + fx) * 4;
                    if (data[frameIdx + 3] > 0) {
                      data[frameIdx + 3] = 0;
                      frameRemovedPixels++;
                    }
                  }
                }
                consecutiveLightPixels = 0;
              }
            }
          }

          // Check if the entire row is a frame - LOWER THRESHOLD
          if (consecutiveLightPixels > canvas.width * 0.2) {
            for (let fx = startX; fx < canvas.width; fx++) {
              const frameIdx = (y * canvas.width + fx) * 4;
              if (data[frameIdx + 3] > 0) {
                data[frameIdx + 3] = 0;
                frameRemovedPixels++;
              }
            }
          }
        }

        // Scan for vertical frame lines - MORE AGGRESSIVE
        for (let x = 0; x < canvas.width; x++) {
          let consecutiveLightPixels = 0;
          let startY = 0;

          for (let y = 0; y < canvas.height; y++) {
            const idx = (y * canvas.width + x) * 4;

            if (data[idx + 3] > 0) {
              // If pixel is visible
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              if (
                r > frameThreshold &&
                g > frameThreshold &&
                b > frameThreshold
              ) {
                consecutiveLightPixels++;
                if (consecutiveLightPixels === 1) {
                  startY = y;
                }
              } else {
                // If we had a long line of light pixels, it's likely a frame - LOWER THRESHOLD
                if (consecutiveLightPixels > canvas.height * 0.2) {
                  // More than 20% of height (was 30%)
                  for (let fy = startY; fy < y; fy++) {
                    const frameIdx = (fy * canvas.width + x) * 4;
                    if (data[frameIdx + 3] > 0) {
                      data[frameIdx + 3] = 0;
                      frameRemovedPixels++;
                    }
                  }
                }
                consecutiveLightPixels = 0;
              }
            }
          }

          // Check if the entire column is a frame - LOWER THRESHOLD
          if (consecutiveLightPixels > canvas.height * 0.2) {
            for (let fy = startY; fy < canvas.height; fy++) {
              const frameIdx = (fy * canvas.width + x) * 4;
              if (data[frameIdx + 3] > 0) {
                data[frameIdx + 3] = 0;
                frameRemovedPixels++;
              }
            }
          }
        }

        console.log(
          'Frame detection completed, frame-removed pixels:',
          frameRemovedPixels
        );

        console.log(
          'Second pass completed, edge-removed pixels:',
          edgeRemovedPixels
        );

        // Third pass: Remove any remaining light pixels that might be frames
        let finalRemovedPixels = 0;
        if (aggressiveRemoval) {
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // If pixel is still visible and very light, remove it - MORE AGGRESSIVE
            if (data[i + 3] > 0 && r > 180 && g > 180 && b > 180) {
              data[i + 3] = 0;
              finalRemovedPixels++;
            }
          }
          console.log(
            'Third pass completed, final removed pixels:',
            finalRemovedPixels
          );
        }

        // Fourth pass: Final cleanup - remove ANY remaining light pixels (always active)
        let cleanupRemovedPixels = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Remove any pixel that's still too light - MUCH MORE AGGRESSIVE
          if (data[i + 3] > 0 && r > 150 && g > 150 && b > 150) {
            data[i + 3] = 0;
            cleanupRemovedPixels++;
          }
        }
        console.log(
          'Fourth pass (cleanup) completed, cleanup-removed pixels:',
          cleanupRemovedPixels
        );

        // Fifth pass: NUCLEAR OPTION - remove ALL remaining light pixels (always active)
        let nuclearRemovedPixels = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Remove ANY pixel that's still visible and even remotely light
          if (data[i + 3] > 0 && r > 120 && g > 120 && b > 120) {
            data[i + 3] = 0;
            nuclearRemovedPixels++;
          }
        }
        console.log(
          'Fifth pass (nuclear) completed, nuclear-removed pixels:',
          nuclearRemovedPixels
        );

        const totalRemoved =
          removedPixels +
          edgeRemovedPixels +
          frameRemovedPixels +
          finalRemovedPixels +
          cleanupRemovedPixels +
          nuclearRemovedPixels;
        console.log(
          'Total pixels removed:',
          totalRemoved,
          'out of',
          data.length / 4
        );
        console.log(
          'Breakdown: Background:',
          removedPixels,
          'Edge:',
          edgeRemovedPixels,
          'Frame:',
          frameRemovedPixels,
          'Final:',
          finalRemovedPixels,
          'Cleanup:',
          cleanupRemovedPixels,
          'Nuclear:',
          nuclearRemovedPixels
        );

        // Put processed image data back to canvas
        ctx.putImageData(imageData, 0, 0);

        // Convert to PNG with transparency
        try {
          const processedImageData = canvas.toDataURL('image/png');
          console.log('Background removal completed successfully');
          resolve(processedImageData);
        } catch (error) {
          console.error('Error converting canvas to data URL:', error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error('Image failed to load:', error);
        reject(new Error('Failed to load image'));
      };

      img.src = imageData;
    });
  };

  const handleHeroImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file');
      setShowErrorModal(true);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 10MB');
      setShowErrorModal(true);
      return;
    }

    setHeroImageUploading(true);

    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const result = e.target?.result as string;
        if (result.startsWith('data:image/')) {
          try {
            let finalImage = result;

            // Only remove background if toggle is enabled
            if (heroContent.removeBackground) {
              try {
                const processedImage = await removeBackgroundFromImage(
                  result,
                  heroContent.aggressiveRemoval
                );
                finalImage = processedImage;
                console.log(
                  'Hero image uploaded and background removed successfully'
                );
              } catch (error) {
                console.error('Background removal failed:', error);
                console.log('Hero image uploaded (background removal failed)');
              }
            } else {
              console.log('Hero image uploaded successfully');
            }

            setHeroContent((prev) => ({
              ...prev,
              heroImage: finalImage,
            }));
          } catch (error) {
            console.error('Error processing image:', error);
            setErrorMessage('Error processing image');
            setShowErrorModal(true);
          }
        } else {
          setErrorMessage('Invalid image format generated');
          setShowErrorModal(true);
        }
        setHeroImageUploading(false);
      };

      reader.onerror = () => {
        setErrorMessage('Error reading image file');
        setShowErrorModal(true);
        setHeroImageUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      setErrorMessage('Error processing image');
      setShowErrorModal(true);
      setHeroImageUploading(false);
    }

    // Clear input
    event.target.value = '';
  };

  const removeHeroImage = () => {
    setHeroContent((prev) => ({
      ...prev,
      heroImage: '',
    }));
  };

  const saveHeroContent = async () => {
    try {
      setContentLoading(true);
      setContentSaved(false);

      const contentData = {
        section: 'hero',
        title: heroContent.title,
        subtitle: heroContent.subtitle,
        description: heroContent.description,
        buttonText: heroContent.buttonText,
        buttonLink: heroContent.buttonLink,
        heroImage: heroContent.heroImage, // Use heroImage field directly
        backgroundColor: heroContent.backgroundColor,
        removeBackground: heroContent.removeBackground,
        aggressiveRemoval: heroContent.aggressiveRemoval,
      };

      console.log('Saving content:', contentData);

      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contentData),
      });

      const responseData = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', responseData);

      if (response.ok) {
        setContentSaved(true);
        setTimeout(() => setContentSaved(false), 3000);
        console.log('Content saved successfully!');

        // Refresh the content after saving
        await fetchHeroContent();
      } else {
        console.error(
          'Failed to save content:',
          responseData.error || 'Unknown error'
        );
        setErrorMessage(responseData.error || 'Failed to save content');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setErrorMessage('Network error while saving content');
      setShowErrorModal(true);
    } finally {
      setContentLoading(false);
    }
  };

  const resetToDefault = () => {
    setHeroContent({
      title: 'Your One-Stop Electronic Market',
      subtitle: 'Electronic Market',
      description:
        'Welcome to e-shop, a place where you can buy electronics. Sale every day!',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      heroImage: '',
      backgroundColor: '#ffffff',
      removeBackground: false,
      aggressiveRemoval: false,
    });
  };

  const fetchHeroContent = async () => {
    try {
      const response = await fetch('/api/admin/content');
      if (response.ok) {
        const data = await response.json();
        const heroSection = data.content.find(
          (item: any) => item.section === 'hero'
        );

        if (heroSection) {
          setHeroContent({
            title: heroSection.title || 'Your One-Stop Electronic Market',
            subtitle: heroSection.subtitle || 'Electronic Market',
            description:
              heroSection.description ||
              'Welcome to e-shop, a place where you can buy electronics. Sale every day!',
            buttonText: heroSection.buttonText || 'Shop Now',
            buttonLink: heroSection.buttonLink || '/shop',
            heroImage:
              heroSection.heroImage || heroSection.backgroundImage || '', // Use heroImage field directly
            backgroundColor: heroSection.backgroundColor || '#ffffff',
            removeBackground: heroSection.removeBackground || false,
            aggressiveRemoval: heroSection.aggressiveRemoval || false,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
    }
  };

  // Product CRUD functions
  const handleSaveProduct = async (productData: any) => {
    setProductLoading(true);
    try {
      // Validate required fields
      if (
        !productData.name ||
        !productData.description ||
        productData.price <= 0
      ) {
        setErrorMessage(
          'Please fill in all required fields (Name, Description, Price)'
        );
        setShowErrorModal(true);
        setProductLoading(false);
        return;
      }

      const url = editingProduct
        ? '/api/admin/products'
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const body = editingProduct
        ? { ...productData, id: editingProduct.id }
        : productData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        setShowProductForm(false);
        setEditingProduct(null);
        fetchProducts();

        // Show success modal instead of alert
        setSuccessMessage(
          editingProduct
            ? 'Product updated successfully!'
            : 'Product created successfully!'
        );
        setSuccessType(editingProduct ? 'update' : 'create');
        setShowSuccessModal(true);
      } else {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        setErrorMessage(
          `Failed to save product: ${response.status} ${response.statusText}`
        );
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setErrorMessage('Error saving product. Please try again.');
      setShowErrorModal(true);
    } finally {
      setProductLoading(false);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    const product = products.find((p) => p.id === id);
    setDeletePopup({
      isOpen: true,
      type: 'product',
      id,
      name: product?.name || 'this product',
    });
  };

  const confirmDeleteProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products?id=${deletePopup.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProducts();
        setSuccessMessage('Product deleted successfully!');
        setSuccessType('delete');
        setShowSuccessModal(true);
        // Auto-close after 2 seconds without countdown
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      } else {
        setErrorMessage('Failed to delete product. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setErrorMessage('Error deleting product. Please try again.');
      setShowErrorModal(true);
    } finally {
      setDeletePopup({ isOpen: false, type: 'product', id: '', name: '' });
    }
  };

  // Order CRUD functions
  const handleUpdateOrderStatus = async (id: string, status: string) => {
    setOrderLoading(true);
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (response.ok) {
        fetchOrders();
        // Refresh dashboard stats to update Recent Orders
        fetchDashboardStats();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    const order = orders.find((o) => o.id === id);
    setDeletePopup({
      isOpen: true,
      type: 'order',
      id,
      name: `Order #${order?.id || id}`,
    });
  };

  const confirmDeleteOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders?id=${deletePopup.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchOrders();
        // Refresh dashboard stats to update Recent Orders
        fetchDashboardStats();
        setSuccessMessage('Order deleted successfully!');
        setSuccessType('delete');
        setShowSuccessModal(true);
        // Auto-close after 2 seconds without countdown
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      } else {
        setErrorMessage('Failed to delete order. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setErrorMessage('Error deleting order. Please try again.');
      setShowErrorModal(true);
    } finally {
      setDeletePopup({ isOpen: false, type: 'order', id: '', name: '' });
    }
  };

  // Customer CRUD functions
  const handleDeleteCustomer = async (id: string) => {
    const customer = customers.find((c) => c.id === id);
    setDeletePopup({
      isOpen: true,
      type: 'customer',
      id,
      name: customer?.firstName
        ? `${customer.firstName} ${customer.lastName}`
        : 'this customer',
    });
  };

  const confirmDeleteCustomer = async () => {
    try {
      const response = await fetch(
        `/api/admin/customers?id=${deletePopup.id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        fetchCustomers();
        setSuccessMessage('Customer deleted successfully!');
        setSuccessType('delete');
        setShowSuccessModal(true);
        // Auto-close after 2 seconds without countdown
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      } else {
        setErrorMessage('Failed to delete customer. Please try again.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      setErrorMessage('Error deleting customer. Please try again.');
      setShowErrorModal(true);
    } finally {
      setDeletePopup({ isOpen: false, type: 'customer', id: '', name: '' });
    }
  };

  // Image modal functions
  const handleViewProductImage = (order: any) => {
    // Get the first product from the order items
    const firstItem = order.items?.[0];
    if (firstItem?.image) {
      setSelectedProductImage(firstItem.image);
      setSelectedProductName(firstItem.name || 'Product Image');
      setSelectedOrder(order);
      setShowImageModal(true);
    } else {
      alert('No product image available for this order.');
    }
  };

  const handleGenerateInvoice = (order: any) => {
    setSelectedOrderForInvoice(order);
    setShowInvoiceModal(true);
  };

  const handleCloseInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedOrderForInvoice(null);
  };

  const handleExportReport = () => {
    try {
      // Prepare CSV data
      const csvData = [];

      // Add header
      csvData.push(['Report Type', 'Value']);

      // Add sales overview data
      csvData.push([
        'Monthly Revenue',
        `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`,
      ]);
      csvData.push(['Total Orders', stats?.totalOrders || 0]);
      csvData.push(['Total Customers', stats?.totalCustomers || 0]);
      csvData.push(['Total Products', stats?.totalProducts || 0]);

      // Add empty row
      csvData.push([]);

      // Add top products header
      csvData.push(['Top Products Report']);
      csvData.push(['Rank', 'Product Name', 'Category', 'Price', 'Stock']);

      // Add top products data
      products.slice(0, 5).forEach((product, index) => {
        csvData.push([
          index + 1,
          product.name,
          product.category,
          `$${product.price.toFixed(2)}`,
          product.stockCount,
        ]);
      });

      // Add empty row
      csvData.push([]);

      // Add recent orders header
      csvData.push(['Recent Orders Report']);
      csvData.push(['Order ID', 'Customer', 'Total', 'Status', 'Date']);

      // Add recent orders data
      orders.slice(0, 5).forEach((order) => {
        const customerName = order.user
          ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim()
          : 'Guest';
        csvData.push([
          order.id.slice(-8),
          customerName,
          `$${order.total.toFixed(2)}`,
          order.status,
          new Date(order.createdAt).toLocaleDateString(),
        ]);
      });

      // Convert to CSV string
      const csvString = csvData
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `kload-report-${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message
      setSuccessMessage('Report exported successfully!');
      setSuccessType('create');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  // Check if user is admin using centralized admin control
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = isSignedIn && isAdminUser(userEmail);

  // Function to get file size in human readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Function to validate file before upload
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        isValid: false,
        error: 'Please select a valid image file (JPG, PNG, GIF, etc.)',
      };
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        error: `File size (${formatFileSize(file.size)}) exceeds the maximum limit of 10MB`,
      };
    }

    // Check if file is empty
    if (file.size === 0) {
      return { isValid: false, error: 'File appears to be empty' };
    }

    return { isValid: true };
  };

  // Function to debug hero content state

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'categories', name: 'Categories', icon: Palette },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'reports', name: 'Reports', icon: FileText },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'content', name: 'Content Management', icon: Type },
  ];

  return (
    <AdminLayout>
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Left side - Logo and Admin Badge */}
            <div className="flex items-center space-x-1 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-7 h-7 sm:w-10 sm:h-10 bg-black rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm sm:text-xl font-bold">
                    K
                  </span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-sm sm:text-xl font-bold text-gray-900">
                    Kload Admin
                  </h1>
                  <span className="text-xs text-gray-600 font-medium hidden sm:block">
                    Administration Panel
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - User Info and Actions */}
            <div className="flex items-center space-x-1 sm:space-x-4">
              {/* Back to Store */}
              <Link
                href="/"
                className="flex items-center space-x-1 px-2 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all duration-300"
                title="Back to Store"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">
                  Store
                </span>
              </Link>

              {/* User Info */}
              {isClient && user && (
                <div className="flex items-center space-x-1 sm:space-x-3">
                  <div className="hidden lg:block text-sm font-medium text-gray-900">
                    {user.firstName || user.emailAddresses?.[0]?.emailAddress}
                  </div>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: 'w-6 h-6 sm:w-8 sm:h-8',
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6 lg:py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 min-w-fit ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Orders
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {stats?.totalOrders || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Revenue
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                    <Package className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Products
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {stats?.totalProducts || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
                  </div>
                  <div className="ml-2 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      Customers
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">
                      {stats?.totalCustomers || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Customer
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Date
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderLoading && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 sm:px-6 py-4 text-center"
                        >
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            <span className="text-sm text-gray-600">
                              Updating...
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3 overflow-hidden">
                              {(() => {
                                const imageData = order.items?.[0]?.image;
                                if (imageData && imageData.trim() !== '') {
                                  try {
                                    // Try to parse as JSON first (for array of images)
                                    const parsedImages = JSON.parse(imageData);
                                    if (
                                      Array.isArray(parsedImages) &&
                                      parsedImages.length > 0
                                    ) {
                                      const firstImage = parsedImages[0];
                                      return (
                                        <img
                                          src={
                                            firstImage.startsWith('data:')
                                              ? firstImage
                                              : `data:image/jpeg;base64,${firstImage}`
                                          }
                                          alt={
                                            order.items?.[0]?.name || 'Product'
                                          }
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            console.log(
                                              'Error loading image for order:',
                                              order.id
                                            );
                                            const target =
                                              e.currentTarget as HTMLElement;
                                            target.style.display = 'none';
                                            const fallback =
                                              target.nextElementSibling as HTMLElement;
                                            if (fallback)
                                              fallback.style.display = 'flex';
                                          }}
                                        />
                                      );
                                    }
                                  } catch (error) {
                                    // If not valid JSON, treat as single image
                                    return (
                                      <img
                                        src={
                                          imageData.startsWith('data:')
                                            ? imageData
                                            : `data:image/jpeg;base64,${imageData}`
                                        }
                                        alt={
                                          order.items?.[0]?.name || 'Product'
                                        }
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          console.log(
                                            'Error loading image for order:',
                                            order.id
                                          );
                                          const target =
                                            e.currentTarget as HTMLElement;
                                          target.style.display = 'none';
                                          const fallback =
                                            target.nextElementSibling as HTMLElement;
                                          if (fallback)
                                            fallback.style.display = 'flex';
                                        }}
                                      />
                                    );
                                  }
                                }
                                return null;
                              })()}
                              <div
                                className="w-full h-full flex items-center justify-center text-gray-400 text-xs"
                                style={{
                                  display: (() => {
                                    const imageData = order.items?.[0]?.image;
                                    if (imageData && imageData.trim() !== '') {
                                      try {
                                        const parsedImages =
                                          JSON.parse(imageData);
                                        return Array.isArray(parsedImages) &&
                                          parsedImages.length > 0
                                          ? 'none'
                                          : 'flex';
                                      } catch (error) {
                                        return 'none';
                                      }
                                    }
                                    return 'flex';
                                  })(),
                                }}
                              >
                                <ImageIcon className="h-4 w-4" />
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                #{order.id.slice(-8)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.items?.[0]?.name || 'Product'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                          {order.user?.firstName} {order.user?.lastName}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              order.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'PAID'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'SHIPPED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : order.status === 'DELIVERED'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium hidden lg:table-cell">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleGenerateInvoice(order)}
                              className="text-green-600 hover:text-green-900"
                              title="Generate Invoice"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleViewProductImage(order)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Order Details & Product Image"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Order"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Products</h3>
              <button
                onClick={() => setShowProductForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    return (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                              {(() => {
                                const imageData = product.images;
                                if (imageData && imageData.trim() !== '') {
                                  try {
                                    // Try to parse as JSON first (for array of images)
                                    const parsedImages = JSON.parse(imageData);
                                    if (
                                      Array.isArray(parsedImages) &&
                                      parsedImages.length > 0
                                    ) {
                                      const firstImage = parsedImages[0];
                                      return (
                                        <img
                                          src={
                                            firstImage.startsWith('data:')
                                              ? firstImage
                                              : `data:image/jpeg;base64,${firstImage}`
                                          }
                                          alt={product.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            const target =
                                              e.currentTarget as HTMLElement;
                                            target.style.display = 'none';
                                            const fallback =
                                              target.nextElementSibling as HTMLElement;
                                            if (fallback)
                                              fallback.style.display = 'flex';
                                          }}
                                        />
                                      );
                                    }
                                  } catch (error) {
                                    // If not valid JSON, treat as single image
                                    return (
                                      <img
                                        src={
                                          imageData.startsWith('data:')
                                            ? imageData
                                            : `data:image/jpeg;base64,${imageData}`
                                        }
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target =
                                            e.currentTarget as HTMLElement;
                                          target.style.display = 'none';
                                          const fallback =
                                            target.nextElementSibling as HTMLElement;
                                          if (fallback)
                                            fallback.style.display = 'flex';
                                        }}
                                      />
                                    );
                                  }
                                }
                                return null;
                              })()}
                              <div
                                className="w-full h-full flex items-center justify-center text-gray-400 text-xs"
                                style={{
                                  display: (() => {
                                    const imageData = product.images;
                                    if (imageData && imageData.trim() !== '') {
                                      try {
                                        const parsedImages =
                                          JSON.parse(imageData);
                                        return Array.isArray(parsedImages) &&
                                          parsedImages.length > 0
                                          ? 'none'
                                          : 'flex';
                                      } catch (error) {
                                        return 'none';
                                      }
                                    }
                                    return 'flex';
                                  })(),
                                }}
                              >
                                <ImageIcon className="h-6 w-6" />
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.description.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex flex-col">
                            {product.originalPrice &&
                            product.originalPrice > product.price ? (
                              <>
                                <span className="font-medium text-gray-900">
                                  ${product.price.toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-500 line-through">
                                  ${product.originalPrice.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="font-medium text-gray-900">
                                ${product.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.originalPrice &&
                          product.originalPrice > product.price ? (
                            <div className="flex flex-col">
                              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded font-medium">
                                -
                                {Math.round(
                                  ((product.originalPrice - product.price) /
                                    product.originalPrice) *
                                    100
                                )}
                                %
                              </span>
                              {product.discountPercentage && (
                                <span className="text-xs text-gray-500 mt-1">
                                  Set: {product.discountPercentage}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">No discount</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stockCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              product.inStock && product.stockCount > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.inStock && product.stockCount > 0
                              ? 'In Stock'
                              : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Categories
              </h3>
              <button
                onClick={() => setShowCategoryForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Color
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sort Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                            {category.imageUrl ? (
                              <img
                                src={category.imageUrl}
                                alt={category.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLElement;
                                  target.style.display = 'none';
                                  const fallback =
                                    target.nextElementSibling as HTMLElement;
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
                                  <circle
                                    cx="24"
                                    cy="20"
                                    r="4"
                                    fill="white"
                                    opacity="0.9"
                                  />
                                  <circle
                                    cx="32"
                                    cy="20"
                                    r="4"
                                    fill="white"
                                    opacity="0.9"
                                  />
                                  <path
                                    d="M20 20h8v2h-8z"
                                    fill="white"
                                    opacity="0.9"
                                  />
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
                                  <path
                                    d="M20 16h8v2h-8z"
                                    fill="white"
                                    opacity="0.9"
                                  />
                                  <path
                                    d="M18 18h12v2H18z"
                                    fill="white"
                                    opacity="0.9"
                                  />
                                  <path
                                    d="M16 20h16v2H16z"
                                    fill="white"
                                    opacity="0.9"
                                  />
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
                                  <circle
                                    cx="24"
                                    cy="20"
                                    r="8"
                                    fill="white"
                                    opacity="0.9"
                                  />
                                  <circle
                                    cx="24"
                                    cy="20"
                                    r="6"
                                    fill={category.color}
                                  />
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
                                  <circle
                                    cx="24"
                                    cy="24"
                                    r="8"
                                    fill="white"
                                    opacity="0.9"
                                  />
                                  <circle
                                    cx="24"
                                    cy="24"
                                    r="6"
                                    fill={category.color}
                                  />
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
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            {category.description && (
                              <div className="text-sm text-gray-500">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm text-gray-900">
                            {category.color}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.sortOrder}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            category.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleCategoryEdit(category)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCategoryDelete(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                            {(() => {
                              const imageData = order.items?.[0]?.image;
                              if (imageData && imageData.trim() !== '') {
                                try {
                                  // Try to parse as JSON first (for array of images)
                                  const parsedImages = JSON.parse(imageData);
                                  if (
                                    Array.isArray(parsedImages) &&
                                    parsedImages.length > 0
                                  ) {
                                    const firstImage = parsedImages[0];
                                    return (
                                      <img
                                        src={
                                          firstImage.startsWith('data:')
                                            ? firstImage
                                            : `data:image/jpeg;base64,${firstImage}`
                                        }
                                        alt={
                                          order.items?.[0]?.name || 'Product'
                                        }
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          console.log(
                                            'Error loading image for order:',
                                            order.id
                                          );
                                          const target =
                                            e.currentTarget as HTMLElement;
                                          target.style.display = 'none';
                                          const fallback =
                                            target.nextElementSibling as HTMLElement;
                                          if (fallback)
                                            fallback.style.display = 'flex';
                                        }}
                                      />
                                    );
                                  }
                                } catch (error) {
                                  // If not valid JSON, treat as single image
                                  return (
                                    <img
                                      src={
                                        imageData.startsWith('data:')
                                          ? imageData
                                          : `data:image/jpeg;base64,${imageData}`
                                      }
                                      alt={order.items?.[0]?.name || 'Product'}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        console.log(
                                          'Error loading image for order:',
                                          order.id
                                        );
                                        const target =
                                          e.currentTarget as HTMLElement;
                                        target.style.display = 'none';
                                        const fallback =
                                          target.nextElementSibling as HTMLElement;
                                        if (fallback)
                                          fallback.style.display = 'flex';
                                      }}
                                    />
                                  );
                                }
                              }
                              return null;
                            })()}
                            <div
                              className="w-full h-full flex items-center justify-center text-gray-400 text-xs"
                              style={{
                                display: (() => {
                                  const imageData = order.items?.[0]?.image;
                                  if (imageData && imageData.trim() !== '') {
                                    try {
                                      const parsedImages =
                                        JSON.parse(imageData);
                                      return Array.isArray(parsedImages) &&
                                        parsedImages.length > 0
                                        ? 'none'
                                        : 'flex';
                                    } catch (error) {
                                      return 'none';
                                    }
                                  }
                                  return 'flex';
                                })(),
                              }}
                            >
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{order.id.slice(-8)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.items?.[0]?.name || 'Product'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.user?.firstName} {order.user?.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order.id, e.target.value)
                          }
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${
                            order.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'PAID'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'SHIPPED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'DELIVERED'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CustomerAvatar
                            imageUrl={customer.imageUrl}
                            firstName={customer.firstName}
                            lastName={customer.lastName}
                            email={customer.email}
                            size="md"
                            className="mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {customer.firstName} {customer.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.orders?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        $
                        {customer.orders
                          ?.reduce(
                            (sum: number, order: any) => sum + order.total,
                            0
                          )
                          .toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Sales Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sales Overview
                </h3>
                <button
                  onClick={handleExportReport}
                  className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Report</span>
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">
                          Monthly Revenue
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <ShoppingCart className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">
                          Total Orders
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {stats?.totalOrders || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">
                          Total Customers
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          {stats?.totalCustomers || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Products
                </h3>
              </div>
              <div className="p-6">
                {products.length > 0 ? (
                  <div className="space-y-4">
                    {products.slice(0, 5).map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-gray-400 mr-4">
                            #{index + 1}
                          </span>
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                            {(() => {
                              const imageData = product.images;
                              if (imageData && imageData.trim() !== '') {
                                try {
                                  const parsedImages = JSON.parse(imageData);
                                  if (
                                    Array.isArray(parsedImages) &&
                                    parsedImages.length > 0
                                  ) {
                                    const firstImage = parsedImages[0];
                                    return (
                                      <img
                                        src={
                                          firstImage.startsWith('data:')
                                            ? firstImage
                                            : `data:image/jpeg;base64,${firstImage}`
                                        }
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    );
                                  }
                                } catch (error) {
                                  return (
                                    <img
                                      src={
                                        imageData.startsWith('data:')
                                          ? imageData
                                          : `data:image/jpeg;base64,${imageData}`
                                      }
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  );
                                }
                              }
                              return (
                                <ImageIcon className="h-4 w-4 text-gray-400" />
                              );
                            })()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {product.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${product.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Stock: {product.stockCount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No products available
                  </p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                {orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Order #{order.id.slice(-8)} placed
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${order.total.toFixed(2)}
                          </p>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              order.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.status === 'PAID'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'SHIPPED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : order.status === 'DELIVERED'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No recent orders
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Store Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Store Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Kload E-commerce Store"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Email
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@kload.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Address
                    </label>
                    <input
                      type="text"
                      defaultValue="123 Commerce St, Business City, BC 12345"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Save Store Information
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notification Settings
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        New Order Notifications
                      </p>
                      <p className="text-sm text-gray-500">
                        Receive notifications when new orders are placed
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Low Stock Alerts
                      </p>
                      <p className="text-sm text-gray-500">
                        Get notified when products are running low on stock
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Customer Support Emails
                      </p>
                      <p className="text-sm text-gray-500">
                        Receive customer support inquiries via email
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Save Notification Settings
                  </button>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  System Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Database Status</p>
                    <p className="font-medium text-green-600">Connected</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="font-medium text-gray-900">
                      {stats?.totalProducts || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="font-medium text-gray-900">
                      {stats?.totalOrders || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Customers</p>
                    <p className="font-medium text-gray-900">
                      {stats?.totalCustomers || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Management Tab */}
        {activeTab === 'content' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Type className="h-5 w-5 mr-2" />
                    Hero Section Content
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage the main hero section text and visual elements
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Heading
                  </label>
                  <input
                    type="text"
                    value={heroContent.title}
                    onChange={(e) =>
                      handleContentChange('title', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Heading
                  </label>
                  <input
                    type="text"
                    value={heroContent.subtitle}
                    onChange={(e) => {
                      console.log('📝 Subtitle input onChange:', {
                        value: e.target.value,
                        currentHeroContent: heroContent,
                      });
                      handleContentChange('subtitle', e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={heroContent.buttonText}
                    onChange={(e) =>
                      handleContentChange('buttonText', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={heroContent.buttonLink}
                    onChange={(e) =>
                      handleContentChange('buttonLink', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description Text
                  </label>
                  <textarea
                    rows={3}
                    value={heroContent.description}
                    onChange={(e) =>
                      handleContentChange('description', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Hero Image Upload Section */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Section Image
                  </label>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload an image to display on the right side of the hero
                    section. This will replace the default electronics layout.
                  </p>

                  {/* Background Removal Toggle */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={heroContent.removeBackground || false}
                          onChange={(e) =>
                            handleContentChange(
                              'removeBackground',
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Remove white/light background automatically
                        </span>
                      </label>
                      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        Makes images transparent for better integration
                      </div>
                    </div>

                    {/* Advanced Background Removal Options */}
                    {heroContent.removeBackground && (
                      <div className="ml-6 space-y-2">
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={heroContent.aggressiveRemoval || false}
                              onChange={(e) =>
                                handleContentChange(
                                  'aggressiveRemoval',
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-xs text-gray-600">
                              Aggressive frame removal (removes product
                              borders/frames)
                            </span>
                          </label>
                        </div>
                        <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                          ⚠️ May affect product edges. Use for images with white
                          frames/borders.
                        </div>
                      </div>
                    )}
                  </div>

                  {heroContent.heroImage ? (
                    <div className="space-y-4">
                      {/* Image Preview */}
                      <div className="relative">
                        <img
                          src={heroContent.heroImage}
                          alt="Hero section image"
                          className="w-full max-w-md h-auto rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={removeHeroImage}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg border-2 border-white z-10"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Image Info */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">
                          Image uploaded successfully. Click the X button to
                          remove it.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <ImageIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Upload Hero Image
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Choose an image to display on the right side of the
                            hero section. Supports JPG, PNG, GIF up to 10MB.
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageUpload}
                          className="hidden"
                          id="hero-image-upload"
                          disabled={heroImageUploading}
                        />
                        <label
                          htmlFor="hero-image-upload"
                          className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer inline-flex items-center space-x-2 ${
                            heroImageUploading
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {heroImageUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>
                                {heroContent.removeBackground
                                  ? heroContent.aggressiveRemoval
                                    ? 'Removing background & frames...'
                                    : 'Removing background...'
                                  : 'Processing...'}
                              </span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-5 w-5" />
                              <span>Choose Image</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Background Color Section */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Section Background Color
                  </label>
                  <p className="text-sm text-gray-500 mb-4">
                    Choose a background color for the hero section. This will be
                    applied behind the text content.
                  </p>

                  {/* Preset Color Palette */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Quick Color Presets
                    </h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                      {/* Neutral Colors */}
                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange('backgroundColor', '#ffffff')
                        }
                        className={`group relative p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor === '#ffffff'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-6 bg-white rounded-lg border border-gray-200 mb-1"></div>
                        <span className="text-xs font-medium text-gray-700">
                          White
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange('backgroundColor', '#f8fafc')
                        }
                        className={`group relative p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor === '#f8fafc'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 bg-slate-50 rounded-lg border border-gray-200 mb-2"></div>
                        <span className="text-xs font-medium text-gray-700">
                          Slate
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange('backgroundColor', '#f3f4f6')
                        }
                        className={`group relative p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor === '#f3f4f6'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 bg-gray-100 rounded-lg border border-gray-200 mb-2"></div>
                        <span className="text-xs font-medium text-gray-700">
                          Light Gray
                        </span>
                      </button>

                      {/* Warm Colors */}
                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange('backgroundColor', '#fef3c7')
                        }
                        className={`group relative p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor === '#fef3c7'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 bg-amber-100 rounded-lg border border-gray-200 mb-2"></div>
                        <span className="text-xs font-medium text-gray-700">
                          Light Yellow
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange('backgroundColor', '#fef2f2')
                        }
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor === '#fef2f2'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 bg-red-50 rounded-lg border border-gray-200 mb-2"></div>
                        <span className="text-xs font-medium text-gray-700">
                          Light Red
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange('backgroundColor', '#f0fdf4')
                        }
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor === '#f0fdf4'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 bg-green-50 rounded-lg border border-gray-200 mb-2"></div>
                        <span className="text-xs font-medium text-gray-700">
                          Light Green
                        </span>
                      </button>

                      {/* Cool Colors */}
                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange('backgroundColor', '#dbeafe')
                        }
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor === '#dbeafe'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 bg-blue-200 rounded-lg border border-gray-200 mb-2"></div>
                        <span className="text-xs font-medium text-gray-700">
                          Light Blue
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange('backgroundColor', '#e0e7ff')
                        }
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor === '#e0e7ff'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 bg-indigo-200 rounded-lg border border-gray-200 mb-2"></div>
                        <span className="text-xs font-medium text-gray-700">
                          Light Indigo
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange('backgroundColor', '#f3e8ff')
                        }
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor === '#f3e8ff'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-8 bg-purple-200 rounded-lg border border-gray-200 mb-2"></div>
                        <span className="text-xs font-medium text-gray-700">
                          Light Purple
                        </span>
                      </button>

                      {/* Gradient Options */}
                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange(
                            'backgroundColor',
                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          )
                        }
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor ===
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-2"
                          style={{
                            background:
                              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }}
                        ></div>
                        <span className="text-xs font-medium text-gray-700">
                          Blue-Purple
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange(
                            'backgroundColor',
                            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                          )
                        }
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor ===
                          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-2"
                          style={{
                            background:
                              'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          }}
                        ></div>
                        <span className="text-xs font-medium text-gray-700">
                          Pink-Red
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange(
                            'backgroundColor',
                            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                          )
                        }
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor ===
                          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-2"
                          style={{
                            background:
                              'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          }}
                        ></div>
                        <span className="text-xs font-medium text-gray-700">
                          Blue-Cyan
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange(
                            'backgroundColor',
                            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                          )
                        }
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor ===
                          'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-2"
                          style={{
                            background:
                              'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                          }}
                        ></div>
                        <span className="text-xs font-medium text-gray-700">
                          Mint-Pink
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange(
                            'backgroundColor',
                            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
                          )
                        }
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor ===
                          'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-2"
                          style={{
                            background:
                              'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                          }}
                        ></div>
                        <span className="text-xs font-medium text-gray-700">
                          Peach-Orange
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange(
                            'backgroundColor',
                            'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
                          )
                        }
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor ===
                          'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-2"
                          style={{
                            background:
                              'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                          }}
                        ></div>
                        <span className="text-xs font-medium text-gray-700">
                          Lavender-Cream
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange(
                            'backgroundColor',
                            'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
                          )
                        }
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor ===
                          'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-2"
                          style={{
                            background:
                              'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
                          }}
                        ></div>
                        <span className="text-xs font-medium text-gray-700">
                          Cyan-Blue
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange(
                            'backgroundColor',
                            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                          )
                        }
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor ===
                          'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-2"
                          style={{
                            background:
                              'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                          }}
                        ></div>
                        <span className="text-xs font-medium text-gray-700">
                          Pink-Yellow
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleContentChange(
                            'backgroundColor',
                            'linear-gradient(135deg, #a8caba 0%, #5d4e75 100%)'
                          )
                        }
                        className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          heroContent.backgroundColor ===
                          'linear-gradient(135deg, #a8caba 0%, #5d4e75 100%)'
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-2"
                          style={{
                            background:
                              'linear-gradient(135deg, #a8caba 0%, #5d4e75 100%)',
                          }}
                        ></div>
                        <span className="text-xs font-medium text-gray-700">
                          Sage-Purple
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Color Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Current Selection
                        </p>
                        <p className="text-xs text-gray-500">
                          {heroContent.backgroundColor?.startsWith(
                            'linear-gradient'
                          )
                            ? 'Gradient Background'
                            : 'Solid Color Background'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          {heroContent.backgroundColor || '#ffffff'}
                        </p>
                        <p className="text-xs text-gray-500">Hex Code</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={resetToDefault}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Reset to Default
                </button>
                <button
                  onClick={saveHeroContent}
                  disabled={contentLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {contentLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              {/* Success Notification Popup */}
              {contentSaved && (
                <div className="fixed top-4 right-4 z-50 transform transition-all duration-500 ease-out animate-bounce-in">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-green-400/20 backdrop-blur-sm hover:shadow-green-500/25 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-3">
                      {/* Success Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Success Message */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-lg">
                          🎉 Success!
                        </h4>
                        <p className="text-green-100 text-sm">
                          Hero content saved successfully
                        </p>
                      </div>

                      {/* Close Button */}
                      <button
                        onClick={() => setContentSaved(false)}
                        className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
                        title="Close notification"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="mt-3 w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-white h-1.5 rounded-full transition-all duration-3000 ease-linear"
                        style={{
                          width: '100%',
                          animation: 'progressShrink 3s ease-in-out forwards',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <ProductForm
            product={editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => {
              setShowProductForm(false);
              setEditingProduct(null);
            }}
            onError={(message) => {
              setErrorMessage(message);
              setShowErrorModal(true);
            }}
            isLoading={productLoading}
          />
        )}

        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Order Details & Product Image
                </h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Image Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Product Image
                  </h4>
                  <div className="flex justify-center">
                    <img
                      src={(() => {
                        const imageData = selectedProductImage;
                        if (imageData && imageData.trim() !== '') {
                          try {
                            // Try to parse as JSON first (for array of images)
                            const parsedImages = JSON.parse(imageData);
                            if (
                              Array.isArray(parsedImages) &&
                              parsedImages.length > 0
                            ) {
                              const firstImage = parsedImages[0];
                              return firstImage.startsWith('data:')
                                ? firstImage
                                : `data:image/jpeg;base64,${firstImage}`;
                            }
                          } catch (error) {
                            // If not valid JSON, treat as single image
                            return imageData.startsWith('data:')
                              ? imageData
                              : `data:image/jpeg;base64,${imageData}`;
                          }
                        }
                        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjI1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                      })()}
                      alt={selectedProductName}
                      className="max-w-full max-h-96 object-contain rounded-lg shadow-lg border border-gray-200 bg-gray-50"
                      onError={(e) => {
                        e.currentTarget.src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjI1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    {selectedProductName}
                  </p>
                </div>

                {/* Order Information Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Order Information
                  </h4>
                  {selectedOrder && (
                    <div className="space-y-4">
                      {/* Order Basic Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">
                          Order Details
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-900">Order ID:</span>
                            <span className="font-medium text-gray-900">
                              #{selectedOrder.id.slice(-8)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-900">Status:</span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                selectedOrder.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : selectedOrder.status === 'PAID'
                                    ? 'bg-green-100 text-green-800'
                                    : selectedOrder.status === 'SHIPPED'
                                      ? 'bg-blue-100 text-blue-800'
                                      : selectedOrder.status === 'DELIVERED'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {selectedOrder.status}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-900">Total Amount:</span>
                            <span className="font-medium text-green-600">
                              ${selectedOrder.total.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-900">Date:</span>
                            <span className="font-medium text-gray-900">
                              {new Date(
                                selectedOrder.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3">
                          Customer Information
                        </h5>
                        <div className="flex items-center space-x-3 mb-3">
                          <CustomerAvatar
                            imageUrl={selectedOrder.user?.imageUrl}
                            firstName={selectedOrder.user?.firstName}
                            lastName={selectedOrder.user?.lastName}
                            email={selectedOrder.user?.email}
                            size="lg"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {selectedOrder.user?.firstName}{' '}
                              {selectedOrder.user?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {selectedOrder.user?.email}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-900">Email:</span>
                            <span className="font-medium text-gray-900">
                              {selectedOrder.user?.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">
                          Order Items
                        </h5>
                        <div className="space-y-2">
                          {selectedOrder.orderItems?.map(
                            (item: any, index: number) => (
                              <div
                                key={index}
                                className="flex justify-between items-center text-sm"
                              >
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {item.product?.name}
                                  </span>
                                  <span className="text-gray-900 ml-2">
                                    x{item.quantity}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900">
                                  ${item.price.toFixed(2)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-in zoom-in-95 duration-300">
              <div className="text-center">
                {/* Success Icon */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {successType === 'create'
                    ? 'Product Created!'
                    : successType === 'update'
                      ? 'Product Updated!'
                      : 'Product Deleted!'}
                </h3>

                {/* Message */}
                <p className="text-gray-600 mb-6">{successMessage}</p>

                {/* Progress Bar - Only show for non-delete operations */}
                {successType !== 'delete' && (
                  <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
                    <div
                      className="bg-green-600 h-1 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                    ></div>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {successType === 'delete'
                    ? 'Continue'
                    : `Continue (${countdown}s)`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-in zoom-in-95 duration-300">
              <div className="text-center">
                {/* Error Icon */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                  <svg
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Error
                </h3>

                {/* Message */}
                <p className="text-gray-600 mb-6">{errorMessage}</p>

                {/* Action Button */}
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Popup */}
        <CustomPopup
          isOpen={deletePopup.isOpen}
          onClose={() =>
            setDeletePopup({ isOpen: false, type: 'product', id: '', name: '' })
          }
          type="warning"
          title="Confirm Deletion"
          message={`Are you sure you want to delete ${deletePopup.name}? This action cannot be undone.`}
          autoClose={false}
        >
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() =>
                setDeletePopup({
                  isOpen: false,
                  type: 'product',
                  id: '',
                  name: '',
                })
              }
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (deletePopup.type === 'product') {
                  confirmDeleteProduct();
                } else if (deletePopup.type === 'order') {
                  confirmDeleteOrder();
                } else if (deletePopup.type === 'customer') {
                  confirmDeleteCustomer();
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </CustomPopup>

        {/* Category Form Modal */}
        {showCategoryForm && (
          <CategoryForm
            category={editingCategory}
            onSave={handleCategorySave}
            onCancel={handleCategoryCancel}
            isEditing={!!editingCategory}
          />
        )}

        {/* Invoice Generator Modal */}
        {showInvoiceModal && selectedOrderForInvoice && (
          <InvoiceGenerator
            order={selectedOrderForInvoice}
            onClose={handleCloseInvoiceModal}
          />
        )}
      </div>
    </AdminLayout>
  );
}
