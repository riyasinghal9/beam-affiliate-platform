import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BeamLogo from '../components/ui/BeamLogo';

const Login: React.FC = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state?.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
      // Clear the state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
    setSuccessMessage(''); // Clear success message when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beam-pink-50 to-beam-purple-50 pt-16">
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <BeamLogo size="xl" showWordmark={true} />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-nunito-extrabold text-beam-charcoal-900 mb-2 sm:mb-3 tracking-beam-tight">
              Sign in to your account
            </h2>
            <p className="text-sm sm:text-base text-beam-charcoal-700 font-nunito-regular tracking-beam-normal">
              Or{' '}
              <Link
                to="/register"
                className="text-beam-pink-600 hover:text-beam-pink-500 font-nunito-semibold transition-colors"
              >
                create a new account to start earning
              </Link>
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-beam p-6 sm:p-8">
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm font-nunito-regular">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm font-nunito-regular">
                  {successMessage}
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
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-beam-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent transition-all duration-200 font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-beam-grey-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent transition-all duration-200 font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400"
                  placeholder="Enter your password"
                />
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-beam-pink-600 focus:ring-beam-pink-500 border-beam-grey-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-3 text-sm font-nunito-regular text-beam-charcoal-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link 
                    to="/forgot-password"
                    className="font-nunito-semibold text-beam-pink-600 hover:text-beam-pink-500 transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
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
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 pt-6 border-t border-beam-grey-200">
              <p className="text-center text-sm font-nunito-regular text-beam-charcoal-600 mb-3">
                New to Beam Affiliate?
              </p>
              <Link
                to="/register"
                className="block w-full text-center px-4 py-2 border border-beam-grey-300 rounded-lg text-sm font-nunito-semibold text-beam-charcoal-700 bg-white hover:bg-beam-grey-50 focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:ring-offset-2 transition-all duration-200"
              >
                Create your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 