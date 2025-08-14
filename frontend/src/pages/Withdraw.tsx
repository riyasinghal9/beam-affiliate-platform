import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BanknotesIcon,
  CreditCardIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Withdraw Funds
          </h1>
          <p className="text-lg text-gray-600">
            Transfer your earnings to your preferred payment method
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Withdrawal Details</h2>
            
            <form onSubmit={handleWithdrawal} className="space-y-6">
              {/* Available Balance */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Available Balance</span>
                  <span className="text-2xl font-bold text-green-900">${availableBalance.toFixed(2)}</span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount to withdraw"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <span className="text-gray-500 text-sm">USD</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Minimum withdrawal: $10.00
                </p>
              </div>

              {/* Withdrawal Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Withdrawal Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="withdrawalMethod"
                      value="beam"
                      checked={withdrawalMethod === 'beam'}
                      onChange={(e) => setWithdrawalMethod(e.target.value as any)}
                      className="mr-3"
                    />
                    <BanknotesIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Beam Wallet</p>
                      <p className="text-sm text-gray-600">Instant transfer to your Beam Wallet</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="withdrawalMethod"
                      value="bank"
                      checked={withdrawalMethod === 'bank'}
                      onChange={(e) => setWithdrawalMethod(e.target.value as any)}
                      className="mr-3"
                    />
                    <BanknotesIcon className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Bank Transfer</p>
                      <p className="text-sm text-gray-600">2-3 business days</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="withdrawalMethod"
                      value="card"
                      checked={withdrawalMethod === 'card'}
                      onChange={(e) => setWithdrawalMethod(e.target.value as any)}
                      className="mr-3"
                    />
                    <CreditCardIcon className="h-6 w-6 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Credit/Debit Card</p>
                      <p className="text-sm text-gray-600">1-2 business days</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    <p className="ml-3 text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !amount || parseFloat(amount) <= 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Withdrawal Limits</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum withdrawal</span>
                  <span className="font-semibold">$10.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maximum withdrawal</span>
                  <span className="font-semibold">$10,000.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily limit</span>
                  <span className="font-semibold">$5,000.00</span>
                </div>
              </div>
            </div>

            {/* Processing Times */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Processing Times</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Beam Wallet</span>
                  <span className="font-semibold text-green-600">Instant</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank Transfer</span>
                  <span className="font-semibold">2-3 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credit/Debit Card</span>
                  <span className="font-semibold">1-2 days</span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Security Notice</h4>
              <p className="text-sm text-blue-800">
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