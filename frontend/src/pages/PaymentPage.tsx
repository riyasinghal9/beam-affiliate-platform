import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import paymentService from '../services/paymentService';
import trackingService from '../services/trackingService';
import commissionService from '../services/commissionService';
import { 
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  commission: number;
}

const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [resellerId, setResellerId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'beam' | 'bank'>('stripe');
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const productId = searchParams.get('v');
        const resellerIdParam = searchParams.get('id');
        const utmSource = searchParams.get('utm_source');
        const utmMedium = searchParams.get('utm_medium');
        const utmCampaign = searchParams.get('utm_campaign');

        if (!productId || !resellerIdParam) {
          setError('Invalid payment link');
          setLoading(false);
          return;
        }

        setResellerId(resellerIdParam);

        // Get product details
        const products = [
          {
            id: '1',
            name: 'Beam Wallet Installation for Merchants',
            price: 75,
            description: 'Complete installation and setup of Beam Wallet for merchant businesses.',
            commission: 50
          },
          {
            id: '2',
            name: 'Commercial Agent License',
            price: 150,
            description: 'Professional license for commercial agents to use Beam Wallet.',
            commission: 50
          },
          {
            id: '3',
            name: 'Premium Support Package',
            price: 200,
            description: 'Enhanced support package with dedicated account manager.',
            commission: 50
          }
        ];

        // Find product by price (v parameter) or by product ID
        const selectedProduct = products.find(p => p.price.toString() === productId || p.id === productId);
        if (!selectedProduct) {
          setError('Product not found');
          setLoading(false);
          return;
        }

        setProduct(selectedProduct);

        // Track the click
        await trackingService.trackClick({
          resellerId: resellerIdParam,
          productId: productId,
          linkUrl: window.location.href,
          userAgent: navigator.userAgent,
          ipAddress: '', // Will be captured by backend
          referrer: document.referrer,
          utmSource: utmSource || undefined,
          utmMedium: utmMedium || undefined,
          utmCampaign: utmCampaign || undefined,
          timestamp: new Date()
        });

        setLoading(false);
      } catch (error) {
        console.error('Error initializing payment:', error);
        setError('Failed to load payment page');
        setLoading(false);
      }
    };

    initializePayment();
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !customerData.name || !customerData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Calculate commission
      const commissionData = await commissionService.calculateCommission({
        resellerId,
        productId: product.id,
        saleAmount: product.price,
        resellerLevel: 'Beginner' // This should come from user data
      });

      // Process payment
      const paymentData = {
        amount: product.price,
        currency: 'USD',
        resellerId,
        productId: product.id,
        customerEmail: customerData.email,
        customerName: customerData.name,
        paymentMethod
      };

      const paymentResult = await paymentService.processPayment(paymentData);

      // Track the sale
      await trackingService.trackSale({
        resellerId,
        productId: product.id,
        customerEmail: customerData.email,
        customerName: customerData.name,
        amount: product.price,
        commission: commissionData.commissionAmount,
        clickId: paymentResult.clickId,
        paymentMethod,
        timestamp: new Date()
      });

      setSuccess(true);
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment page...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Thank you for your purchase. You will receive a confirmation email shortly.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
          <p className="text-gray-600 mt-2">Secure payment powered by Beam Wallet</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            {product && (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${product.price}</p>
                    <p className="text-sm text-green-600">{product.commission}% commission</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>

            <form onSubmit={handlePayment} className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Customer Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Payment Method</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mr-3"
                    />
                    <CreditCardIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Credit Card</p>
                      <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="beam"
                      checked={paymentMethod === 'beam'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mr-3"
                    />
                    <BanknotesIcon className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Beam Wallet</p>
                      <p className="text-sm text-gray-600">Pay with your Beam Wallet balance</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing Payment...' : `Pay $${product?.price}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 