import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCardIcon } from '@heroicons/react/24/outline';

interface StripePaymentFormProps {
  amount: number;
  customerData: {
    name: string;
    email: string;
    phone: string;
  };
  productData: {
    _id: string;
    name: string;
    price: number;
    commission: number;
  };
  resellerId: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  processing: boolean;
  setProcessing: (processing: boolean) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  customerData,
  productData,
  resellerId,
  onSuccess,
  onError,
  processing,
  setProcessing
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      onError('Stripe has not loaded yet');
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method first
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message || 'Failed to create payment method');
      }

      // Create payment intent with payment method attached
      const { error: paymentIntentError, paymentIntent } = await stripe.confirmCardPayment(
        // Create payment intent and get client secret
        await fetch('http://localhost:5001/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount * 100,
            currency: 'usd',
            metadata: {
              resellerId: resellerId,
              productId: productData._id,
              customerEmail: customerData.email
            }
          })
        }).then(res => res.json()).then(data => data.clientSecret),
        {
          payment_method: paymentMethod.id
        }
      );

      if (paymentIntentError) {
        throw new Error(paymentIntentError.message || 'Payment failed');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      } else {
        throw new Error('Payment was not completed');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      onError(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stripe Card Element */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Card Details</h3>
        
        <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
            className="p-3 border border-gray-300 rounded-lg bg-white"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="button" onClick={handleSubmit}
          disabled={processing || !stripe || !elements}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
        >
          {processing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CreditCardIcon className="w-5 h-5 mr-2" />
              Pay ${amount}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default StripePaymentForm; 