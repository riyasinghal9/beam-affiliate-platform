import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  RocketLaunchIcon, CurrencyDollarIcon, ChartBarIcon, GlobeAltIcon,
  ShieldCheckIcon, ClockIcon, UserGroupIcon, SparklesIcon,
  ArrowRightIcon, CheckCircleIcon, DevicePhoneMobileIcon, 
  CreditCardIcon, BanknotesIcon, StarIcon, TrophyIcon,
  HandThumbUpIcon, BoltIcon, ShieldCheckIcon as ShieldIcon
} from '@heroicons/react/24/outline';
import BeamLogo from '../components/ui/BeamLogo';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: CurrencyDollarIcon,
      title: 'Earn Commissions',
      description: 'Up to 50% commission on every sale you generate',
      color: 'from-beam-pink-500 to-beam-pink-600'
    },
    {
      icon: GlobeAltIcon,
      title: 'Work Anywhere',
      description: 'Share links from your phone, computer, or anywhere',
      color: 'from-beam-teal-500 to-beam-teal-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Track Progress',
      description: 'Real-time analytics and earnings tracking',
      color: 'from-beam-purple-500 to-beam-purple-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payments',
      description: 'Automatic payments directly to your Beam Wallet',
      color: 'from-beam-yellow-500 to-beam-yellow-600'
    },
    {
      icon: ClockIcon,
      title: 'Instant Results',
      description: 'Start earning from your first successful referral',
      color: 'from-beam-charcoal-500 to-beam-charcoal-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Support',
      description: 'Join our community of successful resellers',
      color: 'from-beam-grey-500 to-beam-grey-600'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Sign Up',
      description: 'Create your free reseller account and get your unique ID'
    },
    {
      number: '02',
      title: 'Get Links',
      description: 'Access your personalized affiliate links for all products'
    },
    {
      number: '03',
      title: 'Share & Earn',
      description: 'Share your links and earn commissions on every sale'
    }
  ];

  const benefits = [
    {
      icon: BanknotesIcon,
      title: 'Cashback Rewards',
      description: 'Earn real money back on every transaction, not inflated points',
      color: 'from-beam-pink-500 to-beam-pink-600'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'NFC Payments',
      description: 'Contactless payments with your smartphone at partner stores',
      color: 'from-beam-teal-500 to-beam-teal-600'
    },
    {
      icon: CreditCardIcon,
      title: 'Secure Storage',
      description: 'Safely store your cards with biometric authentication',
      color: 'from-beam-purple-500 to-beam-purple-600'
    },
    {
      icon: BoltIcon,
      title: 'Instant Transactions',
      description: 'Lightning-fast payments with no waiting time',
      color: 'from-beam-yellow-500 to-beam-yellow-600'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Social Media Influencer',
      content: 'Beam Affiliate has transformed how I earn online. The commissions are real money, not points!',
      rating: 5,
      avatar: 'SM'
    },
    {
      name: 'Mike R.',
      role: 'WhatsApp Group Admin',
      content: 'My community loves the Beam Wallet app. I earn while helping them save money.',
      rating: 5,
      avatar: 'MR'
    },
    {
      name: 'Lisa K.',
      role: 'Content Creator',
      content: 'The affiliate platform is so easy to use. I started earning from day one!',
      rating: 5,
      avatar: 'LK'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Resellers' },
    { number: '$2M+', label: 'Total Commissions Paid' },
    { number: '50+', label: 'Partner Countries' },
    { number: '4.9★', label: 'User Rating' }
  ];

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-beam-pink-50 to-beam-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <BeamLogo size="xl" showWordmark={true} />
            </div>
            
            {/* Badge */}
            <div className="inline-flex items-center bg-beam-teal-100 border border-beam-teal-200 rounded-full px-6 py-3 mb-8">
              <RocketLaunchIcon className="h-5 w-5 text-beam-teal-600 mr-3" />
              <span className="text-beam-teal-800 text-lg sm:text-xl font-nunito-bold tracking-beam-normal">Join 10,000+ Successful Resellers</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-nunito-extrabold text-beam-charcoal-900 mb-8 leading-tight tracking-beam-tight">
              Make Money Online
            </h1>
            
            {/* Description */}
            <p className="text-lg sm:text-xl lg:text-2xl font-nunito-regular text-beam-charcoal-700 mb-12 max-w-4xl mx-auto leading-relaxed tracking-beam-normal">
              Perfect for anyone with social media, WhatsApp groups, or communities. Earn{' '}
              <span className="text-beam-pink-600 font-nunito-bold">real commissions</span> by sharing Beam Wallet services.
            </p>
            
            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {!user ? (
                <>
                  <Link
                    to="/reseller-onboarding"
                    className="bg-gradient-beam text-white px-10 py-5 rounded-xl font-nunito-bold text-lg sm:text-xl hover:bg-gradient-beam-reverse transition-all duration-300 flex items-center space-x-3 shadow-beam hover:shadow-beam-lg transform hover:scale-105 tracking-beam-normal"
                  >
                    <SparklesIcon className="h-6 w-6" />
                    <span>I Want to Start Winning</span>
                    <ArrowRightIcon className="h-6 w-6" />
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white text-beam-charcoal-700 px-10 py-5 rounded-xl font-nunito-semibold text-lg sm:text-xl hover:bg-beam-grey-50 transition-all duration-300 border-2 border-beam-grey-300 hover:border-beam-grey-400"
                  >
                    Login to Dashboard
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-gradient-beam text-white px-10 py-5 rounded-xl font-nunito-semibold text-lg sm:text-xl hover:bg-gradient-beam-reverse transition-all duration-300 flex items-center space-x-3 shadow-beam transform hover:scale-105"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRightIcon className="h-6 w-6" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white border-b border-beam-grey-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-nunito-extrabold text-beam-pink-600 mb-2 tracking-beam-tight">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base font-nunito-semibold text-beam-charcoal-700 tracking-beam-normal">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-nunito-extrabold text-beam-charcoal-900 mb-8 tracking-beam-tight">
              Why Choose Beam Affiliate?
            </h2>
            <p className="text-xl sm:text-2xl font-nunito-regular text-beam-charcoal-700 max-w-4xl mx-auto leading-relaxed tracking-beam-normal">
              Everything you need to start earning money online, all in one platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-beam p-8 hover:shadow-beam-lg transition-all duration-300 border border-beam-grey-100 hover:border-beam-grey-200 text-center group">
                <div className={`bg-gradient-to-r ${feature.color} p-5 rounded-xl w-fit mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-nunito-semibold text-beam-charcoal-900 mb-4 tracking-beam-normal">
                  {feature.title}
                </h3>
                <p className="text-lg text-beam-charcoal-700 leading-relaxed font-nunito-regular tracking-beam-normal">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Beam Wallet Benefits Section */}
      <div className="py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-beam-charcoal-50 to-beam-grey-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-nunito-extrabold text-beam-charcoal-900 mb-8 tracking-beam-tight">
              Why Users Love Beam Wallet
            </h2>
            <p className="text-xl sm:text-2xl font-nunito-regular text-beam-charcoal-700 max-w-4xl mx-auto leading-relaxed tracking-beam-normal">
              The revolutionary payment app that's transforming everyday transactions
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-beam p-6 hover:shadow-beam-lg transition-all duration-300 border border-beam-grey-100 hover:border-beam-grey-200 text-center group">
                <div className={`bg-gradient-to-r ${benefit.color} p-4 rounded-xl w-fit mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-nunito-semibold text-beam-charcoal-900 mb-3 tracking-beam-normal">
                  {benefit.title}
                </h3>
                <p className="text-base text-beam-charcoal-700 leading-relaxed font-nunito-regular tracking-beam-normal">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 sm:py-24 lg:py-32 bg-beam-grey-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-nunito-extrabold text-beam-charcoal-900 mb-8 tracking-beam-tight">
              How It Works
            </h2>
            <p className="text-xl sm:text-2xl font-nunito-regular text-beam-charcoal-700 max-w-4xl mx-auto leading-relaxed tracking-beam-normal">
              Get started in just 3 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-beam text-white w-24 h-24 rounded-full flex items-center justify-center text-3xl font-nunito-extrabold mx-auto mb-8 shadow-beam hover:shadow-beam-lg transition-all duration-300 transform hover:scale-105">
                  {step.number}
                </div>
                <h3 className="text-2xl font-nunito-semibold text-beam-charcoal-900 mb-4 tracking-beam-normal">
                  {step.title}
                </h3>
                <p className="text-lg text-beam-charcoal-700 leading-relaxed font-nunito-regular tracking-beam-normal">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-nunito-extrabold text-beam-charcoal-900 mb-8 tracking-beam-tight">
              What Our Resellers Say
            </h2>
            <p className="text-xl sm:text-2xl font-nunito-regular text-beam-charcoal-700 max-w-4xl mx-auto leading-relaxed tracking-beam-normal">
              Real stories from successful Beam Affiliate partners
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-beam-pink-50 to-beam-purple-50 rounded-2xl p-8 border border-beam-pink-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-beam rounded-full flex items-center justify-center text-white font-nunito-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="text-lg font-nunito-semibold text-beam-charcoal-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm font-nunito-regular text-beam-charcoal-600">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-base text-beam-charcoal-700 leading-relaxed font-nunito-regular mb-4">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-beam-yellow-500 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download App Section */}
      <div className="py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-beam-charcoal-900 to-beam-charcoal-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-nunito-extrabold text-white mb-8 tracking-beam-tight">
            Download Beam Wallet
          </h2>
          <p className="text-xl sm:text-2xl text-beam-charcoal-300 mb-12 max-w-3xl mx-auto leading-relaxed font-nunito-regular tracking-beam-normal">
            Experience the future of payments with NFC technology and earn cashback on every transaction
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a 
              href="https://apps.apple.com/au/app/beam/id560637969" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center bg-beam-grey-600 hover:bg-beam-grey-500 text-white px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 border border-beam-grey-500"
            >
              <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
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
              className="flex items-center bg-beam-grey-600 hover:bg-beam-grey-500 text-white px-8 py-4 rounded-xl transition-all duration-200 hover:scale-105 border border-beam-grey-500"
            >
              <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
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

      {/* CTA Section */}
      <div className="py-20 sm:py-24 lg:py-32 bg-gradient-beam">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-nunito-extrabold text-white mb-8 tracking-beam-tight">
            Ready to Start Earning?
          </h2>
          <p className="text-xl sm:text-2xl text-beam-pink-100 mb-12 max-w-3xl mx-auto leading-relaxed font-nunito-regular tracking-beam-normal">
            Join our community of successful resellers and start making money online today
          </p>
          {!user && (
            <Link
              to="/reseller-onboarding"
              className="bg-white text-beam-pink-600 px-12 py-5 rounded-xl font-nunito-semibold text-lg sm:text-xl hover:bg-beam-grey-50 transition-all duration-300 inline-flex items-center space-x-3 shadow-beam transform hover:scale-105"
            >
              <SparklesIcon className="h-7 w-7" />
              <span>Start Your Journey Now</span>
              <ArrowRightIcon className="h-6 w-6" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home; 