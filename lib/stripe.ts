import Stripe from 'stripe';

// Check if Stripe is properly configured
export const isStripeConfigured = () => {
  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    // On client side, we can only check the publishable key
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    return !!(
      publishableKey &&
      !publishableKey.includes('pk_test_placeholder_key') &&
      !publishableKey.includes('your_') &&
      !publishableKey.includes('placeholder') &&
      publishableKey.startsWith('pk_')
    );
  }
  
  // On server side, check both keys
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes('sk_test_placeholder_key') &&
    !process.env.STRIPE_SECRET_KEY.includes('your_') &&
    !process.env.STRIPE_SECRET_KEY.includes('placeholder') &&
    process.env.STRIPE_SECRET_KEY.startsWith('sk_') &&
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes(
      'pk_test_placeholder_key'
    ) &&
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('your_') &&
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('placeholder') &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')
  );
};

// Server-side Stripe instance (only create if configured)
export const stripe = isStripeConfigured()
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil',
    })
  : null;

// Client-side Stripe instance
export const getStripe = () => {
  if (typeof window !== 'undefined') {
    const { loadStripe } = require('@stripe/stripe-js');
    return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return null;
};

// Stripe test card numbers for testing
export const STRIPE_TEST_CARDS = {
  visa: '4242424242424242',
  visaDebit: '4000056655665556',
  mastercard: '5555555555554444',
  mastercardDebit: '5200828282828210',
  amex: '378282246310005',
  discover: '6011111111111117',
  jcb: '3566002020360505',
  dinersClub: '3056930009020004',
  unionPay: '6200000000000005',
};

// Stripe test card details
export const STRIPE_TEST_CARD_DETAILS = {
  cardNumber: STRIPE_TEST_CARDS.visa,
  expiryMonth: '12',
  expiryYear: '2025',
  cvc: '123',
  zipCode: '12345',
};
