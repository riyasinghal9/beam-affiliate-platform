import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChartBarIcon,
  BookOpenIcon,
  PlayIcon,
  ClockIcon,
  StarIcon,
  TrophyIcon,
  UserGroupIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import BeamLogo from '../components/ui/BeamLogo';

const Training: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-nunito-extrabold text-beam-charcoal-900 mb-4 tracking-beam-tight">
                Training Center
              </h1>
              <p className="text-lg sm:text-xl font-nunito-regular text-beam-charcoal-600 mb-6 tracking-beam-normal">
                We will get back soon on this
              </p>
              <p className="text-sm font-nunito-regular text-beam-charcoal-500 tracking-beam-normal">
                Our training center is under development. Stay tuned for comprehensive courses and resources to help you become a successful Beam affiliate.
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

export default Training;