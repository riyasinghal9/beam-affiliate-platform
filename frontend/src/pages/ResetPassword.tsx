import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import BeamLogo from '../components/ui/BeamLogo';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid reset link');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5001/api/auth/reset-password', {
        token,
        newPassword: formData.password
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beam-pink-50 to-beam-purple-50 pt-16">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-nunito-extrabold text-beam-charcoal-900 tracking-beam-tight">
                Password Reset Successful!
              </h2>
              <p className="mt-2 text-sm sm:text-base font-nunito-regular text-beam-charcoal-700 tracking-beam-normal">
                Your password has been successfully reset. You will be redirected to the login page.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beam-pink-50 to-beam-purple-50 pt-16">
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8">
          <div>
            <div className="flex justify-center">
              <Link to="/" className="flex items-center group">
                <BeamLogo size="lg" showWordmark={true} />
              </Link>
            </div>
            <h2 className="mt-6 text-center text-xl sm:text-2xl lg:text-3xl font-nunito-extrabold text-beam-charcoal-900 tracking-beam-tight">
              Reset Your Password
            </h2>
            <p className="mt-2 text-center text-sm sm:text-base font-nunito-regular text-beam-charcoal-700 tracking-beam-normal">
              Enter your new password below
            </p>
          </div>

          <form className="mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-beam-grey-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-beam-grey-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-beam-grey-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-beam-grey-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <p className="text-red-600 text-sm font-nunito-regular">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-beam text-sm font-nunito-bold text-white bg-gradient-beam hover:bg-gradient-beam-reverse focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beam-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm font-nunito-semibold text-beam-pink-600 hover:text-beam-pink-500 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 