import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon, DocumentTextIcon, ArrowRightIcon,
  HomeIcon, ArrowDownTrayIcon, ShareIcon, ClipboardIcon, InformationCircleIcon
} from '@heroicons/react/24/outline';

interface PaymentSuccessData {
  paymentId: string;
  product: {
    name: string;
    price: number;
    description: string;
  };
  resellerId: string;
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (location.state) {
      setPaymentData(location.state as PaymentSuccessData);
    } else {
      // If no state, redirect to home
      navigate('/');
    }
  }, [location.state, navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadReceipt = () => {
    if (!paymentData) return;

    const receiptContent = `
Payment Receipt

Payment ID: ${paymentData.paymentId}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Product: ${paymentData.product.name}
Amount: ${formatCurrency(paymentData.product.price)}

Thank you for your purchase!

Beam Affiliate Platform
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${paymentData.paymentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sharePurchase = async () => {
    if (!paymentData) return;

    const shareText = `I just purchased ${paymentData.product.name} through Beam Affiliate Platform!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Purchase Complete',
          text: shareText,
          url: window.location.origin
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying to clipboard
      copyToClipboard(shareText);
    }
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beam-pink-50 to-beam-purple-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Content */}
        <div className="text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your purchase. Your transaction has been completed successfully.
            </p>
          </div>
        </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transaction Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Transaction Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment ID:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {paymentData.paymentId}
                  </span>
                  <button
                    onClick={() => copyToClipboard(paymentData.paymentId)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ClipboardIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{paymentData.product.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(paymentData.product.price)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Completed
                </span>
              </div>
            </div>

            {/* Product Information */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Product Information</h3>
              <p className="text-gray-600 text-sm">
                {paymentData.product.description}
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What's Next?
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Check Your Email</h3>
                  <p className="text-sm text-gray-600">
                    You'll receive a confirmation email with your purchase details and next steps.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Access Your Product</h3>
                  <p className="text-sm text-gray-600">
                    Follow the instructions in your email to access your purchased product.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Get Support</h3>
                  <p className="text-sm text-gray-600">
                    If you need help, contact our support team. We're here to assist you.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={downloadReceipt}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download Receipt
              </button>

              <button
                onClick={sharePurchase}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ShareIcon className="h-4 w-4 mr-2" />
                Share Purchase
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                Return to Home
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-6 w-6 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Important Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your payment has been securely processed through Beam Wallet</li>
                <li>• A confirmation email has been sent to your email address</li>
                <li>• Keep your Payment ID for future reference</li>
                <li>• If you have any questions, please contact our support team</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <DocumentTextIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900 mb-1">Documentation</h4>
              <p className="text-sm text-gray-600 mb-3">
                Access product guides and tutorials
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View Docs <ArrowRightIcon className="h-3 w-3 inline ml-1" />
              </button>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="h-8 w-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">?</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Support</h4>
              <p className="text-sm text-gray-600 mb-3">
                Get help from our support team
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Contact Support <ArrowRightIcon className="h-3 w-3 inline ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 