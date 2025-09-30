import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CreditCardIcon, CheckCircleIcon, XCircleIcon,
  ClockIcon, ExclamationTriangleIcon, InformationCircleIcon,
  ArrowLeftIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  commission: number;
  category: string;
  image?: string;
}

interface PaymentForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  agreeToTerms: boolean;
}

const PaymentProcessor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [resellerId, setResellerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  
  const [formData, setFormData] = useState<PaymentForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    agreeToTerms: false
  });

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);
      
      // Get parameters from URL
      const productId = searchParams.get('product');
      const resellerIdParam = searchParams.get('id');
      const amount = searchParams.get('v');

      if (!productId || !resellerIdParam) {
        setError('Invalid payment link. Missing required parameters.');
        return;
      }

      setResellerId(resellerIdParam);

      // Fetch product details
      const response = await fetch(`/api/admin/products/${productId}`);
      if (response.ok) {
        const productData = await response.json();
        setProduct(productData.product);
      } else {
        setError('Product not found or unavailable.');
        return;
      }

      // Track click for analytics
      await fetch('/api/reseller/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resellerId: resellerIdParam,
          productId,
          source: 'direct'
        })
      });

    } catch (error) {
      console.error('Payment initialization error:', error);
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!product) {
      setError('Product information not available');
      return;
    }

    try {
      setProcessing(true);
      setError('');

      const paymentData = {
        amount: product.price,
        customerData: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone
        },
        productData: {
          _id: product._id,
          name: product.name,
          price: product.price
        },
        resellerId
      };

      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (data.success) {
        setPaymentId(data.paymentId);
        setSuccess(true);
        
        // Redirect to success page after 3 seconds
        setTimeout(() => {
          navigate('/payment-success', { 
            state: { 
              paymentId: data.paymentId,
              product: product,
              resellerId: resellerId
            }
          });
        }, 3000);
      } else {
        setError(data.message || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment has been processed successfully. Payment ID: {paymentId}
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to success page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beam-grey-50 pt-16">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Home
            </button>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Secure Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
            
            {product && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(product.price)}
                  </span>
                </div>
                
                <p className="text-gray-600">{product.description}</p>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Commission Rate:</span>
                    <span className="font-medium">{product.commission}%</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                  <h4 className="font-medium text-blue-900 mb-2">Security Features</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• SSL Encrypted Payment</li>
                    <li>• PCI DSS Compliant</li>
                    <li>• Fraud Protection</li>
                    <li>• Secure Data Handling</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Payment Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Product Price:</span>
                  <span className="font-medium">{product && formatCurrency(product.price)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {product && formatCurrency(product.price)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="h-5 w-5 mr-2" />
                    Pay {product && formatCurrency(product.price)}
                  </>
                )}
              </button>
            </form>

            {/* Payment Methods */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Accepted Payment Methods</h4>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    BW
                  </div>
                  <span className="text-sm text-gray-600">Beam Wallet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    CC
                  </div>
                  <span className="text-sm text-gray-600">Credit Card</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessor; 