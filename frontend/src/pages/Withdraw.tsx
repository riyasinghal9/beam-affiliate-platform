import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BanknotesIcon,
  CreditCardIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const Withdraw: React.FC = () => {
  const { user } = useAuth();
  const [withdrawalMethod, setWithdrawalMethod] = useState<'beam' | 'bank' | 'card'>('beam');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const availableBalance = user?.balance || 0;

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > availableBalance) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate withdrawal API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
      }, 3000);
    } catch (error) {
      setError('Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Withdrawal Successful!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your withdrawal request has been processed. You will receive the funds within 24-48 hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beam-grey-50 pt-16">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-nunito-extrabold text-beam-charcoal-900 mb-4 tracking-beam-tight">
            💸 Withdraw Earnings
          </h1>
          <p className="text-lg sm:text-xl font-nunito-regular text-beam-charcoal-600 tracking-beam-normal">
            Transfer your earnings to your preferred payment method
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <div className="bg-white rounded-xl shadow-beam p-6 lg:p-8 border border-beam-grey-200">
            <h2 className="text-xl font-nunito-semibold text-beam-charcoal-900 mb-6 tracking-beam-normal">Withdrawal Details</h2>
            
            <form onSubmit={handleWithdrawal} className="space-y-6">
              {/* Available Balance */}
              <div className="bg-beam-teal-50 border border-beam-teal-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-nunito-semibold text-beam-teal-800">Available Balance</span>
                  <span className="text-2xl font-nunito-bold text-beam-teal-900">${availableBalance.toFixed(2)}</span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label htmlFor="amount" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="10"
                    max={availableBalance}
                    step="0.01"
                    required
                    className="w-full px-4 py-3 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900"
                    placeholder="Enter amount to withdraw"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-beam-charcoal-500 text-sm font-nunito-regular">USD</span>
                  </div>
                </div>
                <p className="mt-1 text-sm font-nunito-regular text-beam-charcoal-500">
                  Minimum withdrawal: $10.00
                </p>
              </div>

              {/* Withdrawal Method */}
              <div>
                <label className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-3">
                  Withdrawal Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-beam-grey-300 rounded-lg cursor-pointer hover:bg-beam-grey-50 transition-colors duration-200">
                    <input
                      type="radio"
                      name="withdrawalMethod"
                      value="beam"
                      checked={withdrawalMethod === 'beam'}
                      onChange={(e) => setWithdrawalMethod(e.target.value as any)}
                      className="mr-3 text-beam-pink-600 focus:ring-beam-pink-500"
                    />
                    <BanknotesIcon className="h-6 w-6 text-beam-pink-600 mr-3" />
                    <div>
                      <p className="font-nunito-semibold text-beam-charcoal-900">Beam Wallet</p>
                      <p className="text-sm font-nunito-regular text-beam-charcoal-600">Instant transfer to your Beam Wallet</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-beam-grey-300 rounded-lg cursor-pointer hover:bg-beam-grey-50 transition-colors duration-200">
                    <input
                      type="radio"
                      name="withdrawalMethod"
                      value="bank"
                      checked={withdrawalMethod === 'bank'}
                      onChange={(e) => setWithdrawalMethod(e.target.value as any)}
                      className="mr-3 text-beam-pink-600 focus:ring-beam-pink-500"
                    />
                    <BanknotesIcon className="h-6 w-6 text-beam-teal-600 mr-3" />
                    <div>
                      <p className="font-nunito-semibold text-beam-charcoal-900">Bank Transfer</p>
                      <p className="text-sm font-nunito-regular text-beam-charcoal-600">2-3 business days</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-beam-grey-300 rounded-lg cursor-pointer hover:bg-beam-grey-50 transition-colors duration-200">
                    <input
                      type="radio"
                      name="withdrawalMethod"
                      value="card"
                      checked={withdrawalMethod === 'card'}
                      onChange={(e) => setWithdrawalMethod(e.target.value as any)}
                      className="mr-3 text-beam-pink-600 focus:ring-beam-pink-500"
                    />
                    <CreditCardIcon className="h-6 w-6 text-beam-purple-600 mr-3" />
                    <div>
                      <p className="font-nunito-semibold text-beam-charcoal-900">Credit/Debit Card</p>
                      <p className="text-sm font-nunito-regular text-beam-charcoal-600">1-2 business days</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    <p className="ml-3 text-sm font-nunito-regular text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !amount || parseFloat(amount) <= 0}
                className="w-full bg-gradient-beam text-white py-3 px-6 rounded-lg font-nunito-semibold hover:shadow-beam transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Withdraw ${amount || '0.00'}
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Information Panel */}
          <div className="space-y-6">
            {/* Withdrawal Limits */}
            <div className="bg-white rounded-xl shadow-beam p-6 border border-beam-grey-200">
              <h3 className="text-lg font-nunito-semibold text-beam-charcoal-900 mb-4 tracking-beam-normal">Withdrawal Limits</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-beam-charcoal-600 font-nunito-regular">Minimum withdrawal</span>
                  <span className="font-nunito-semibold text-beam-charcoal-900">$10.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-beam-charcoal-600 font-nunito-regular">Maximum withdrawal</span>
                  <span className="font-nunito-semibold text-beam-charcoal-900">$10,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-beam-charcoal-600 font-nunito-regular">Daily limit</span>
                  <span className="font-nunito-semibold text-beam-charcoal-900">$5,000.00</span>
                </div>
              </div>
            </div>

            {/* Processing Times */}
            <div className="bg-white rounded-xl shadow-beam p-6 border border-beam-grey-200">
              <h3 className="text-lg font-nunito-semibold text-beam-charcoal-900 mb-4 tracking-beam-normal">Processing Times</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-beam-charcoal-600 font-nunito-regular">Beam Wallet</span>
                  <span className="font-nunito-semibold text-beam-teal-600">Instant</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-beam-charcoal-600 font-nunito-regular">Bank Transfer</span>
                  <span className="font-nunito-semibold text-beam-charcoal-900">2-3 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-beam-charcoal-600 font-nunito-regular">Credit/Debit Card</span>
                  <span className="font-nunito-semibold text-beam-charcoal-900">1-2 days</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-beam-blue-50 border border-beam-blue-200 rounded-lg p-4">
              <h4 className="font-nunito-semibold text-beam-blue-900 mb-2">Security Notice</h4>
              <p className="text-sm font-nunito-regular text-beam-blue-800">
                All withdrawals are processed securely through our payment partners. 
                Your financial information is protected with bank-level security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw; 