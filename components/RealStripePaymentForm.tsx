'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Loader2,
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface RealStripePaymentFormProps {
  total: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isSignedIn: boolean;
  guestInfo: any;
}

// Payment form component that uses Stripe Elements
function PaymentFormContent({
  total,
  onSuccess,
  onError,
  isLoading,
  setIsLoading,
  isSignedIn,
  guestInfo,
}: RealStripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log('Creating PaymentIntent for amount:', total);
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            createPaymentIntent: true,
            amount: Math.round(total * 100), // Convert to cents
          }),
        });

        const data = await response.json();
        console.log('PaymentIntent response:', data);

        if (response.ok && data.clientSecret) {
          setClientSecret(data.clientSecret);
          console.log('Client secret set successfully');
        } else {
          throw new Error(data.error || 'Failed to create payment intent');
        }
      } catch (error) {
        console.error('Error creating PaymentIntent:', error);
        onError('Failed to initialize payment. Please try again.');
      }
    };

    createPaymentIntent();
  }, [total, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      onError('Payment system is not ready. Please wait and try again.');
      return;
    }

    // Validate guest information if not signed in
    if (!isSignedIn) {
      if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email) {
        onError('Please fill in all required guest information before proceeding.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      console.log('Confirming payment with Stripe...');
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: isSignedIn 
              ? `${guestInfo.firstName || ''} ${guestInfo.lastName || ''}`.trim()
              : `${guestInfo.firstName} ${guestInfo.lastName}`,
            email: isSignedIn 
              ? guestInfo.email || ''
              : guestInfo.email,
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        onError(error.message || 'Payment failed. Please try again.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent.id);
        onSuccess(paymentIntent.id);
      } else {
        onError('Payment was not completed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid =
    isSignedIn ||
    (guestInfo.firstName && guestInfo.lastName && guestInfo.email);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <div className="text-sm text-green-800">
            <strong>Stripe Payment Ready!</strong>
            <p className="mt-1">Enter your card details below to complete the payment.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Information
            </label>
            <div className="p-3 border border-gray-300 rounded-lg bg-white">
              <CardElement options={cardElementOptions} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isFormValid || !stripe || !clientSecret}
          className="w-full bg-black text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold hover:scale-105 hover:shadow-xl focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md transition-all duration-300 min-h-[48px] sm:min-h-[56px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : !isFormValid ? (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Fill Required Information
            </>
          ) : !stripe || !clientSecret ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Loading Payment Form...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Complete Payment (${total.toFixed(2)})
            </>
          )}
        </button>

        {!isFormValid && !isSignedIn && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex items-center">
              <div className="text-sm text-yellow-800">
                Please fill in all required guest information above before
                proceeding with payment.
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 bg-gray-50 py-3 rounded-lg">
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-2 text-green-600" />
            <span className="font-medium">Secure</span>
          </div>
          <div className="flex items-center">
            <Lock className="h-4 w-4 mr-2 text-green-600" />
            <span className="font-medium">Encrypted</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            <span className="font-medium">SSL</span>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>💳 Powered by Stripe</p>
          <p className="text-blue-600 font-medium">
            Your payment information is secure and encrypted
          </p>
        </div>
      </form>
    </div>
  );
}

// Main component that loads Stripe and wraps the payment form
export default function RealStripePaymentForm(props: RealStripePaymentFormProps) {
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // Check if we're on the client side
        if (typeof window === 'undefined') {
          return;
        }

        // Get the key
        const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        
        console.log('RealStripePaymentForm - Environment check:', {
          hasKey: !!key,
          keyLength: key?.length,
          keyStart: key?.substring(0, 15),
          isClient: true
        });

        if (!key || !key.startsWith('pk_')) {
          throw new Error('Invalid Stripe publishable key');
        }

        console.log('Loading Stripe with key:', key.substring(0, 20) + '...');
        const stripe = await loadStripe(key);
        
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }

        console.log('Stripe loaded successfully');
        setStripePromise(stripe);

      } catch (error) {
        console.error('RealStripePaymentForm error:', error);
        setStripeError('Failed to initialize Stripe. Please try again.');
        props.onError('Failed to initialize Stripe. Please try again.');
      }
    };

    initializeStripe();
  }, [props]);

  if (stripeError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <div className="text-sm text-red-800">{stripeError}</div>
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-gray-600">Loading payment form...</span>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
}
