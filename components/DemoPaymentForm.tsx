'use client';

import { useState } from 'react';
import {
  Loader2,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Play,
} from 'lucide-react';

interface DemoPaymentFormProps {
  total: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isSignedIn: boolean;
  guestInfo: any;
}

export default function DemoPaymentForm({
  total,
  onSuccess,
  onError,
  isLoading,
  setIsLoading,
  isSignedIn,
  guestInfo,
}: DemoPaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setPaymentError(null);
    setPaymentSuccess(false);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Demo validation
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      const errorMessage = 'Please fill in all card details.';
      setPaymentError(errorMessage);
      onError(errorMessage);
      setIsLoading(false);
      return;
    }

    if (cardNumber.replace(/\s/g, '').length < 16) {
      const errorMessage = 'Please enter a valid card number.';
      setPaymentError(errorMessage);
      onError(errorMessage);
      setIsLoading(false);
      return;
    }

    if (cvv.length < 3) {
      const errorMessage = 'Please enter a valid CVV.';
      setPaymentError(errorMessage);
      onError(errorMessage);
      setIsLoading(false);
      return;
    }

    // Simulate successful payment
    const demoPaymentIntentId = `pi_demo_${Date.now()}`;
    setPaymentSuccess(true);
    onSuccess(demoPaymentIntentId);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Play className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
            <p className="text-sm text-blue-600">
              This is a demonstration payment form. No real charges will be made.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cardholder Name */}
        <div>
          <label htmlFor="cardholder-name" className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            id="cardholder-name"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Card Number */}
        <div>
          <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <input
            type="text"
            id="card-number"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              id="expiry-date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              placeholder="MM/YY"
              maxLength={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
              placeholder="123"
              maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Error Message */}
        {paymentError && (
          <div className="flex items-center p-3 text-red-700 bg-red-100 rounded-lg">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p className="text-sm font-medium">{paymentError}</p>
          </div>
        )}

        {/* Success Message */}
        {paymentSuccess && (
          <div className="flex items-center p-3 text-green-700 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p className="text-sm font-medium">Payment successful! (Demo Mode)</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <CreditCard className="h-5 w-5 mr-2" />
          )}
          {isLoading ? 'Processing Payment...' : `Pay $${total.toFixed(2)} (Demo)`}
        </button>

        {/* Security Notice */}
        <div className="flex items-center justify-center text-gray-500 text-sm mt-4">
          <Shield className="h-4 w-4 mr-1" />
          <p>Demo payment form - No real charges will be made</p>
        </div>
      </form>
    </div>
  );
}
