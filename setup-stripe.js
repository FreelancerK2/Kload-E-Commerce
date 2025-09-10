#!/usr/bin/env node

/**
 * Stripe Setup Helper Script
 * This script helps you set up Stripe environment variables
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupStripe() {
  console.log('🔧 Stripe Setup Helper');
  console.log('=====================\n');
  
  console.log('This script will help you set up your Stripe environment variables.\n');
  
  console.log('First, you need to get your Stripe keys:');
  console.log('1. Go to https://stripe.com and create an account');
  console.log('2. Go to Developers > API Keys');
  console.log('3. Copy your Publishable key (starts with pk_test_)');
  console.log('4. Copy your Secret key (starts with sk_test_)\n');
  
  const publishableKey = await question('Enter your Stripe Publishable Key (pk_test_...): ');
  const secretKey = await question('Enter your Stripe Secret Key (sk_test_...): ');
  
  if (!publishableKey.startsWith('pk_test_') && !publishableKey.startsWith('pk_live_')) {
    console.log('❌ Invalid publishable key. It should start with pk_test_ or pk_live_');
    rl.close();
    return;
  }
  
  if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
    console.log('❌ Invalid secret key. It should start with sk_test_ or sk_live_');
    rl.close();
    return;
  }
  
  // Create .env.local file
  const envContent = `# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${publishableKey}
STRIPE_SECRET_KEY=${secretKey}
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Note: You'll need to set up webhooks later
# Go to Stripe Dashboard > Developers > Webhooks
# Add endpoint: https://your-domain.vercel.app/api/webhooks/stripe
# Select events: payment_intent.succeeded, payment_intent.payment_failed
`;

  const envPath = path.join(__dirname, '.env.local');
  
  try {
    // Check if .env.local already exists
    if (fs.existsSync(envPath)) {
      const existingContent = fs.readFileSync(envPath, 'utf8');
      const updatedContent = existingContent.replace(
        /NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*/g,
        `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${publishableKey}`
      ).replace(
        /STRIPE_SECRET_KEY=.*/g,
        `STRIPE_SECRET_KEY=${secretKey}`
      );
      
      fs.writeFileSync(envPath, updatedContent);
      console.log('✅ Updated existing .env.local file');
    } else {
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Created .env.local file');
    }
    
    console.log('\n🎉 Stripe configuration complete!');
    console.log('\nNext steps:');
    console.log('1. Restart your development server (npm run dev)');
    console.log('2. Test the payment form with test card: 4242424242424242');
    console.log('3. Set up webhooks in your Stripe dashboard');
    console.log('4. Deploy to Vercel and add the same environment variables there');
    
  } catch (error) {
    console.log('❌ Error creating .env.local file:', error.message);
  }
  
  rl.close();
}

setupStripe().catch(console.error);
