# Stripe Payment Integration Setup Guide

This guide will help you set up real Stripe payments for your Kload e-commerce store.

## Prerequisites

1. A Stripe account (create one at [stripe.com](https://stripe.com))
2. Your project deployed on Vercel (or another platform)

## Step 1: Get Your Stripe Keys

### Test Mode (Development)

1. Log in to your Stripe Dashboard
2. Go to **Developers** > **API Keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

### Live Mode (Production)

1. In your Stripe Dashboard, toggle **View test data** to OFF
2. Go to **Developers** > **API Keys**
3. Copy your **Publishable key** (starts with `pk_live_`)
4. Copy your **Secret key** (starts with `sk_live_`)

## Step 2: Configure Environment Variables

### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### For Local Development:

1. Create a `.env.local` file in your project root
2. Add the same variables as above

## Step 3: Set Up Webhooks

### For Vercel Deployment:

1. In your Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select these events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add this to your environment variables as `STRIPE_WEBHOOK_SECRET`

### For Local Development:

1. Install Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Copy the webhook signing secret from the CLI output
3. Add it to your `.env.local` file

## Step 4: Test Your Integration

### Test Cards (Test Mode Only)

Use these test card numbers:

- **Visa**: 4242424242424242
- **Visa (debit)**: 4000056655665556
- **Mastercard**: 5555555555554444
- **American Express**: 378282246310005
- **Discover**: 6011111111111117

Use any future expiry date (e.g., 12/25) and any 3-digit CVC.

### Testing Steps:

1. Add items to your cart
2. Go to checkout
3. Fill in customer information
4. Use a test card number
5. Complete the payment
6. Check that the order is created and marked as PAID

## Step 5: Go Live (Production)

When you're ready to accept real payments:

1. **Complete Stripe account verification** in your dashboard
2. **Switch to live mode** in your Stripe dashboard
3. **Update environment variables** with live keys
4. **Update webhook endpoint** to use your production domain
5. **Test with small amounts** first

## Security Notes

- Never commit your secret keys to version control
- Use test keys for development
- Always use HTTPS in production
- Keep your webhook secret secure

## Troubleshooting

### Common Issues:

1. **"Stripe is not configured" error**
   - Check that your environment variables are set correctly
   - Ensure keys don't contain placeholder text

2. **Webhook signature verification failed**
   - Verify your webhook secret is correct
   - Ensure the webhook endpoint URL is accessible

3. **Payment fails**
   - Check Stripe dashboard for error details
   - Verify your account is properly set up
   - Ensure you're using the correct API version

### Support:

- Stripe Documentation: [stripe.com/docs](https://stripe.com/docs)
- Stripe Support: [support.stripe.com](https://support.stripe.com)

## Features Included

✅ Real-time payment processing
✅ Secure card input with Stripe Elements
✅ Webhook handling for payment confirmation
✅ Guest checkout support
✅ User account integration
✅ Order status updates
✅ Error handling and user feedback
✅ Mobile-responsive design
✅ SSL security indicators

Your Stripe integration is now ready for real payments! 🎉
