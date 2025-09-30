import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  UserIcon, GlobeAltIcon, LightBulbIcon, CheckCircleIcon,
  ArrowRightIcon, ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface OnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  experienceLevel: string;
  marketingGoals: string;
  targetAudience: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
  bio: string;
  website: string;
  audienceSize: string;
}

const ResellerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
    },
    experienceLevel: 'beginner',
    marketingGoals: '',
    targetAudience: '',
    agreeToTerms: false,
    agreeToMarketing: false,
    bio: '',
    website: '',
    audienceSize: '',
  });

  const totalSteps = 4;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialMediaChange = (platform: keyof OnboardingData['socialMedia'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register-reseller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        await login(formData.email, formData.password);
        navigate('/reseller-dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2:
        return formData.website || formData.socialMedia.facebook || formData.socialMedia.instagram || 
               formData.socialMedia.twitter || formData.socialMedia.linkedin;
      case 3:
        return formData.experienceLevel && formData.marketingGoals && formData.targetAudience;
      case 4:
        return formData.agreeToTerms && formData.agreeToMarketing;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beam-pink-50 to-beam-purple-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-nunito-extrabold text-beam-charcoal-900 mb-4 tracking-beam-tight">
            🚀 Welcome to Beam Affiliate Program
          </h1>
          <p className="text-lg sm:text-xl font-nunito-regular text-beam-charcoal-600 max-w-3xl mx-auto tracking-beam-normal">
            Complete your onboarding to start earning commissions promoting Beam Wallet services
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-nunito-semibold text-beam-charcoal-700">Progress</span>
            <span className="text-sm font-nunito-regular text-beam-charcoal-600">{currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-beam-grey-200 rounded-full h-2">
            <div 
              className="bg-gradient-beam h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-beam p-6 lg:p-8 border border-beam-grey-200">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-beam rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-nunito-bold text-beam-charcoal-900 mb-2">Personal Information</h2>
                <p className="text-beam-charcoal-600 font-nunito-regular">Tell us about yourself to get started</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900"
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                  Bio/About You
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900"
                  placeholder="Tell us about your background, interests, and why you want to join our affiliate program..."
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-beam-teal-500 to-beam-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GlobeAltIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-nunito-bold text-beam-charcoal-900 mb-2">Online Presence</h2>
                <p className="text-beam-charcoal-600 font-nunito-regular">Help us understand your digital footprint</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="website" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                    Website/Blog URL
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-3">
                    Social Media Profiles
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="facebook" className="block text-xs font-nunito-regular text-beam-charcoal-600 mb-1">
                        Facebook
                      </label>
                      <input
                        type="url"
                        id="facebook"
                        value={formData.socialMedia.facebook}
                        onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                        className="w-full px-3 py-2 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900 text-sm"
                        placeholder="https://facebook.com/username"
                      />
                    </div>
                    <div>
                      <label htmlFor="instagram" className="block text-xs font-nunito-regular text-beam-charcoal-600 mb-1">
                        Instagram
                      </label>
                      <input
                        type="url"
                        id="instagram"
                        value={formData.socialMedia.instagram}
                        onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                        className="w-full px-3 py-2 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900 text-sm"
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                    <div>
                      <label htmlFor="twitter" className="block text-xs font-nunito-regular text-beam-charcoal-600 mb-1">
                        Twitter
                      </label>
                      <input
                        type="url"
                        id="twitter"
                        value={formData.socialMedia.twitter}
                        onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                        className="w-full px-3 py-2 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900 text-sm"
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    <div>
                      <label htmlFor="linkedin" className="block text-xs font-nunito-regular text-beam-charcoal-600 mb-1">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        id="linkedin"
                        value={formData.socialMedia.linkedin}
                        onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                        className="w-full px-3 py-2 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900 text-sm"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="audienceSize" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                    Estimated Audience Size
                  </label>
                  <select
                    id="audienceSize"
                    name="audienceSize"
                    value={formData.audienceSize}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900"
                  >
                    <option value="">Select audience size</option>
                    <option value="0-1000">0 - 1,000 followers</option>
                    <option value="1000-5000">1,000 - 5,000 followers</option>
                    <option value="5000-10000">5,000 - 10,000 followers</option>
                    <option value="10000-50000">10,000 - 50,000 followers</option>
                    <option value="50000+">50,000+ followers</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-beam-purple-500 to-beam-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LightBulbIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-nunito-bold text-beam-charcoal-900 mb-2">Marketing Experience</h2>
                <p className="text-beam-charcoal-600 font-nunito-regular">Share your experience and goals</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-3">
                    Marketing Experience Level
                  </label>
                  <div className="space-y-3">
                    {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                      <label key={level} className="flex items-center p-3 border border-beam-grey-300 rounded-lg cursor-pointer hover:bg-beam-grey-50 transition-colors duration-200">
                        <input
                          type="radio"
                          name="experienceLevel"
                          value={level}
                          checked={formData.experienceLevel === level}
                          onChange={handleInputChange}
                          className="mr-3 text-beam-pink-600 focus:ring-beam-pink-500"
                        />
                        <div>
                          <div className="font-nunito-semibold text-beam-charcoal-900 capitalize">{level}</div>
                          <div className="text-sm font-nunito-regular text-beam-charcoal-600">
                            {level === 'beginner' && 'New to affiliate marketing'}
                            {level === 'intermediate' && 'Some experience with promotions'}
                            {level === 'advanced' && 'Regular affiliate marketing experience'}
                            {level === 'expert' && 'Professional affiliate marketer'}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="marketingGoals" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                    Marketing Goals
                  </label>
                  <textarea
                    id="marketingGoals"
                    name="marketingGoals"
                    value={formData.marketingGoals}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900"
                    placeholder="What are your goals for this affiliate program? How do you plan to promote our services?"
                  />
                </div>

                <div>
                  <label htmlFor="targetAudience" className="block text-sm font-nunito-semibold text-beam-charcoal-700 mb-2">
                    Target Audience
                  </label>
                  <textarea
                    id="targetAudience"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-beam-grey-300 rounded-lg focus:ring-2 focus:ring-beam-pink-500 focus:border-transparent font-nunito-regular text-beam-charcoal-900"
                    placeholder="Describe your target audience (age, interests, location, etc.)"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-beam-yellow-500 to-beam-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-nunito-bold text-beam-charcoal-900 mb-2">Terms & Agreement</h2>
                <p className="text-beam-charcoal-600 font-nunito-regular">Review and accept our terms</p>
              </div>

              <div className="space-y-6">
                <div className="bg-beam-grey-50 rounded-lg p-4 border border-beam-grey-200">
                  <h3 className="font-nunito-semibold text-beam-charcoal-900 mb-3">Affiliate Program Terms</h3>
                  <div className="text-sm font-nunito-regular text-beam-charcoal-700 space-y-2">
                    <p>• You must be 18 years or older to participate</p>
                    <p>• All promotional materials must be approved by Beam</p>
                    <p>• Commission rates vary by product and performance</p>
                    <p>• Payments are processed monthly for amounts over $50</p>
                    <p>• Violation of terms may result in account suspension</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                      className="mt-1 w-4 h-4 text-beam-pink-600 border-beam-grey-300 rounded focus:ring-beam-pink-500"
                    />
                    <span className="text-sm font-nunito-regular text-beam-charcoal-700">
                      I agree to the{' '}
                      <a href="/terms" className="text-beam-pink-600 hover:text-beam-pink-700 underline font-nunito-semibold">
                        Affiliate Program Terms
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-beam-pink-600 hover:text-beam-pink-700 underline font-nunito-semibold">
                        Privacy Policy
                      </a>
                    </span>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.agreeToMarketing}
                      onChange={(e) => setFormData({...formData, agreeToMarketing: e.target.checked})}
                      className="mt-1 w-4 h-4 text-beam-pink-600 border-beam-grey-300 rounded focus:ring-beam-pink-500"
                    />
                    <span className="text-sm font-nunito-regular text-beam-charcoal-700">
                      I agree to receive marketing communications and updates about the affiliate program
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-beam-grey-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-beam-grey-300 text-beam-charcoal-700 rounded-lg font-nunito-semibold hover:bg-beam-grey-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={currentStep === totalSteps ? handleSubmit : handleNext}
              disabled={!canProceed()}
              className="px-6 py-3 bg-gradient-beam text-white rounded-lg font-nunito-semibold hover:shadow-beam transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === totalSteps ? 'Complete Onboarding' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResellerOnboarding; 