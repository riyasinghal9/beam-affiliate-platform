import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShareIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import BeamLogo from '../ui/BeamLogo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-beam-charcoal-900 via-beam-charcoal-800 to-beam-charcoal-900 text-white relative overflow-hidden mt-16 sm:mt-20 lg:mt-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-beam-pink-400/20 to-beam-purple-400/20"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4 sm:mb-6">
              <BeamLogo size="lg" showWordmark={true} textColor="text-white" />
              <span className="ml-4 text-2xl font-nunito-extrabold text-white tracking-beam-tight">
                Affiliate
              </span>
            </div>
            <p className="text-beam-charcoal-300 mb-6 sm:mb-8 max-w-lg leading-relaxed text-base sm:text-lg font-nunito-regular tracking-beam-normal">
              Join thousands of successful resellers earning money online with Beam Wallet. 
              No investment required, start earning today!
            </p>
            
            {/* Social Media */}
            <div className="flex gap-2 sm:gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-beam-pink-500 to-beam-pink-600 rounded-xl flex items-center justify-center text-white hover:from-beam-pink-400 hover:to-beam-pink-500 transition-all duration-300 hover:scale-110 shadow-beam hover:shadow-beam-lg"
              >
                <ShareIcon className="h-6 w-6" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-beam-teal-500 to-beam-teal-600 rounded-xl flex items-center justify-center text-white hover:from-beam-teal-400 hover:to-beam-teal-500 transition-all duration-300 hover:scale-110 shadow-beam hover:shadow-beam-lg"
              >
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-beam-purple-500 to-beam-purple-600 rounded-xl flex items-center justify-center text-white hover:from-beam-purple-400 hover:to-beam-purple-500 transition-all duration-300 hover:scale-110 shadow-beam hover:shadow-beam-lg"
              >
                <UserGroupIcon className="h-6 w-6" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-beam-yellow-500 to-beam-yellow-600 rounded-xl flex items-center justify-center text-white hover:from-beam-yellow-400 hover:to-beam-yellow-500 transition-all duration-300 hover:scale-110 shadow-beam hover:shadow-beam-lg"
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
                <h3 className="text-lg sm:text-xl font-nunito-extrabold text-white mb-4 sm:mb-6 flex items-center tracking-beam-tight">
                  <div className="w-10 h-1 bg-gradient-to-r from-beam-pink-400 to-beam-purple-400 rounded-full mr-3"></div>
                  Platform
                </h3>
                <ul className="space-y-4">
                  <li>
                    <Link to="/products" className="text-beam-charcoal-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1 font-nunito-semibold tracking-beam-normal">
                      <div className="w-2 h-2 bg-beam-pink-400 rounded-full mr-3 group-hover:bg-beam-pink-300 transition-colors duration-200"></div>
                      <span className="text-base sm:text-lg">Products</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="text-beam-charcoal-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1 font-nunito-semibold tracking-beam-normal">
                      <div className="w-2 h-2 bg-beam-pink-400 rounded-full mr-3 group-hover:bg-beam-pink-300 transition-colors duration-200"></div>
                      <span className="text-base sm:text-lg">Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/transactions" className="text-beam-charcoal-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1 font-nunito-semibold tracking-beam-normal">
                      <div className="w-2 h-2 bg-beam-pink-400 rounded-full mr-3 group-hover:bg-beam-pink-300 transition-colors duration-200"></div>
                      <span className="text-base sm:text-lg">Transactions</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="text-beam-charcoal-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1 font-nunito-semibold tracking-beam-normal">
                      <div className="w-2 h-2 bg-beam-pink-400 rounded-full mr-3 group-hover:bg-beam-pink-300 transition-colors duration-200"></div>
                      <span className="text-base sm:text-lg">Profile</span>
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* Support Links */}
              <div className="flex flex-col items-start">
                <h3 className="text-lg sm:text-xl font-nunito-extrabold text-white mb-4 sm:mb-6 flex items-center tracking-beam-tight">
                  <div className="w-10 h-1 bg-gradient-to-r from-beam-teal-400 to-beam-teal-500 rounded-full mr-3"></div>
                  Support
                </h3>
                <ul className="space-y-4">
                  <li>
                    <a href="https://www.beamwallet.com/help-center" target="_blank" rel="noopener noreferrer" className="text-beam-charcoal-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1 w-full font-nunito-semibold tracking-beam-normal">
                      <div className="w-2 h-2 bg-beam-teal-400 rounded-full mr-3 group-hover:bg-beam-teal-300 transition-colors duration-200"></div>
                      <span className="text-base sm:text-lg">Help Center</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://www.beamwallet.com/contacts" target="_blank" rel="noopener noreferrer" className="text-beam-charcoal-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1 w-full font-nunito-semibold tracking-beam-normal">
                      <div className="w-2 h-2 bg-beam-teal-400 rounded-full mr-3 group-hover:bg-beam-teal-300 transition-colors duration-200"></div>
                      <span className="text-base sm:text-lg">Contact Us</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://www.beamwallet.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-beam-charcoal-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1 w-full font-nunito-semibold tracking-beam-normal">
                      <div className="w-2 h-2 bg-beam-teal-400 rounded-full mr-3 group-hover:bg-beam-teal-300 transition-colors duration-200"></div>
                      <span className="text-base sm:text-lg">Privacy Policy</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://www.beamwallet.com/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-beam-charcoal-300 hover:text-white transition-all duration-200 flex items-center group hover:translate-x-1 w-full font-nunito-semibold tracking-beam-normal">
                      <div className="w-2 h-2 bg-beam-teal-400 rounded-full mr-3 group-hover:bg-beam-teal-300 transition-colors duration-200"></div>
                      <span className="text-base sm:text-lg">Terms of Service</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Download Section */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-start">
              <h3 className="text-lg sm:text-xl font-nunito-extrabold text-white mb-4 sm:mb-6 flex items-center tracking-beam-tight">
                <div className="w-10 h-1 bg-gradient-to-r from-beam-yellow-400 to-beam-yellow-500 rounded-full mr-3"></div>
                Download BEAM
              </h3>
              <div className="space-y-3">
                <a 
                  href="https://apps.apple.com/au/app/beam/id560637969" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center bg-beam-grey-600 hover:bg-beam-grey-500 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 border border-beam-grey-500"
                >
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs font-nunito-regular">Download on the</div>
                    <div className="text-sm font-nunito-semibold">App Store</div>
                  </div>
                </a>
                <a 
                  href="https://play.google.com/store/apps/details?id=com.beamwallet" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center bg-beam-grey-600 hover:bg-beam-grey-500 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:scale-105 border border-beam-grey-500"
                >
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs font-nunito-regular">GET IT ON</div>
                    <div className="text-sm font-nunito-semibold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20 pt-6 sm:pt-8 border-t border-beam-charcoal-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-beam-charcoal-400 text-sm font-nunito-regular tracking-beam-normal">
              © 2025 Beam Affiliate Platform. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="https://www.beamwallet.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-beam-charcoal-400 hover:text-white text-sm transition-colors duration-200 font-nunito-semibold tracking-beam-normal">
                Privacy Policy
              </a>
              <a href="https://www.beamwallet.com/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-beam-charcoal-400 hover:text-white text-sm transition-colors duration-200 font-nunito-semibold tracking-beam-normal">
                Terms of Service
              </a>
              <a href="https://www.beamwallet.com/cookie-policy" target="_blank" rel="noopener noreferrer" className="text-beam-charcoal-400 hover:text-white text-sm transition-colors duration-200 font-nunito-semibold tracking-beam-normal">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 