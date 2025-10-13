import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BeamLogo from '../components/ui/BeamLogo';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // TODO: Implement actual API call to backend
      // const response = await axios.post('/api/auth/forgot-password', { email });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beam-pink-50 to-beam-purple-50 pt-16">
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <BeamLogo size="xl" showWordmark={true} />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-nunito-extrabold text-beam-charcoal-900 mb-2 sm:mb-3 tracking-beam-tight">
              Forgot your password?
            </h2>
            <p className="text-sm sm:text-base font-nunito-regular text-beam-charcoal-700 tracking-beam-normal">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-beam p-6 sm:p-8">
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-nunito-semibold text-beam-charcoal-900 mb-2 tracking-beam-normal">
                  Check your email
                </h3>
                <p className="text-sm sm:text-base font-nunito-regular text-beam-charcoal-700 mb-6 tracking-beam-normal">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <Link
                  to="/login"
                  className="inline-block bg-gradient-beam text-white font-nunito-semibold py-3 px-6 rounded-lg hover:bg-gradient-beam-reverse transition-all duration-200 shadow-beam hover:shadow-beam-lg"
                >
                  Back to login
                </Link>
              </div>
            ) : (
              <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm font-nunito-regular">
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-beam-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent transition-all duration-200 font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-beam text-white font-nunito-bold py-3 px-4 rounded-lg hover:bg-gradient-beam-reverse focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-beam hover:shadow-beam-lg text-base sm:text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>
            )}

            {/* Back to Login Link */}
            {!success && (
              <div className="mt-6 pt-6 border-t border-beam-grey-200 text-center">
                <Link
                  to="/login"
                  className="text-beam-pink-600 hover:text-beam-pink-500 font-nunito-semibold transition-colors"
                >
                  ← Back to login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 