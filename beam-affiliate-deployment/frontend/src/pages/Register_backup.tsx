import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import BeamLogo from '../components/ui/BeamLogo';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  beamWalletNumber: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    beamWalletNumber: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        beamNumber: formData.beamWalletNumber
      });

      if (response.success) {
        setSuccess(true);
        setLoading(false);
        
        // Show success message for 2 seconds then redirect
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Registration successful! You can now log in with your email and password.',
              email: formData.email 
            } 
          });
        }, 2000);
      } else {
        setError('Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beam-pink-50 to-beam-purple-50 pt-16">
      <div className="flex flex-col justify-center min-h-[calc(100vh-4rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md lg:max-w-lg">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <BeamLogo size="xl" showWordmark={true} />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-nunito-extrabold text-beam-charcoal-900 mb-2 sm:mb-3 tracking-beam-tight">
              Start Earning Today
            </h2>
            <p className="text-sm sm:text-base font-nunito-regular text-beam-charcoal-700 tracking-beam-normal">
              Join the Beam Affiliate Program and start earning commissions
            </p>
          </div>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md lg:max-w-lg">
          <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow-beam rounded-2xl">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-nunito-regular text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-nunito-regular text-green-600">✅ Registration successful! Redirecting to login...</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    disabled={success}
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-beam-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent transition-all duration-200 disabled:bg-beam-grey-100 disabled:cursor-not-allowed font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    disabled={success}
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-beam-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent transition-all duration-200 disabled:bg-beam-grey-100 disabled:cursor-not-allowed font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

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
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-beam-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent transition-all duration-200 font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Beam Wallet Number Field */}
              <div>
                <label htmlFor="beamWalletNumber" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                  Enter your Beam Wallet number
                </label>
                <p className="text-sm font-nunito-regular text-beam-charcoal-500 mb-3">
                  This is where your commissions will be automatically paid.
                </p>
                <input
                  id="beamWalletNumber"
                  name="beamWalletNumber"
                  type="text"
                  required
                  value={formData.beamWalletNumber}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-beam-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent transition-all duration-200 font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400"
                  placeholder="Enter your Beam Wallet number"
                />
              </div>

              {/* Password Fields */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-beam-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent transition-all duration-200 font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400"
                    placeholder="Create a password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-beam-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent transition-all duration-200 font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 text-beam-pink-600 focus:ring-beam-pink-500 border-beam-grey-300 rounded"
                />
                <label htmlFor="agree-terms" className="ml-3 text-sm font-nunito-regular text-beam-charcoal-700 leading-relaxed tracking-beam-normal">
                  I agree to the{' '}
                  <button type="button" className="text-beam-pink-600 hover:text-beam-pink-500 font-nunito-semibold">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-beam-pink-600 hover:text-beam-pink-500 font-nunito-semibold">
                    Privacy Policy
                  </button>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-gradient-beam text-white font-nunito-bold py-3 px-4 rounded-lg hover:bg-gradient-beam-reverse focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-beam hover:shadow-beam-lg text-base sm:text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : success ? (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">✅</span>
                    Account created successfully!
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            {/* Login Link - No extra gap */}
            <div className="mt-4 pt-4 border-t border-beam-grey-200">
              <p className="text-center text-sm font-nunito-regular text-beam-charcoal-600 mb-3">
                Already have an account?
              </p>
              <Link
                to="/login"
                className="block w-full text-center px-4 py-2 border border-beam-grey-300 rounded-lg text-sm font-nunito-semibold text-beam-charcoal-700 bg-white hover:bg-beam-grey-50 focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:ring-offset-2 transition-all duration-200"
              >
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 