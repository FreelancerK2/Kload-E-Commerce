'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Download,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  CreditCard,
} from 'lucide-react';
import { useCartStore } from '@/lib/store';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  stripeSessionId: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCartStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [downloadPopupMessage, setDownloadPopupMessage] = useState('');
  const [downloadPopupType, setDownloadPopupType] = useState<
    'success' | 'error'
  >('success');
  const [popupAnimation, setPopupAnimation] = useState(false);

  // Debug: Log that the success page is being rendered
  console.log('🎯 SUCCESS PAGE RENDERED - Session ID:', sessionId);
  console.log(
    'Current URL:',
    typeof window !== 'undefined' ? window.location.href : 'N/A'
  );

  // Set page as loaded immediately and clear cart
  useEffect(() => {
    setPageLoaded(true);
    console.log('✅ Success page component mounted');
    // Clear cart after successful payment
    clearCart();
    console.log('🛒 Cart cleared after successful payment');
  }, [clearCart]);

  useEffect(() => {
    console.log('useEffect triggered with sessionId:', sessionId);
    console.log(
      'Current URL:',
      typeof window !== 'undefined' ? window.location.href : 'N/A'
    );
    console.log(
      'Search params:',
      typeof window !== 'undefined' ? window.location.search : 'N/A'
    );

    if (sessionId) {
      console.log('Session ID found, fetching order details...');
      fetchOrderDetails();
      // Show success message after a short delay
      setTimeout(() => {
        setShowSuccessMessage(true);
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      }, 500);
    } else {
      console.log('No session ID found, setting loading to false');
      setLoading(false);
    }
  }, [sessionId]);

  const fetchOrderDetails = async () => {
    try {
      console.log('Fetching order details for sessionId:', sessionId);
      const response = await fetch(`/api/orders?sessionId=${sessionId}`);
      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Order data received:', data);

        if (data.orders && data.orders.length > 0) {
          setOrder(data.orders[0]);
          console.log('Order set successfully:', data.orders[0]);
        } else {
          console.log('No orders found in response');
        }
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadOrderInfo = async () => {
    if (!order) return;

    setDownloading(true);
    try {
      // Create order information as text
      const orderInfo = generateOrderText(order);

      // Create blob and download
      const blob = new Blob([orderInfo], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kload-order-${order.id}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show success notification
      setTimeout(() => {
        setDownloadPopupMessage('Order receipt downloaded successfully!');
        setDownloadPopupType('success');
        setShowDownloadPopup(true);
        // Trigger animation after popup is shown
        setTimeout(() => setPopupAnimation(true), 10);
      }, 100);
    } catch (error) {
      console.error('Error downloading order info:', error);
      setDownloadPopupMessage(
        'Failed to download order receipt. Please try again.'
      );
      setDownloadPopupType('error');
      setShowDownloadPopup(true);
      // Trigger animation after popup is shown
      setTimeout(() => setPopupAnimation(true), 10);
    } finally {
      setDownloading(false);
    }
  };

  const generateOrderText = (order: Order) => {
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let text = `╔══════════════════════════════════════════════════════════════╗\n`;
    text += `║                    KLOAD - ORDER RECEIPT                      ║\n`;
    text += `╚══════════════════════════════════════════════════════════════╝\n\n`;

    text += `📋 ORDER INFORMATION\n`;
    text += `────────────────────────────────────────────────────────────────\n`;
    text += `Order ID:        ${order.id}\n`;
    text += `Payment Session: ${order.stripeSessionId}\n`;
    text += `Order Date:      ${orderDate}\n`;
    text += `Status:          ✅ ${order.status.toUpperCase()}\n\n`;

    if (order.user) {
      text += `👤 CUSTOMER INFORMATION\n`;
      text += `────────────────────────────────────────────────────────────────\n`;
      text += `Name:  ${order.user.firstName || ''} ${order.user.lastName || ''}\n`;
      text += `Email: ${order.user.email || ''}\n\n`;
    }

    text += `🛍️  ORDER ITEMS\n`;
    text += `────────────────────────────────────────────────────────────────\n`;
    let subtotal = 0;
    order.items.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      text += `${(index + 1).toString().padStart(2, ' ')}. ${item.name}\n`;
      text += `    Quantity: ${item.quantity} × $${item.price.toFixed(2)} = $${itemTotal.toFixed(2)}\n\n`;
    });

    text += `────────────────────────────────────────────────────────────────\n`;
    text += `TOTAL: $${order.total.toFixed(2)}\n`;
    text += `════════════════════════════════════════════════════════════════\n\n`;

    text += `🎉 Thank you for your purchase!\n\n`;
    text += `Your order has been successfully processed and confirmed.\n`;
    text += `You will receive an email confirmation shortly.\n\n`;

    text += `📞 SUPPORT INFORMATION\n`;
    text += `────────────────────────────────────────────────────────────────\n`;
    text += `For any questions or concerns about your order:\n`;
    text += `• Email: support@kload.com\n`;
    text += `• Phone: +1 (555) 123-4567\n`;
    text += `• Hours: Monday - Friday, 9:00 AM - 6:00 PM EST\n\n`;

    text += `📦 SHIPPING INFORMATION\n`;
    text += `────────────────────────────────────────────────────────────────\n`;
    text += `• Orders are typically processed within 1-2 business days\n`;
    text += `• You will receive tracking information via email\n`;
    text += `• Standard shipping: 3-5 business days\n`;
    text += `• Express shipping: 1-2 business days\n\n`;

    text += `╔══════════════════════════════════════════════════════════════╗\n`;
    text += `║                    KLOAD E-COMMERCE                          ║\n`;
    text += `║              www.kload.com | support@kload.com              ║\n`;
    text += `╚══════════════════════════════════════════════════════════════╝\n`;

    return text;
  };

  // Simple test display - show this immediately
  if (!pageLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing success page...</p>
        </div>
      </div>
    );
  }

  // Show loading state if page is not loaded yet
  if (!pageLoaded) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-800 font-bold">Loading Success Page...</p>
          <p className="text-red-600 text-sm mt-2">
            Session ID: {sessionId || 'None'}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Debug Info:</strong>
                <br />
                Session ID: {sessionId || 'None'}
                <br />
                URL:{' '}
                {typeof window !== 'undefined' ? window.location.href : 'N/A'}
                <br />
                Search:{' '}
                {typeof window !== 'undefined' ? window.location.search : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    // Test mode: Show sample order if no session_id is provided
    if (!sessionId) {
      const testOrder: Order = {
        id: 'test-order-123',
        stripeSessionId: 'test_session_123',
        total: 299.99,
        status: 'PAID',
        createdAt: new Date().toISOString(),
        items: [
          {
            id: 'test-product-1',
            name: 'Test Product 1',
            price: 149.99,
            quantity: 1,
            image: '/test-image-1.jpg',
          },
          {
            id: 'test-product-2',
            name: 'Test Product 2',
            price: 75.0,
            quantity: 2,
            image: '/test-image-2.jpg',
          },
        ],
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      };

      return (
        <div className="min-h-screen bg-gray-50">
          {/* Test Mode Banner */}
          <div className="bg-yellow-500 text-white px-4 py-2 text-center">
            🧪 TEST MODE - Sample Order Display
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Payment Successful!
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Thank you for your purchase! Your order has been successfully
                processed and confirmed. You will receive an email confirmation
                shortly.
              </p>
            </div>

            {/* Order Information */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Order Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-white" />
                    <h2 className="text-xl font-semibold text-white">
                      Order Details (Test Mode)
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      const orderInfo = generateOrderText(testOrder);
                      const blob = new Blob([orderInfo], {
                        type: 'text/plain',
                      });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `test-order-${testOrder.id}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      alert('Test order receipt downloaded!');
                    }}
                    className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Download className="h-5 w-5" />
                    <span>📄 Download Test Receipt</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="font-medium">
                          {new Date(testOrder.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-medium font-mono text-sm">
                          {testOrder.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Payment Status</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {testOrder.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Customer Information
                    </h3>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{testOrder.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">
                          {testOrder.user?.firstName} {testOrder.user?.lastName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Items
                  </h3>
                  <div className="space-y-4">
                    {testOrder.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${testOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Instructions */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Testing Instructions
              </h3>
              <div className="space-y-3 text-sm text-blue-800">
                <p>• This is a test mode showing sample order data</p>
                <p>• To test with real data, complete a checkout process</p>
                <p>
                  • The success page will automatically load with real order
                  details
                </p>
                <p>
                  • You can download the order receipt using the button above
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Continue Shopping
              </a>
              <a
                href="/checkout"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Test Checkout
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
              <Package className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Order Not Found
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              We couldn't find the order details for session ID: {sessionId}
            </p>
            <div className="bg-gray-100 rounded-lg p-4 text-left max-w-md mx-auto">
              <p className="text-sm text-gray-700">
                <strong>Debug Info:</strong>
                <br />
                Session ID: {sessionId}
                <br />
                URL:{' '}
                {typeof window !== 'undefined' ? window.location.href : 'N/A'}
                <br />
                Search Params:{' '}
                {typeof window !== 'undefined' ? window.location.search : 'N/A'}
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Continue Shopping
              </a>
              <a
                href="/orders"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                View All Orders
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Notification Banner */}
      {showSuccessMessage && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce cursor-pointer hover:bg-green-600 transition-colors"
          onClick={() => setShowSuccessMessage(false)}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Payment Successful! 🎉</span>
          </div>
        </div>
      )}

      {/* Custom Download Popup */}
      {showDownloadPopup && (
        <div
          className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 pt-20"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <div
            className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-500 ${popupAnimation
                ? 'translate-y-0 opacity-100'
                : '-translate-y-8 opacity-0'
              }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${downloadPopupType === 'success'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                    }`}
                >
                  {downloadPopupType === 'success' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <div className="w-6 h-6 text-red-600 text-2xl font-bold">
                      ×
                    </div>
                  )}
                </div>
              </div>
              <h3
                className={`text-lg font-semibold text-center mb-2 ${downloadPopupType === 'success'
                    ? 'text-green-900'
                    : 'text-red-900'
                  }`}
              >
                {downloadPopupType === 'success' ? 'Success!' : 'Error'}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                {downloadPopupMessage}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setPopupAnimation(false);
                    setTimeout(() => setShowDownloadPopup(false), 300);
                  }}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${downloadPopupType === 'success'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Thank you for your purchase! Your order has been successfully
            processed and confirmed. You will receive an email confirmation
            shortly.
          </p>
        </div>

        {/* Order Information */}
        {order && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Order Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">
                    Order Details
                  </h2>
                </div>
                <button
                  onClick={downloadOrderInfo}
                  disabled={downloading}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 border border-gray-300"
                >
                  {downloading ? 'Downloading Receipt...' : 'Download Receipt'}
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-black">Order Date</p>
                      <p className="font-medium text-black">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-black">Order ID</p>
                      <p className="font-medium font-mono text-sm text-black">
                        {order.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-black">Payment Status</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {order.user && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Customer Information
                    </h3>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-black">Email</p>
                        <p className="font-medium text-black">
                          {order.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-black">Name</p>
                        <p className="font-medium text-black">
                          {order.user.firstName || ''}{' '}
                          {order.user.lastName || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Items
                </h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden relative">
                        {item.image &&
                          item.image.trim() !== '' &&
                          item.image !== '[]' ? (
                          <img
                            src={
                              item.image.startsWith('data:')
                                ? item.image
                                : item.image.startsWith('[')
                                  ? JSON.parse(item.image)[0] || ''
                                  : `data:image/jpeg;base64,${item.image}`
                            }
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                            style={{ minHeight: '64px', minWidth: '64px' }}
                            onError={(e) => {
                              const target = e.currentTarget as HTMLElement;
                              target.style.display = 'none';
                              const fallback =
                                target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs"
                          style={{
                            display:
                              item.image &&
                                item.image.trim() !== '' &&
                                item.image !== '[]'
                                ? 'none'
                                : 'flex',
                          }}
                        >
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-black">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-black">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            What's Next?
          </h3>
          <div className="space-y-3 text-sm text-gray-800">
            <p>
              • You will receive an email confirmation with your order details
            </p>
            <p>• We'll notify you when your order ships</p>
            <p>• Track your order status in your account dashboard</p>
            <p>• For any questions, contact our support team</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </a>
          <a
            href="/orders"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            View All Orders
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
}
