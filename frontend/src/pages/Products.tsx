import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  ClipboardDocumentIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  ArrowTopRightOnSquareIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

interface Product {
  _id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  commission: number;
  category: string;
  productType: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  externalUrl?: string;
  externalShopUrl?: string;
  features: string[];
  requirements: string[];
  tags: string[];
  isActive: boolean;
  beamWalletProductId: string;
}

const Products: React.FC = () => {
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('🔍 Fetching products from backend...');
      // Use direct backend URL since proxy is not working
      const response = await fetch('http://localhost:5001/api/products');
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 Response not OK:', errorText);
        throw new Error(`Failed to fetch products: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('🔍 Products data received:', data);
      setProducts(data);
    } catch (err: any) {
      console.error('❌ Error fetching products:', err);
      setError(`Failed to load products: ${err.message || 'Unknown error'}`);
      // Fallback to default products if API fails
      console.log('🔍 Using fallback products...');
      setProducts([
        {
          _id: 'fallback-1',
          name: 'Beam Wallet NFC for Merchants',
          description: 'Professional NFC-enabled Beam Wallet solution for physical stores and merchants.',
          price: 199.99,
          commission: 50,
          category: 'Wallet',
          productType: 'service',
          imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
          externalUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-nfc',
          externalShopUrl: 'https://shop.beamwallet.com/pt/product/beam-wallet-nfc',
          features: ['NFC contactless payment technology', 'Advanced security encryption'],
          requirements: ['Android or iOS device', 'Internet connection'],
          tags: ['NFC', 'contactless', 'payments'],
          isActive: true,
          beamWalletProductId: 'fallback-nfc'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(link);
      setTimeout(() => setCopiedLink(null), 3000); // Show for 3 seconds
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const getProductIcon = (category: string, productType: string) => {
    switch (category) {
      case 'Wallet': return ShoppingBagIcon;
      case 'Installation': return WrenchScrewdriverIcon;
      case 'License': return DocumentTextIcon;
      case 'Service': return ChatBubbleLeftRightIcon;
      default: return CogIcon;
    }
  };

  const getProductGradient = (category: string) => {
    switch (category) {
      case 'Wallet': return 'from-blue-500 to-blue-600';
      case 'Installation': return 'from-green-500 to-green-600';
      case 'License': return 'from-purple-500 to-purple-600';
      case 'Service': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getProductBgGradient = (category: string) => {
    switch (category) {
      case 'Wallet': return 'from-blue-50 to-indigo-50';
      case 'Installation': return 'from-green-50 to-emerald-50';
      case 'License': return 'from-purple-50 to-pink-50';
      case 'Service': return 'from-orange-50 to-amber-50';
      default: return 'from-gray-50 to-slate-50';
    }
  };

  const getResellerLink = (product: Product) => {
    if (!user?.resellerId) {
      return 'Please log in to get your affiliate link';
    }
    return `${window.location.origin}/payment?v=${product.price}&id=${user.resellerId}&product=${product._id}`;
  };

  const getDirectStoreUrl = (product: Product) => {
    if (!user?.resellerId) {
      return product.externalShopUrl || 'https://shop.beamwallet.com';
    }
    
    // Use the product's specific external URL if available
    const baseUrl = product.externalShopUrl || 'https://shop.beamwallet.com';
    
    // Add tracking parameters to the specific product URL
    const trackingParams = new URLSearchParams({
      affiliate_id: user.resellerId,
      product_id: product._id,
      product_price: product.price.toString(),
      utm_source: 'affiliate',
      utm_medium: 'link',
      utm_campaign: 'beam_affiliate',
      ref: 'beam_affiliate_platform'
    });
    
    // Check if the URL already has parameters
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${trackingParams.toString()}`;
  };

  const getCommissionAmount = (product: Product) => {
    return (product.price * product.commission) / 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beam-pink-50 to-beam-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-beam-pink-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-beam-charcoal-600 font-nunito-regular">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beam-pink-50 to-beam-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
          <button 
            onClick={fetchProducts}
            className="bg-gradient-beam text-white px-6 py-2 rounded-lg hover:bg-gradient-beam-reverse font-nunito-semibold shadow-beam hover:shadow-beam-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beam-pink-50 to-beam-purple-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-beam rounded-2xl mb-6 shadow-beam">
            <RocketLaunchIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-nunito-extrabold text-beam-charcoal-900 mb-4 tracking-beam-tight">
            Our Products & Services
          </h1>
          <p className="text-lg sm:text-xl font-nunito-regular text-beam-charcoal-700 max-w-3xl mx-auto leading-relaxed tracking-beam-normal">
            Explore the range of Beam Wallet offerings you can promote and earn commissions from
          </p>
          
          {/* Store Redirect Notice */}
          <div className="mt-6 max-w-2xl mx-auto">
            <div className="bg-beam-teal-50 border border-beam-teal-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ArrowTopRightOnSquareIcon className="h-5 w-5 text-beam-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-nunito-semibold text-beam-teal-800 mb-1">Store Integration</h3>
                  <p className="text-sm text-beam-teal-700 font-nunito-regular">
                    Your affiliate links now redirect customers to our official Beam Wallet store at <span className="font-nunito-semibold">shop.beamwallet.com</span> where they can complete their purchase securely.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16 lg:mb-20">
          {products.map((product) => {
            const IconComponent = getProductIcon(product.category, product.productType);
            const gradient = getProductGradient(product.category);
            const bgGradient = getProductBgGradient(product.category);
            const resellerLink = getResellerLink(product);
            const directStoreUrl = getDirectStoreUrl(product);
            const commissionAmount = getCommissionAmount(product);
            
            return (
              <div key={product._id} className="group relative">
                {/* Card Container */}
                <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl shadow-beam border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-beam-lg hover:-translate-y-2 h-full`}>
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-beam-grey-100 to-beam-grey-200">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 product-image"
                        style={{
                          imageRendering: 'auto',
                          WebkitImageRendering: 'auto',
                          MozImageRendering: 'auto',
                          msImageRendering: 'auto',
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'translateZ(0)',
                          WebkitTransform: 'translateZ(0)'
                        } as React.CSSProperties}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-beam-grey-100 to-beam-grey-200 flex items-center justify-center ${product.imageUrl ? 'hidden' : ''}`}>
                      <IconComponent className="h-16 w-16 text-beam-charcoal-400" />
                    </div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 text-xs font-nunito-semibold text-white rounded-full bg-gradient-to-r ${gradient} shadow-beam`}>
                        {product.category}
                      </span>
                    </div>
                    
                    {/* Commission Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 text-xs font-nunito-semibold text-white rounded-full bg-gradient-to-r from-beam-teal-500 to-beam-teal-600 shadow-beam">
                        {product.commission}% Commission
                      </span>
                    </div>
                  </div>

                  {/* Product Content */}
                  <div className="p-4">
                    {/* Product Header */}
                    <div className="mb-3">
                      <h3 className="text-lg font-nunito-extrabold text-beam-charcoal-900 mb-1 tracking-beam-tight group-hover:text-beam-pink-600 transition-colors duration-200">
                        {product.name}
                      </h3>
                      <p className="text-sm text-beam-charcoal-600 font-nunito-regular leading-relaxed tracking-beam-normal line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Product Features */}
                    {product.features && product.features.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-xs font-nunito-semibold text-beam-charcoal-700 mb-1 tracking-beam-normal">Key Features:</h4>
                        <ul className="space-y-0.5">
                          {product.features.slice(0, 2).map((feature, index) => (
                            <li key={index} className="flex items-center text-xs text-beam-charcoal-600 font-nunito-regular">
                              <CheckCircleIcon className="h-3 w-3 text-beam-teal-500 mr-1.5 flex-shrink-0" />
                              <span className="line-clamp-1">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Price and Commission */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl font-nunito-extrabold text-beam-charcoal-900 tracking-beam-tight">
                          ${product.price}
                        </span>
                        <span className="text-xs font-nunito-semibold text-beam-teal-600 bg-beam-teal-50 px-2 py-1 rounded-full">
                          Earn ${commissionAmount}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {/* Get Affiliate Link Button */}
                      <button
                        onClick={() => copyToClipboard(resellerLink)}
                        className={`w-full px-3 py-2 rounded-lg font-nunito-semibold transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${
                          copiedLink === resellerLink
                            ? 'bg-beam-teal-500 text-white shadow-beam'
                            : 'bg-gradient-beam text-white hover:bg-gradient-beam-reverse shadow-beam hover:shadow-beam-lg transform hover:-translate-y-0.5'
                        }`}
                      >
                        {copiedLink === resellerLink ? (
                          <>
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentIcon className="h-4 w-4" />
                            <span>Get Store Link</span>
                          </>
                        )}
                      </button>

                      {/* View Product Link */}
                      <a
                        href={directStoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-3 py-2 border border-beam-grey-300 text-beam-charcoal-700 rounded-lg font-nunito-semibold hover:bg-beam-grey-50 transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        <span>View Product</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Products; 