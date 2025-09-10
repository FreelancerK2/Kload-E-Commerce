'use client';

import { useEffect, useState } from 'react';

export default function StripeDebug() {
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    setEnvVars({
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      keyStartsWith: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_'),
      keyLength: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.length,
    });
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Stripe Debug Info</h3>
      <div className="space-y-1">
        <div>Has Key: {envVars.hasPublishableKey ? '✅' : '❌'}</div>
        <div>Starts with pk_: {envVars.keyStartsWith ? '✅' : '❌'}</div>
        <div>Key Length: {envVars.keyLength || 'N/A'}</div>
        <div>Key Preview: {envVars.publishableKey?.substring(0, 20)}...</div>
      </div>
    </div>
  );
}
