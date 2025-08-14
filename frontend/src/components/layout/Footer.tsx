import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShareIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden mt-16 sm:mt-20 lg:mt-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg p-2">
                <span className="text-white font-bold text-sm sm:text-base">B</span>
              </div>
              <span className="ml-4 text-2xl font-bold text-white">
                Beam Affiliate
              </span>
            </div>
            <p className="text-gray-300 mb-6 sm:mb-8 max-w-lg leading-relaxed text-base sm:text-lg">
              Join thousands of successful resellers earning money online with Beam Wallet. 
              No investment required, start earning today!
            </p>
            
            {/* Social Media */}
            <div className="flex gap-2 sm:gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white hover:from-blue-500 hover:to-blue-600 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
              >
                <ShareIcon className="h-6 w-6" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-sky-500 to-sky-600 rounded-xl flex items-center justify-center text-white hover:from-sky-400 hover:to-sky-500 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
              >
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
              >
                <UserGroupIcon className="h-6 w-6" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white hover:from-pink-400 hover:to-purple-500 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
              >
                <PhotoIcon className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          {/* Platform and Support Section */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Platform Links */}
              <div className="flex flex-col items-start">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                  <div className="w-10 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-3"></div>
                  Platform
                </h3>
                <ul className="space-y-4">
                  <li>
                    <Link to="/products" className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors duration-200"></div>
                      <span className="font-medium text-base sm:text-lg">Products</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors duration-200"></div>
                      <span className="font-medium text-base sm:text-lg">Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/transactions" className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors duration-200"></div>
                      <span className="font-medium text-base sm:text-lg">Transactions</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-blue-300 transition-colors duration-200"></div>
                      <span className="font-medium text-base sm:text-lg">Profile</span>
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* Support Links */}
              <div className="flex flex-col items-start">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                  <div className="w-10 h-1 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mr-3"></div>
                  Support
                </h3>
                <ul className="space-y-4">
                  <li>
                    <button className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1 w-full">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mr-3 group-hover:bg-pink-300 transition-colors duration-200"></div>
                      <span className="font-medium text-base sm:text-lg">Help Center</span>
                    </button>
                  </li>
                  <li>
                    <button className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1 w-full">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mr-3 group-hover:bg-pink-300 transition-colors duration-200"></div>
                      <span className="font-medium text-base sm:text-lg">Contact Us</span>
                    </button>
                  </li>
                  <li>
                    <button className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1 w-full">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mr-3 group-hover:bg-pink-300 transition-colors duration-200"></div>
                      <span className="font-medium text-base sm:text-lg">Privacy Policy</span>
                    </button>
                  </li>
                  <li>
                    <button className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1 w-full">
                      <div className="w-2 h-2 bg-pink-400 rounded-full mr-3 group-hover:bg-pink-300 transition-colors duration-200"></div>
                      <span className="font-medium text-base sm:text-lg">Terms of Service</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20 pt-6 sm:pt-8 border-t border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Beam Affiliate Platform. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <button className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Privacy Policy
              </button>
              <button className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Terms of Service
              </button>
              <button className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Cookie Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 