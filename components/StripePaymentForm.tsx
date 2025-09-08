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

// Load Stripe with better error handling
const stripePromise = (async () => {
  try {
    const { loadStripe } = await import('@stripe/stripe-js');
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error('Stripe publishable key is not configured');
    }
    return await loadStripe(key);
  } catch (error) {
    console.error('Failed to load Stripe:', error);
    return null;
  }
})();

const CARD_ELEMENT_OPTIONS = {
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

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  clientSecret?: string;
}

function PaymentFormContent({
  amount,
  onSuccess,
  onError,
  isLoading,
  setIsLoading,
  clientSecret,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [stripeLoaded, setStripeLoaded] = useState(false);

  // Check if Stripe loaded successfully
  useEffect(() => {
    if (stripe) {
      setStripeLoaded(true);
    }
  }, [stripe]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // If we have a client secret, confirm the payment
      if (clientSecret) {
        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: elements.getElement(CardElement)!,
            },
          });

        if (confirmError) {
          setError(confirmError.message || 'Payment failed');
          onError(confirmError.message || 'Payment failed');
        } else if (paymentIntent?.status === 'succeeded') {
          onSuccess(paymentIntent.id);
        }
      } else {
        // Create payment intent first
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            createPaymentIntent: true,
            amount: Math.round(amount * 100), // Convert to cents
          }),
        });

        const { clientSecret: newClientSecret, error: intentError } =
          await response.json();

        if (intentError) {
          throw new Error(intentError);
        }

        if (!newClientSecret) {
          throw new Error('Failed to create payment intent');
        }

        // Confirm the payment with the new client secret
        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(newClientSecret, {
            payment_method: {
              card: elements.getElement(CardElement)!,
            },
          });

        if (confirmError) {
          setError(confirmError.message || 'Payment failed');
          onError(confirmError.message || 'Payment failed');
        } else if (paymentIntent?.status === 'succeeded') {
          onSuccess(paymentIntent.id);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setProcessing(false);
      setIsLoading(false);
    }
  };

  // Show loading state while Stripe is loading
  if (!stripeLoaded) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading payment form...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="space-y-3">
            <div className="border border-gray-300 rounded-md p-3">
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing || isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {processing || isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>

      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-1 text-green-600" />
          Secure
        </div>
        <div className="flex items-center">
          <Lock className="h-4 w-4 mr-1 text-green-600" />
          Encrypted
        </div>
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
          SSL
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>💳 Stripe Elements Payment Form</p>
        <p>Test Cards:</p>
        <div className="grid grid-cols-1 gap-1 text-left max-w-xs mx-auto">
          <p>✅ Success: 4242 4242 4242 4242</p>
          <p>❌ Decline: 4000 0000 0000 0002</p>
          <p>⚠️ Requires Auth: 4000 0025 0000 3155</p>
          <p>💳 Exp: Any future date | CVC: Any 3 digits</p>
        </div>
      </div>
    </form>
  );
}

export default function StripePaymentForm(props: PaymentFormProps) {
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStripe = async () => {
      try {
        const stripe = await stripePromise;
        if (!stripe) {
          setStripeError(
            'Failed to load Stripe.js. Please check your internet connection and try again.'
          );
        }
      } catch (error) {
        setStripeError('Stripe configuration error. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    checkStripe();
  }, []);

  // Check if Stripe is properly configured
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <div>
            <h3 className="font-medium text-red-900">
              Stripe Configuration Error
            </h3>
            <p className="text-sm text-red-700">
              Stripe publishable key is not configured. Please check your
              environment variables.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
          <span className="text-blue-800">Loading Stripe payment form...</span>
        </div>
      </div>
    );
  }

  if (stripeError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <div>
            <h3 className="font-medium text-red-900">Stripe Loading Error</h3>
            <p className="text-sm text-red-700">{stripeError}</p>
            <div className="mt-2">
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
}
