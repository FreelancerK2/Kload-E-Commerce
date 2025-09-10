'use client';

export default function TestEnvPage() {
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Environment Variables Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Stripe Configuration</h2>
          
          <div className="space-y-3">
            <div>
              <strong>Has Stripe Key:</strong> {stripeKey ? '✅ Yes' : '❌ No'}
            </div>
            
            <div>
              <strong>Key Length:</strong> {stripeKey?.length || 'N/A'}
            </div>
            
            <div>
              <strong>Key Starts with pk_:</strong> {stripeKey?.startsWith('pk_') ? '✅ Yes' : '❌ No'}
            </div>
            
            <div>
              <strong>Key Preview:</strong> {stripeKey?.substring(0, 20)}...
            </div>
            
            <div>
              <strong>Full Key:</strong> 
              <div className="mt-2 p-3 bg-gray-100 rounded text-sm font-mono break-all">
                {stripeKey || 'Not available'}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Environment Info</h3>
            <div className="text-sm text-blue-800">
              <div>NODE_ENV: {process.env.NODE_ENV}</div>
              <div>VERCEL_ENV: {process.env.VERCEL_ENV || 'Not set'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
