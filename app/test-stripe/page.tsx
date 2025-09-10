'use client';

import { useState, useEffect } from 'react';

export default function TestStripePage() {
  const [result, setResult] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testStripe = async () => {
      try {
        console.log('Testing Stripe loading...');
        
        // Check environment variable
        const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        console.log('Environment check:', {
          hasKey: !!key,
          keyLength: key?.length,
          keyStart: key?.substring(0, 15)
        });

        if (!key) {
          throw new Error('No Stripe key found');
        }

        if (!key.startsWith('pk_')) {
          throw new Error('Invalid Stripe key format');
        }

        // Try to load Stripe
        console.log('Importing Stripe...');
        const { loadStripe } = await import('@stripe/stripe-js');
        
        console.log('Loading Stripe with key...');
        const stripe = await loadStripe(key);
        
        if (stripe) {
          setResult('✅ Stripe loaded successfully!');
          console.log('Stripe loaded successfully');
        } else {
          throw new Error('Stripe returned null');
        }

      } catch (error) {
        console.error('Stripe test error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setResult('❌ Stripe failed to load');
      }
    };

    testStripe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Stripe Loading Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Test Results</h2>
          
          <div className="space-y-3">
            <div>
              <strong>Result:</strong> {result}
            </div>
            
            {error && (
              <div>
                <strong>Error:</strong> 
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  {error}
                </div>
              </div>
            )}
            
            <div>
              <strong>Environment:</strong> 
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
                <div>NODE_ENV: {process.env.NODE_ENV}</div>
                <div>VERCEL_ENV: {process.env.VERCEL_ENV || 'Not set'}</div>
                <div>Has Stripe Key: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
