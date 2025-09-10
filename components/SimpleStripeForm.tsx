'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
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

interface SimpleStripeFormProps {
  total: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isSignedIn: boolean;
  guestInfo: any;
}

function PaymentFormContent({
  total,
  onSuccess,
  onError,
  isLoading,
  setIsLoading,
  isSignedIn,
  guestInfo,
}: SimpleStripeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    // Create PaymentIntent
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
            amount: Math.round(total * 100),
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
        console.error('Error creating payment intent:', error);
        onError('Failed to initialize payment. Please try again.');
      }
    };

    if (total > 0) {
      createPaymentIntent();
    }
  }, [total, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
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
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
        redirect: 'if_required',
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
      onError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid =
    isSignedIn ||
    (guestInfo.firstName && guestInfo.lastName && guestInfo.email);

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-gray-600">Initializing payment...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !isFormValid || !stripe || !elements}
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
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay ${total.toFixed(2)}
          </>
        )}
      </button>

      {message && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <div className="text-sm text-red-800">{message}</div>
          </div>
        </div>
      )}

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
          Secure payment processing
        </p>
      </div>
    </form>
  );
}

export default function SimpleStripeForm(props: SimpleStripeFormProps) {
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [stripe, setStripe] = useState<any>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // Get the key directly
        const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        
        console.log('SimpleStripeForm - Key check:', {
          hasKey: !!key,
          keyLength: key?.length,
          keyStart: key?.substring(0, 15)
        });

        if (!key || !key.startsWith('pk_')) {
          throw new Error('Invalid Stripe key');
        }

        console.log('Loading Stripe with key:', key.substring(0, 20) + '...');
        const stripeInstance = await loadStripe(key);
        
        if (stripeInstance) {
          setStripe(stripeInstance);
          setStripeLoaded(true);
          console.log('Stripe loaded successfully in SimpleStripeForm');
        } else {
          throw new Error('Failed to load Stripe');
        }
      } catch (error) {
        console.error('SimpleStripeForm error:', error);
        setStripeError('Failed to load Stripe. Please try again.');
        props.onError('Failed to load Stripe. Please try again.');
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

  if (!stripeLoaded || !stripe) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-gray-600">Loading payment form...</span>
      </div>
    );
  }

  return (
    <Elements stripe={stripe}>
      <PaymentFormContent {...props} />
    </Elements>
  );
}
