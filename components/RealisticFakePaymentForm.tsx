'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Check,
  X,
} from 'lucide-react';

interface RealisticFakePaymentFormProps {
  total: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isSignedIn: boolean;
  guestInfo: any;
}

export default function RealisticFakePaymentForm({
  total,
  onSuccess,
  onError,
  isLoading,
  setIsLoading,
  isSignedIn,
  guestInfo,
}: RealisticFakePaymentFormProps) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    zipCode: '',
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showCvv, setShowCvv] = useState(false);
  const [cardType, setCardType] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Card type detection
  const detectCardType = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    
    // Visa: starts with 4
    if (cleanNumber.startsWith('4')) return 'visa';
    
    // Mastercard: starts with 5 (51-55) or 2 (2221-2720)
    if (cleanNumber.startsWith('5') && cleanNumber.length >= 2) {
      const firstTwo = parseInt(cleanNumber.substring(0, 2));
      if (firstTwo >= 51 && firstTwo <= 55) return 'mastercard';
    }
    if (cleanNumber.startsWith('2') && cleanNumber.length >= 4) {
      const firstFour = parseInt(cleanNumber.substring(0, 4));
      if (firstFour >= 2221 && firstFour <= 2720) return 'mastercard';
    }
    
    // American Express: starts with 34 or 37
    if (cleanNumber.startsWith('34') || cleanNumber.startsWith('37')) return 'amex';
    
    // Discover: starts with 6 (6011, 65, 644-649)
    if (cleanNumber.startsWith('6011')) return 'discover';
    if (cleanNumber.startsWith('65')) return 'discover';
    if (cleanNumber.length >= 3) {
      const firstThree = parseInt(cleanNumber.substring(0, 3));
      if (firstThree >= 644 && firstThree <= 649) return 'discover';
    }
    
    return '';
  };

  // Format card number with spaces
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

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Validate card number using Luhn algorithm
  const validateCardNumber = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  // Validate expiry date
  const validateExpiryDate = (date: string) => {
    const [month, year] = date.split('/');
    if (!month || !year) return false;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      const detectedType = detectCardType(formattedValue);
      setCardType(detectedType);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    } else if (field === 'zipCode') {
      formattedValue = value.replace(/\D/g, '').substring(0, 5);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }
    
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!validateExpiryDate(formData.expiryDate)) {
      newErrors.expiryDate = 'Invalid or expired date';
    }
    
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length < 3) {
      newErrors.cvv = 'CVV must be at least 3 digits';
    }
    
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    if (!formData.zipCode) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (formData.zipCode.length < 5) {
      newErrors.zipCode = 'ZIP code must be 5 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Simulate realistic payment processing
  const simulatePaymentProcessing = async () => {
    const steps = [
      'Validating card information...',
      'Checking account balance...',
      'Verifying security details...',
      'Processing payment...',
      'Confirming transaction...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setIsProcessing(true);
    setPaymentError(null);
    setPaymentSuccess(false);
    
    try {
      // Simulate realistic payment processing
      await simulatePaymentProcessing();
      
      // Simulate random success/failure for realism
      const successRate = 0.85; // 85% success rate
      const isSuccessful = Math.random() < successRate;
      
      if (isSuccessful) {
        const demoPaymentIntentId = `pi_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setPaymentSuccess(true);
        onSuccess(demoPaymentIntentId);
      } else {
        const errorMessages = [
          'Insufficient funds',
          'Card declined by issuer',
          'Invalid security code',
          'Transaction timeout',
          'Card expired'
        ];
        const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        setPaymentError(randomError);
        onError(randomError);
      }
    } catch (error) {
      const errorMessage = 'Payment processing failed. Please try again.';
      setPaymentError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
      setProcessingStep(0);
    }
  };

  // Get card type icon
  const getCardTypeIcon = () => {
    switch (cardType) {
      case 'visa':
        return (
          <div className="w-8 h-5 bg-white border border-gray-200 rounded flex items-center justify-center">
            <svg viewBox="0 0 24 16" className="w-6 h-4">
              <rect width="24" height="16" rx="2" fill="#1A1F71"/>
              <text x="12" y="11" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">VISA</text>
            </svg>
          </div>
        );
      case 'mastercard':
        return (
          <div className="w-8 h-5 bg-white border border-gray-200 rounded flex items-center justify-center">
            <svg viewBox="0 0 24 16" className="w-6 h-4">
              <rect width="24" height="16" rx="2" fill="#EB001B"/>
              <circle cx="9" cy="8" r="4" fill="#F79E1B"/>
              <circle cx="15" cy="8" r="4" fill="#FF5F00"/>
              <path d="M12 4c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" fill="#EB001B"/>
            </svg>
          </div>
        );
      case 'amex':
        return (
          <div className="w-8 h-5 bg-white border border-gray-200 rounded flex items-center justify-center">
            <svg viewBox="0 0 24 16" className="w-6 h-4">
              <rect width="24" height="16" rx="2" fill="#006FCF"/>
              <text x="12" y="11" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">AMEX</text>
            </svg>
          </div>
        );
      case 'discover':
        return (
          <div className="w-8 h-5 bg-white border border-gray-200 rounded flex items-center justify-center">
            <svg viewBox="0 0 24 16" className="w-6 h-4">
              <rect width="24" height="16" rx="2" fill="#FF6000"/>
              <text x="12" y="11" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">DISCOVER</text>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-5 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-gray-400" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-green-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Secure Payment</h3>
            <p className="text-sm text-green-600">
              Your payment information is encrypted and secure. This is a demo environment.
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
            value={formData.cardholderName}
            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
            placeholder="John Doe"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.cardholderName ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
          {errors.cardholderName && (
            <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
          )}
        </div>

        {/* Card Number */}
        <div>
          <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          {/* Test card numbers: Visa: 4111 1111 1111 1111, Mastercard: 5555 5555 5555 4444, Amex: 3782 822463 10005 */}
          <div className="relative">
            <input
              type="text"
              id="card-number"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cardNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {getCardTypeIcon()}
            </div>
          </div>
          {errors.cardNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
          )}
        </div>

        {/* Expiry, CVV, and ZIP */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              id="expiry-date"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              placeholder="MM/YY"
              maxLength={5}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.expiryDate ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
            )}
          </div>
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <div className="relative">
              <input
                type={showCvv ? 'text' : 'password'}
                id="cvv"
                value={formData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                placeholder="123"
                maxLength={4}
                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.cvv ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowCvv(!showCvv)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showCvv ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.cvv && (
              <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
            )}
          </div>
          <div>
            <label htmlFor="zip-code" className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              id="zip-code"
              value={formData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              placeholder="12345"
              maxLength={5}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.zipCode ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
            )}
          </div>
        </div>

        {/* Processing Steps */}
        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Loader2 className="h-5 w-5 text-blue-600 mr-2 animate-spin" />
              <h3 className="text-sm font-medium text-blue-800">Processing Payment</h3>
            </div>
            <div className="space-y-2">
              {[
                'Validating card information...',
                'Checking account balance...',
                'Verifying security details...',
                'Processing payment...',
                'Confirming transaction...'
              ].map((step, index) => (
                <div key={index} className="flex items-center text-sm">
                  {index < processingStep ? (
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                  ) : index === processingStep ? (
                    <Loader2 className="h-4 w-4 text-blue-600 mr-2 animate-spin" />
                  ) : (
                    <div className="h-4 w-4 mr-2" />
                  )}
                  <span className={index <= processingStep ? 'text-gray-900' : 'text-gray-500'}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {paymentError && (
          <div className="flex items-center p-3 text-red-700 bg-red-100 rounded-lg">
            <X className="h-5 w-5 mr-2" />
            <p className="text-sm font-medium">{paymentError}</p>
          </div>
        )}

        {/* Success Message */}
        {paymentSuccess && (
          <div className="flex items-center p-3 text-green-700 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p className="text-sm font-medium">Payment successful! Transaction completed.</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isProcessing}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
            isLoading || isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
          }`}
        >
          {isLoading || isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <CreditCard className="h-5 w-5 mr-2" />
          )}
          {isLoading || isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </button>

        {/* Security Notice */}
        <div className="flex items-center justify-center text-gray-500 text-sm mt-4">
          <Lock className="h-4 w-4 mr-1" />
          <p>Secured by 256-bit SSL encryption • Demo Environment</p>
        </div>
      </form>
    </div>
  );
}
