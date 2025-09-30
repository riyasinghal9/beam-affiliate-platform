import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  CurrencyDollarIcon, ChartBarIcon, LinkIcon, ShoppingBagIcon,
  UserGroupIcon, ClockIcon, ArrowTrendingUpIcon, ShareIcon,
  CogIcon, EyeIcon, GlobeAltIcon, SparklesIcon,
  TrophyIcon, StarIcon, FireIcon, GiftIcon, ShoppingCartIcon, PhotoIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface ResellerStats {
  totalEarnings: number;
  totalSales: number;
  totalClicks: number;
  conversionRate: number;
  monthlyEarnings: number;
  pendingCommissions: number;
  resellerId: string;
  level: string;
  levelProgress: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  commission: number;
  category: string;
  image: string;
  affiliateLink: string;
}

interface Transaction {
  _id: string;
  productName: string;
  customerName: string;
  productPrice: number;
  commissionAmount: number;
  paymentStatus: string;
  createdAt: string;
}

interface RecentSale {
  _id: string;
  productName: string;
  customerName: string;
  amount: number;
  commission: number;
  date: string;
  status: string;
}

const ResellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ResellerStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchResellerData();
    }
  }, [user]);

  // Refresh data when user data changes (e.g., after payment)
  useEffect(() => {
    if (user) {
      fetchResellerData();
    }
  }, [user?.balance, user?.totalSales, user?.totalEarnings]);

  const fetchResellerData = async () => {
    try {
      setLoading(true);
      const [statsRes, productsRes, salesRes] = await Promise.all([
        fetch('http://localhost:5001/api/reseller/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:5001/api/reseller/products', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('http://localhost:5001/api/dashboard/transactions', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products);
      }

      if (salesRes.ok) {
        const salesData = await salesRes.json();
        // Convert transactions to recent sales format
        const recentSales = (salesData.transactions || []).map((transaction: Transaction) => ({
          _id: transaction._id,
          productName: transaction.productName,
          customerName: transaction.customerName,
          amount: transaction.productPrice,
          commission: transaction.commissionAmount,
          status: transaction.paymentStatus,
          date: transaction.createdAt
        }));
        setRecentSales(recentSales);
      }
    } catch (error) {
      console.error('Error fetching reseller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(text);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareLink = async (link: string, productName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${productName} on Beam Wallet!`,
          text: `I found this amazing product that you might like: ${productName}`,
          url: link,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard(link);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="h-80 bg-gray-200 rounded-lg"></div>
              <div className="h-80 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beam-grey-50 pt-16">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-nunito-extrabold text-beam-charcoal-900 mb-4 tracking-beam-tight">
            🚀 Reseller Dashboard
          </h1>
          <p className="text-lg sm:text-xl font-nunito-regular text-beam-charcoal-600 tracking-beam-normal">
            Welcome back, {user?.firstName}! Here's your affiliate marketing overview
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-beam p-6 border border-beam-grey-200">
            <div className="flex items-center">
              <div className="p-2 bg-beam-pink-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-beam-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-nunito-regular text-beam-charcoal-600">Total Earnings</p>
                <p className="text-2xl font-nunito-extrabold text-beam-charcoal-900 tracking-beam-tight">
                  {formatCurrency(stats?.totalEarnings || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-beam p-6 border border-beam-grey-200">
            <div className="flex items-center">
              <div className="p-2 bg-beam-teal-100 rounded-lg">
                <ShoppingCartIcon className="h-6 w-6 text-beam-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-nunito-regular text-beam-charcoal-600">Total Sales</p>
                <p className="text-2xl font-nunito-extrabold text-beam-charcoal-900 tracking-beam-tight">
                  {formatNumber(stats?.totalSales || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-beam p-6 border border-beam-grey-200">
            <div className="flex items-center">
              <div className="p-2 bg-beam-purple-100 rounded-lg">
                <ArrowTrendingUpIcon className="h-6 w-6 text-beam-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-nunito-regular text-beam-charcoal-600">Conversion Rate</p>
                <p className="text-2xl font-nunito-extrabold text-beam-charcoal-900 tracking-beam-tight">
                  {formatPercentage(stats?.conversionRate || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-beam p-6 border border-beam-grey-200">
            <div className="flex items-center">
              <div className="p-2 bg-beam-yellow-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-beam-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-nunito-regular text-beam-charcoal-600">Total Clicks</p>
                <p className="text-2xl font-nunito-extrabold text-beam-charcoal-900 tracking-beam-tight">
                  {formatNumber(stats?.totalClicks || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Performance Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Chart */}
            <div className="bg-white rounded-xl shadow-beam p-6 border border-beam-grey-200">
              <h2 className="text-xl font-nunito-semibold text-beam-charcoal-900 mb-6 tracking-beam-normal">
                Performance Overview
              </h2>
              <div className="h-80 bg-gradient-to-br from-beam-pink-50 to-beam-purple-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="h-16 w-16 text-beam-pink-400 mx-auto mb-4" />
                  <p className="text-beam-charcoal-600 font-nunito-regular">Performance charts will be displayed here</p>
                </div>
              </div>
            </div>

            {/* Recent Sales */}
            <div className="bg-white rounded-xl shadow-beam p-6 border border-beam-grey-200">
              <h2 className="text-xl font-nunito-semibold text-beam-charcoal-900 mb-6 tracking-beam-normal">
                Recent Sales
              </h2>
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div key={sale._id} className="flex items-center justify-between p-4 bg-beam-grey-50 rounded-lg border border-beam-grey-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-beam rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-nunito-bold">
                          {sale.customerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-nunito-semibold text-beam-charcoal-900">{sale.productName}</h3>
                        <p className="text-sm font-nunito-regular text-beam-charcoal-600">{sale.customerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-nunito-semibold text-beam-charcoal-900">{formatCurrency(sale.amount)}</div>
                      <div className="text-sm font-nunito-regular text-beam-teal-600">+{formatCurrency(sale.commission)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-beam p-6 border border-beam-grey-200">
              <h2 className="text-xl font-nunito-semibold text-beam-charcoal-900 mb-6 tracking-beam-normal">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to="/products"
                  className="flex items-center p-3 bg-gradient-beam text-white rounded-lg hover:shadow-beam transition-all duration-200 font-nunito-semibold"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-3" />
                  Browse Products
                </Link>
                <Link
                  to="/marketing-materials"
                  className="flex items-center p-3 bg-beam-teal-600 text-white rounded-lg hover:bg-beam-teal-700 transition-colors duration-200 font-nunito-semibold"
                >
                  <PhotoIcon className="h-5 w-5 mr-3" />
                  Marketing Materials
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center p-3 bg-beam-purple-600 text-white rounded-lg hover:bg-beam-purple-700 transition-colors duration-200 font-nunito-semibold"
                >
                  <ChartBarIcon className="h-5 w-5 mr-3" />
                  View Analytics
                </Link>
                <Link
                  to="/withdraw"
                  className="flex items-center p-3 bg-beam-yellow-600 text-white rounded-lg hover:bg-beam-yellow-700 transition-colors duration-200 font-nunito-semibold"
                >
                  <CurrencyDollarIcon className="h-5 w-5 mr-3" />
                  Withdraw Earnings
                </Link>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-beam p-6 border border-beam-grey-200">
              <h2 className="text-xl font-nunito-semibold text-beam-charcoal-900 mb-6 tracking-beam-normal">
                Top Performing Products
              </h2>
              <div className="space-y-3">
                {products.map((product, index) => (
                  <div key={product._id} className="flex items-center space-x-3 p-3 bg-beam-grey-50 rounded-lg border border-beam-grey-200">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-nunito-bold ${
                      index === 0 ? 'bg-gradient-to-r from-beam-yellow-400 to-beam-yellow-500 text-white' :
                      index === 1 ? 'bg-gradient-to-r from-beam-grey-300 to-beam-grey-400 text-white' :
                      index === 2 ? 'bg-gradient-to-r from-beam-yellow-600 to-beam-yellow-700 text-white' :
                      'bg-beam-grey-200 text-beam-charcoal-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-nunito-semibold text-beam-charcoal-900">{product.name}</div>
                      <div className="text-sm font-nunito-regular text-beam-charcoal-600">{product.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-nunito-semibold text-beam-charcoal-900">{formatCurrency(product.commission)}</div>
                      <div className="text-xs font-nunito-regular text-beam-charcoal-500">per sale</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-beam p-6 border border-beam-grey-200">
              <h2 className="text-xl font-nunito-semibold text-beam-charcoal-900 mb-6 tracking-beam-normal">
                Recent Activity
              </h2>
              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale._id} className="flex items-start space-x-3 p-3 bg-beam-grey-50 rounded-lg border border-beam-grey-200">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                      'bg-beam-teal-500'
                    }`}>
                      <ShoppingCartIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-nunito-regular text-beam-charcoal-900">{sale.productName}</p>
                      <p className="text-xs font-nunito-regular text-beam-charcoal-500">{formatDate(sale.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResellerDashboard; 