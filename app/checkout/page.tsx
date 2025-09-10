'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { useUser } from '@clerk/nextjs';
import CustomPopup from '@/components/CustomPopup';
import ProcessedProductImage from '@/components/ProcessedProductImage';
import DemoPaymentForm from '@/components/DemoPaymentForm';
import { isStripeConfigured } from '@/lib/stripe';
import StripeDebug from '@/components/StripeDebug';
import {
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';


export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

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

  // Redirect to cart if no items
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  // Show loading while redirecting
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to cart...</p>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleGuestInfoChange = (field: string, value: string) => {
    setGuestInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Validate guest information if not signed in
      if (!isSignedIn) {
        if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email) {
          setPopup({
            isOpen: true,
            type: 'error',
            title: 'Missing Information',
            message:
              'Please fill in all required guest information before proceeding.',
          });
          return;
        }
      }

      console.log('Creating order with data:', {
        items: items.length,
        guestInfo: isSignedIn ? 'signed in user' : guestInfo,
        paymentIntentId,
        total,
      });

      // Create order in database
      const orderData = {
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        guestInfo: isSignedIn
          ? {
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              email: user?.emailAddresses[0]?.emailAddress || '',
            }
          : guestInfo,
        paymentIntentId,
        total,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('Order created successfully:', responseData);
        console.log(
          'Redirecting to success page with session_id:',
          paymentIntentId
        );
        console.log('About to redirect...');
        // Don't clear cart immediately, let success page handle it
        router.push('/success?session_id=' + paymentIntentId);
        console.log('Redirect command sent');
      } else {
        console.error('Order creation failed:', responseData);
        throw new Error(responseData.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Payment success error:', error);
      setPopup({
        isOpen: true,
        type: 'error',
        title: 'Order Creation Failed',
        message:
          error instanceof Error
            ? error.message
            : 'Payment successful but order creation failed. Please contact support.',
      });
    }
  };

  const handlePaymentError = (error: string) => {
    setPopup({
      isOpen: true,
      type: 'error',
      title: 'Payment Failed',
      message: error,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase securely</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Customer Information */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h2>

              {isSignedIn ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Welcome back, {user?.firstName}! Your account information
                      will be used for this order.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={user?.firstName || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={user?.lastName || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.emailAddresses[0]?.emailAddress || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Guest checkout. You can create an account after your
                      purchase to track orders and save payment methods.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={guestInfo.firstName}
                        onChange={(e) =>
                          handleGuestInfoChange('firstName', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={guestInfo.lastName}
                        onChange={(e) =>
                          handleGuestInfoChange('lastName', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={guestInfo.email}
                      onChange={(e) =>
                        handleGuestInfoChange('email', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                      {item.image && item.image.trim() !== '' ? (
                        <ProcessedProductImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          fallbackClassName="w-full h-full"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            objectPosition: 'center',
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full flex items-center justify-center text-gray-400 text-xs"
                        style={{
                          display:
                            item.image && item.image.trim() !== ''
                              ? 'none'
                              : 'flex',
                        }}
                      >
                        <div className="text-center">
                          <CreditCard className="h-4 w-4 mx-auto mb-1" />
                          <span className="text-xs">Product</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="lg:w-96">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <DemoPaymentForm
                total={total}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                isSignedIn={isSignedIn || false}
                guestInfo={guestInfo}
              />
              {false && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                      <div className="text-sm text-yellow-800">
                        <strong>Stripe Payment System Not Configured</strong>
                        <p className="mt-1">
                          To enable real payments, please configure your Stripe keys in the environment variables.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Payment (Test Mode)</h3>
                    <p className="text-xs text-gray-600 mb-4">
                      This is a demo payment form. No real payment will be processed.
                    </p>
                    
                    <button
                      onClick={() => handlePaymentSuccess('demo_payment_' + Date.now())}
                      disabled={isLoading}
                      className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing Demo Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Complete Demo Payment (${total.toFixed(2)})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CustomPopup
        isOpen={popup.isOpen}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup({ ...popup, isOpen: false })}
      />
      
      <StripeDebug />
    </div>
  );
}
