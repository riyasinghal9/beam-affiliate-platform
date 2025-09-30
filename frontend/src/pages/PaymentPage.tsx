import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import trackingService from '../services/trackingService';
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Product {
  _id: string;
  id?: string; // Keep for backward compatibility
  name: string;
  price: number;
  description: string;
  commission: number;
}

const PaymentPage: React.FC = () => {
  return <PaymentPageContent />;
};

const PaymentPageContent: React.FC = () => {
  const navigate = useNavigate();

  // Store URL parameters in a ref - this will NEVER change
  type PaymentUrlParams = {
    price: string | null;
    resellerIdParam: string | null;
    productId: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
  };
  const rawParams = new URLSearchParams(window.location.search);
  const urlParamsRef = useRef<PaymentUrlParams>({
    price: rawParams.get('v'),
    resellerIdParam: rawParams.get('id'),
    productId: rawParams.get('product'),
    utmSource: rawParams.get('utm_source'),
    utmMedium: rawParams.get('utm_medium'),
    utmCampaign: rawParams.get('utm_campaign')
  });

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [storeUrl, setStoreUrl] = useState<string>('');
  const [countdown, setCountdown] = useState(3);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeRedirect = async () => {
      try {
        console.log('PaymentPage: Initializing redirect...', urlParamsRef.current);
        const { price, resellerIdParam, productId, utmSource, utmMedium, utmCampaign } = urlParamsRef.current;

        console.log('PaymentPage: Parameters:', { price, resellerIdParam, productId });

        if (!price || !resellerIdParam) {
          console.log('PaymentPage: Missing required parameters');
          setError(`This payment link is invalid or incomplete. Please use a valid affiliate link to access this page.`);
          setLoading(false);
          return;
        }

        // resellerId is available from resellerIdParam

        // Get product details from database
        let selectedProduct = null;
        
        try {
          console.log('PaymentPage: Fetching products...');
          // Fetch products from the backend API
          const response = await fetch('http://localhost:5001/api/products');
          
          if (response.ok) {
            const products = await response.json();
            console.log('PaymentPage: Products fetched:', products.length, 'products');
            
            // Find product by product ID first, then by price
            if (productId) {
              selectedProduct = products.find((p: any) => p._id === productId);
              console.log('PaymentPage: Product found by ID:', selectedProduct?.name);
            }
            if (!selectedProduct) {
              selectedProduct = products.find((p: any) => p.price.toString() === price);
              console.log('PaymentPage: Product found by price:', selectedProduct?.name);
            }
          } else {
            console.log('PaymentPage: Failed to fetch products:', response.status);
          }
        } catch (error) {
          console.log('PaymentPage: Error fetching products:', error);
        }

        if (!selectedProduct) {
          console.log('PaymentPage: No product found');
          setError('Product not found');
          setLoading(false);
          return;
        }

        console.log('PaymentPage: Setting product:', selectedProduct.name);
        setProduct(selectedProduct);
        setLoading(false);

        // Track the click
        try {
          console.log('PaymentPage: Tracking click...');
          await trackingService.trackClick({
            resellerId: resellerIdParam,
            productId: selectedProduct._id,
            linkUrl: window.location.href,
            timestamp: new Date(),
            ipAddress: '',
            userAgent: navigator.userAgent || 'unknown',
            referrer: document.referrer || '',
            utmSource: utmSource || '',
            utmMedium: utmMedium || '',
            utmCampaign: utmCampaign || ''
          });
          console.log('PaymentPage: Click tracked successfully');
        } catch (trackingError) {
          console.warn('PaymentPage: Tracking failed, but continuing with redirect:', trackingError);
        }

        // Generate store URL with tracking parameters using product's specific URL
        const baseStoreUrl = selectedProduct.externalShopUrl || selectedProduct.externalUrl || 'https://shop.beamwallet.com';
        const trackingParams = new URLSearchParams({
          affiliate_id: resellerIdParam,
          product_id: selectedProduct._id,
          product_price: selectedProduct.price.toString(),
          utm_source: utmSource || 'affiliate',
          utm_medium: utmMedium || 'link',
          utm_campaign: utmCampaign || 'beam_affiliate',
          ref: 'beam_affiliate_platform'
        });
        
        // Check if the URL already has parameters
        const separator = baseStoreUrl.includes('?') ? '&' : '?';
        const finalStoreUrl = `${baseStoreUrl}${separator}${trackingParams.toString()}`;
        console.log('PaymentPage: Generated store URL:', finalStoreUrl);
        setStoreUrl(finalStoreUrl);

        // Start countdown timer
        console.log('PaymentPage: Starting countdown timer...');
        let timeLeft = 3;
        setCountdown(timeLeft);
        
        countdownIntervalRef.current = setInterval(() => {
          timeLeft -= 1;
          setCountdown(timeLeft);
          
          if (timeLeft <= 0) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            console.log('PaymentPage: Countdown finished, redirecting to store...');
            setRedirecting(true);
            window.location.href = finalStoreUrl;
          }
        }, 1000);

      } catch (error) {
        console.error('Error initializing redirect:', error);
        setError('Failed to load redirect page');
        setLoading(false);
      }
    };

    initializeRedirect();
  }, []); // Run once on mount

  // Cleanup countdown interval on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);

  const handleManualRedirect = () => {
    if (storeUrl) {
      // Clear the countdown interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setRedirecting(true);
      window.location.href = storeUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beam-grey-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-beam-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-beam-charcoal-600 font-nunito-regular">Preparing your purchase...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-beam-grey-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-nunito-extrabold text-beam-charcoal-900 mb-2 tracking-beam-tight">Invalid Link</h2>
          <p className="text-beam-charcoal-700 mb-4 font-nunito-regular">{error}</p>
          <div className="bg-beam-teal-50 border border-beam-teal-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-beam-teal-800 mb-2 font-nunito-semibold">
              <strong>How to get a valid affiliate link:</strong>
            </p>
            <ol className="text-sm text-beam-teal-700 text-left space-y-1 font-nunito-regular">
              <li>1. Go to the Products page</li>
              <li>2. Click "Get Affiliate Link" on any product</li>
              <li>3. Use that link to access the store</li>
            </ol>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/products')}
              className="w-full bg-gradient-beam text-white px-6 py-3 rounded-lg hover:bg-gradient-beam-reverse font-nunito-semibold shadow-beam hover:shadow-beam-lg transition-all duration-200"
            >
              Go to Products
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-beam-charcoal-600 text-white px-6 py-3 rounded-lg hover:bg-beam-charcoal-700 font-nunito-semibold transition-colors duration-200"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-beam-grey-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-beam-pink-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-2xl font-nunito-extrabold text-beam-charcoal-900 mb-2 tracking-beam-tight">Redirecting to Store...</h2>
          <p className="text-beam-charcoal-700 mb-4 font-nunito-regular">Taking you to the official Beam Wallet store</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beam-grey-50 pt-16">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-beam-pink-600 hover:text-beam-pink-700 mb-4 font-nunito-semibold transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </button>
          <h1 className="text-3xl font-nunito-extrabold text-beam-charcoal-900 tracking-beam-tight">Complete Your Purchase</h1>
          <p className="text-beam-charcoal-700 mt-2 font-nunito-regular">You'll be redirected to our official Beam Wallet store</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Details */}
          <div className="bg-white rounded-2xl shadow-beam p-6">
            <h2 className="text-xl font-nunito-semibold text-beam-charcoal-900 mb-4 tracking-beam-normal">Order Summary</h2>

            {product && (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-beam-grey-50 rounded-lg">
                  <div>
                    <h3 className="font-nunito-semibold text-beam-charcoal-900">{product.name}</h3>
                    <p className="text-sm text-beam-charcoal-600 font-nunito-regular">{product.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-nunito-extrabold text-beam-charcoal-900">${product.price}</p>
                    <p className="text-sm text-beam-teal-600 font-nunito-semibold">{product.commission}% commission</p>
                  </div>
                </div>

                <div className="border-t border-beam-grey-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-nunito-semibold text-beam-charcoal-700">Total</span>
                    <span className="text-2xl font-nunito-extrabold text-beam-charcoal-900">${product.price}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Redirect Information */}
          <div className="bg-white rounded-2xl shadow-beam p-6">
            <h2 className="text-xl font-nunito-semibold text-beam-charcoal-900 mb-4 tracking-beam-normal">Redirecting to Store</h2>
            
            <div className="space-y-6">
              {/* Countdown Timer */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <ClockIcon className="h-8 w-8 text-beam-pink-500 mr-2" />
                  <span className="text-2xl font-nunito-extrabold text-beam-charcoal-900">{countdown}</span>
                </div>
                <p className="text-beam-charcoal-700 font-nunito-regular">
                  Redirecting automatically in <span className="font-nunito-semibold text-beam-pink-600">{countdown} second{countdown !== 1 ? 's' : ''}</span>
                </p>
              </div>

              {/* Store Information */}
              <div className="bg-beam-teal-50 border border-beam-teal-200 rounded-lg p-4">
                <h3 className="font-nunito-semibold text-beam-teal-800 mb-2">Official Beam Wallet Store</h3>
                <p className="text-sm text-beam-teal-700 font-nunito-regular mb-3">
                  You'll be redirected to our secure, official store where you can complete your purchase safely.
                </p>
                <div className="flex items-center text-sm text-beam-teal-600">
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                  <span className="font-nunito-semibold">shop.beamwallet.com</span>
                </div>
              </div>

              {/* Manual Redirect Button */}
              <button
                onClick={handleManualRedirect}
                className="w-full bg-gradient-beam text-white py-3 px-4 rounded-lg font-nunito-semibold hover:bg-gradient-beam-reverse focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:ring-offset-2 transition-all duration-200 shadow-beam hover:shadow-beam-lg flex items-center justify-center"
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-2" />
                Go to Store Now
              </button>

              {/* Tracking Notice */}
              <div className="text-xs text-beam-charcoal-500 text-center font-nunito-regular">
                Your purchase will be tracked for commission purposes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 