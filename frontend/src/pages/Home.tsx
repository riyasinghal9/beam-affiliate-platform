import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl lg:text-3xl">B</span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Start Earning Money
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                With Beam Wallet
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of people making money online by sharing Beam Wallet services. 
              No investment, no technical skills needed - just share links and earn commissions!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Earning Now
              </Link>
              <Link
                to="/products"
                className="w-full sm:w-auto bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                View Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">10,000+</div>
              <div className="text-sm lg:text-base text-gray-600">Active Resellers</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CurrencyDollarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">$2M+</div>
              <div className="text-sm lg:text-base text-gray-600">Total Commissions</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <GlobeAltIcon className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">50+</div>
              <div className="text-sm lg:text-base text-gray-600">Countries</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <RocketLaunchIcon className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">24/7</div>
              <div className="text-sm lg:text-base text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Beam Wallet Affiliate?
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Join the most accessible and profitable affiliate program in the digital payment space
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-200 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                <DevicePhoneMobileIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Mobile-First</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Work from anywhere with your smartphone. Share links on WhatsApp, social media, and earn money on the go.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-200 text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <CurrencyDollarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">High Commissions</h3>
              <p className="text-gray-600 leading-relaxed">
                Earn up to 50% commission on every sale. No limits, no caps - the more you sell, the more you earn.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-200 text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <ShieldCheckIcon className="w-6 h-6 lg:w-8 lg:h-8 text-purple-600" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Secure Payments</h3>
              <p className="text-gray-600 leading-relaxed">
                Get paid directly to your Beam Wallet. Secure, instant, and transparent payment processing.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-200 text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <SparklesIcon className="w-6 h-6 lg:w-8 lg:h-8 text-orange-600" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">No Experience Needed</h3>
              <p className="text-gray-600 leading-relaxed">
                Start earning immediately. We provide training, materials, and support to help you succeed.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-200 text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-red-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <ChartBarIcon className="w-6 h-6 lg:w-8 lg:h-8 text-red-600" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Real-Time Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Track your performance, clicks, conversions, and earnings in real-time with detailed analytics.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-200 text-center">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <UserGroupIcon className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Community Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Join our community of successful resellers. Share strategies and learn from others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in 3 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl lg:text-3xl font-bold">
                1
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Sign Up</h3>
              <p className="text-gray-600 leading-relaxed">
                Create your free account and get your unique reseller ID. No investment required.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl lg:text-3xl font-bold">
                2
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Share Links</h3>
              <p className="text-gray-600 leading-relaxed">
                Get your personalized affiliate links and share them on social media, WhatsApp, or email.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl lg:text-3xl font-bold">
                3
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Earn Money</h3>
              <p className="text-gray-600 leading-relaxed">
                When someone purchases through your link, you earn commission automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 mb-8">
            Join thousands of people who are already making money with Beam Wallet affiliate program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Earning Now
            </Link>
            <Link
              to="/login"
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 