import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircleIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  StarIcon,
  RocketLaunchIcon,
  ClipboardDocumentIcon,
  CogIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const Products: React.FC = () => {
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const products = [
    {
      id: '1',
      name: 'Beam Wallet Installation for Merchants',
      description: 'Complete installation and setup of Beam Wallet for merchant businesses. Includes configuration, training, and support.',
      price: 75,
      commission: 50,
      commissionAmount: 37.50,
      category: 'Installation',
      icon: WrenchScrewdriverIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      resellerLink: `${window.location.origin}/payment?v=75&id=${user?.resellerId}&product=1`,
      features: [
        'Complete installation and setup',
        'Merchant account configuration',
        'Staff training session',
        '30 days support',
        'Payment processing setup'
      ]
    },
    {
      id: '2',
      name: 'Commercial Agent License',
      description: 'Professional license for commercial agents to use Beam Wallet in their business operations.',
      price: 150,
      commission: 50,
      commissionAmount: 75,
      category: 'License',
      icon: DocumentTextIcon,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-pink-50',
      resellerLink: `${window.location.origin}/payment?v=150&id=${user?.resellerId}&product=2`,
      features: [
        'Commercial usage rights',
        'Priority support',
        'Advanced features access',
        'Multi-location support',
        'API access'
      ]
    },
    {
      id: '3',
      name: 'Premium Support Package',
      description: 'Enhanced support package with dedicated account manager and priority response times.',
      price: 200,
      commission: 50,
      commissionAmount: 100,
      category: 'Service',
      icon: DocumentTextIcon,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-pink-50',
      resellerLink: `${window.location.origin}/payment?v=200&id=${user?.resellerId}&product=3`,
      features: [
        'Dedicated account manager',
        '24/7 priority support',
        'Custom integrations',
        'Monthly consultations',
        'Performance optimization'
      ]
    }
  ];

  const copyToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(link);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <RocketLaunchIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Our Products & Services
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore the range of Beam Wallet offerings you can promote and earn commissions from
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 mb-16 lg:mb-20">
          {products.map((product) => {
            const IconComponent = product.icon;
            return (
              <div key={product.id} className="group relative">
                {/* Card Container */}
                <div className={`bg-gradient-to-br ${product.bgGradient} rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full`}>
                  {/* Header with Icon and Category */}
                  <div className="relative p-8 pb-6">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    
                    <div className="relative">
                      <div className="flex items-center mb-6">
                        <div className={`w-12 h-12 bg-gradient-to-r ${product.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {product.id === '1' && <WrenchScrewdriverIcon className="w-6 h-6 text-white" />}
                          {product.id === '2' && <DocumentTextIcon className="w-6 h-6 text-white" />}
                          {product.id === '3' && <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />}
                        </div>
                        <span className="text-sm font-bold text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm ml-3">
                          {product.category}
                        </span>
                      </div>
                      
                      <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Price and Commission */}
                  <div className="px-8 py-6 bg-white/50 backdrop-blur-sm border-t border-white/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                        <span className="text-sm text-gray-500 ml-2">per sale</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Commission</div>
                        <div className="text-xl font-bold text-green-600">{product.commission}%</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Your Earnings:</span>
                        <span className="text-2xl font-bold text-green-600">${product.commissionAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reseller Link */}
                  <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200/50">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2 text-blue-600" />
                      Your Reseller Link:
                    </h4>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        readOnly
                        value={product.resellerLink}
                        className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl text-sm bg-white text-gray-900 font-medium focus:outline-none focus:border-blue-400 transition-colors duration-200"
                      />
                      <button
                        onClick={() => copyToClipboard(product.resellerLink)}
                        className={`px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center space-x-2 min-w-[80px] justify-center ${
                          copiedLink === product.resellerLink
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        <ClipboardDocumentIcon className="w-4 h-4" />
                        <span>{copiedLink === product.resellerLink ? 'COPIED!' : 'COPY'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="px-8 py-6 flex-grow">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                      Features:
                    </h4>
                    <ul className="space-y-3">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-gray-600 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="px-8 pb-8">
                    <button 
                      onClick={() => copyToClipboard(product.resellerLink)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2 group"
                    >
                      <RocketLaunchIcon className="w-4 h-4 group-hover:animate-bounce" />
                      <span className="text-sm">GET AFFILIATE LINK</span>
                      <RocketLaunchIcon className="w-4 h-4 group-hover:animate-bounce" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Commission Info Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 lg:p-12 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Commission Structure
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Earn competitive commissions on every successful sale with our transparent pricing structure
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircleIcon/>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">50%</div>
                <div className="text-gray-600 font-medium">Commission Rate</div>
              </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <RocketLaunchIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">Instant</div>
              <div className="text-gray-600 font-medium">Payment Processing</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <StarIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Support Available</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 lg:p-12 text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
              Choose your preferred products, copy the affiliate links, and start promoting to earn commissions on every successful sale!
            </p>
            {/* <div className="flex flex-wrap items-center justify-center gap-6 text-blue-100"> */}
              {/* <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="font-medium">High Commission Rates</span>
              </div> */}
              {/* <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="font-medium">Instant Payments</span>
              </div> */}
              {/* <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                <span className="font-medium">24/7 Support</span>
              </div> */}
            {/* </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products; 