import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  PhotoIcon,
  ShareIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const MarketingMaterials: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Show loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-beam-grey-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beam-pink-500 mx-auto mb-4"></div>
          <p className="text-beam-charcoal-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beam-grey-50 pt-16">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Coming Soon Message */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-beam-pink-500 to-beam-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhotoIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-nunito-extrabold text-beam-charcoal-900 mb-4 tracking-beam-tight">
                Marketing Materials
              </h1>
              <p className="text-lg sm:text-xl font-nunito-regular text-beam-charcoal-600 mb-6 tracking-beam-normal">
                We will get back soon on this
              </p>
              <p className="text-sm font-nunito-regular text-beam-charcoal-500 tracking-beam-normal">
                Our marketing materials library is under development. Stay tuned for ready-to-use banners, social media templates, email designs, and promotional content to boost your affiliate marketing.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-beam-pink-500 to-beam-pink-600 text-white font-nunito-semibold rounded-lg hover:from-beam-pink-600 hover:to-beam-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-3 bg-white border-2 border-beam-pink-500 text-beam-pink-600 font-nunito-semibold rounded-lg hover:bg-beam-pink-50 transition-all duration-200"
              >
                View Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingMaterials;