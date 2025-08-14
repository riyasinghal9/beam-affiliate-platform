import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import gamificationService, { ResellerLevel, Achievement } from '../services/gamificationService';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  ArrowTrendingUpIcon,
  ClipboardDocumentIcon,
  LightBulbIcon,
  SparklesIcon,
  TrophyIcon,
  FireIcon,
  StarIcon,
  AcademicCapIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts';

interface DashboardStats {
  balance: number;
  totalEarnings: number;
  totalSales: number;
  totalClicks: number;
  monthlyEarnings: number;
  conversionRate: number;
  level: string;
}

interface AffiliateLink {
  productId: string;
  productName: string;
  price: number;
  commission: number;
  commissionAmount: number;
  link: string;
}

interface Transaction {
  _id: string;
  productName: string;
  customerName: string;
  productPrice: number;
  commissionAmount: number;
  paymentStatus: string;
  commissionStatus: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<ResellerLevel | null>(null);
  const [nextLevel, setNextLevel] = useState<ResellerLevel | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [levelProgress, setLevelProgress] = useState({ salesProgress: 0, earningsProgress: 0, overallProgress: 0 });

  // Mock data for demonstration
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Simulate API call
        setTimeout(async () => {
      setStats({
        balance: 1250.75,
        totalEarnings: 8750.50,
        totalSales: 45,
        totalClicks: 1200,
        monthlyEarnings: 1250.75,
        conversionRate: 3.75,
        level: 'Active'
      });

      setAffiliateLinks([
        {
          productId: '1',
          productName: 'Beam Wallet Installation for Merchants',
          price: 75,
          commission: 50,
          commissionAmount: 37.50,
          link: `${window.location.origin}/payment?v=75&id=${user?.resellerId}&product=1`
        },
        {
          productId: '2',
          productName: 'Commercial Agent License',
          price: 150,
          commission: 40,
          commissionAmount: 60,
          link: `${window.location.origin}/payment?v=150&id=${user?.resellerId}&product=2`
        }
      ]);

      setRecentTransactions([
        {
          _id: '1',
          productName: 'Beam Wallet Installation',
          customerName: 'John Smith',
          productPrice: 75,
          commissionAmount: 37.50,
          paymentStatus: 'Confirmed',
          commissionStatus: 'Paid',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          _id: '2',
          productName: 'Commercial Agent License',
          customerName: 'Maria Garcia',
          productPrice: 150,
          commissionAmount: 60,
          paymentStatus: 'Confirmed',
          commissionStatus: 'Paid',
          createdAt: '2024-01-14T14:20:00Z'
        }
      ]);

      // Load gamification data
      try {
        const levels = await gamificationService.getLevels();
        const achievements = await gamificationService.getAchievements(user?.resellerId || '');
        
        // Find current and next level
        const currentLevelIndex = levels.findIndex(level => level.name === stats?.level);
        const currentLevel = currentLevelIndex >= 0 ? levels[currentLevelIndex] : levels[0];
        const nextLevel = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null;
        
        setCurrentLevel(currentLevel);
        setNextLevel(nextLevel);
        setAchievements(achievements);
        
        // Calculate level progress
        if (nextLevel && stats) {
          const progress = gamificationService.calculateLevelProgress(
            { sales: stats.totalSales, earnings: stats.totalEarnings },
            nextLevel
          );
          setLevelProgress(progress);
        }
      } catch (error) {
        console.error('Error loading gamification data:', error);
      }

      setLoading(false);
    }, 1000);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    setLoading(false);
  }
  };

  loadDashboardData();
  }, [user?.resellerId]);

  const copyToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(link);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const earningsData = [
    { month: 'Jan', earnings: 800, sales: 12 },
    { month: 'Feb', earnings: 1200, sales: 18 },
    { month: 'Mar', earnings: 950, sales: 15 },
    { month: 'Apr', earnings: 1400, sales: 22 },
    { month: 'May', earnings: 1100, sales: 17 },
    { month: 'Jun', earnings: 1250, sales: 20 },
  ];

  const salesData = [
    { product: 'Installation', sales: 25, revenue: 1875 },
    { product: 'License', sales: 15, revenue: 2250 },
    { product: 'Support', sales: 5, revenue: 1000 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-lg mr-4">
              <SparklesIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Here's your affiliate performance overview
              </p>
            </div>
          </div>
        </div>

        {/* Reseller ID Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl shadow-lg mr-4">
                <ClipboardDocumentIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Your Reseller ID</h3>
                <p className="text-sm text-gray-600">Use this ID in your affiliate links</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 rounded-lg px-4 py-2 border-2 border-gray-200">
                <span className="font-mono font-bold text-gray-900 text-lg">{user?.resellerId || 'Loading...'}</span>
              </div>
              <button
                onClick={() => copyToClipboard(user?.resellerId || '')}
                style={{
                  backgroundColor: copiedLink === user?.resellerId ? '#059669' : '#ff0000',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  border: '2px solid #cc0000',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  minWidth: '60px',
                  textAlign: 'center',
                  zIndex: 10,
                  position: 'relative'
                }}
              >
                {copiedLink === user?.resellerId ? 'COPIED!' : 'COPY'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-xl shadow-lg">
                <CurrencyDollarIcon className="h-5 w-5 sm:h-7 sm:w-7 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Current Balance</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">${stats?.balance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl shadow-lg">
                <ArrowTrendingUpIcon className="h-7 w-7 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                <p className="text-3xl font-bold text-gray-900">${stats?.monthlyEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl shadow-lg">
                <UserGroupIcon className="h-7 w-7 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalSales}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-xl shadow-lg">
                <ChartBarIcon className="h-7 w-7 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalClicks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Earnings Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Earnings Overview</h3>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Monthly Trend
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsData}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fill="url(#colorEarnings)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales by Product Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Sales by Product</h3>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                Revenue Distribution
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="product" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
              <div className="flex items-center text-sm text-green-600 font-medium">
                <FireIcon className="h-4 w-4 mr-1" />
                All Paid
              </div>
            </div>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{transaction.productName}</p>
                      <p className="text-sm text-gray-600">{transaction.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${transaction.commissionAmount}</p>
                    <p className="text-sm text-green-600 font-medium">{transaction.commissionStatus}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Summary</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Total Clicks</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{stats?.totalClicks}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <UserGroupIcon className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Total Earnings</span>
                </div>
                <span className="text-2xl font-bold text-purple-600">${stats?.totalEarnings.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <TrophyIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Account Level</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats?.level}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gamification Section */}
        {currentLevel && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                  <TrophyIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Your Progress</h3>
                  <p className="text-gray-600 mt-1">Level up to unlock better rewards</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-purple-600 font-medium bg-purple-50 px-3 py-2 rounded-lg">
                <StarIcon className="h-4 w-4 mr-2" />
                {currentLevel.name} Level
              </div>
            </div>

            {/* Current Level Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{currentLevel.icon}</span>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{currentLevel.name}</h4>
                    <p className="text-gray-600">Current Level</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">+{currentLevel.commissionBonus}%</div>
                  <div className="text-sm text-gray-600">Commission Bonus</div>
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-gray-900">Benefits:</h5>
                <ul className="space-y-1">
                  {currentLevel.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Next Level Progress */}
            {nextLevel && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">{nextLevel.icon}</span>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{nextLevel.name}</h4>
                      <p className="text-gray-600">Next Level</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">+{nextLevel.commissionBonus}%</div>
                    <div className="text-sm text-gray-600">Commission Bonus</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Sales Progress</span>
                      <span>{stats?.totalSales || 0} / {nextLevel.minSales}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((stats?.totalSales || 0) / nextLevel.minSales * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Earnings Progress</span>
                      <span>${stats?.totalEarnings.toFixed(0) || 0} / ${nextLevel.minEarnings}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((stats?.totalEarnings || 0) / nextLevel.minEarnings * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Achievements */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4">Recent Achievements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className={`p-4 rounded-xl border-2 ${
                    achievement.isUnlocked 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{achievement.icon}</span>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{achievement.name}</h5>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      {achievement.isUnlocked && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    {achievement.reward.type === 'bonus' && (
                      <div className="text-sm text-green-600 font-medium">
                        +${achievement.reward.value} Bonus
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reseller Links */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <TrophyIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Your Reseller Links</h3>
                <p className="text-gray-600 mt-1">Share these links to earn commissions</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-blue-600 font-medium bg-blue-50 px-3 py-2 rounded-lg">
              <LightBulbIcon className="h-4 w-4 mr-2" />
              Active Links
            </div>
          </div>
          
          <div className="space-y-6">
            {affiliateLinks.map((link) => (
              <div key={link.productId} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                      <CurrencyDollarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{link.productName}</h4>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">
                          <span className="font-semibold text-green-600">${link.price}</span> per sale
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">
                          <span className="font-semibold text-blue-600">{link.commission}%</span> commission
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">
                          Earn <span className="font-semibold text-purple-600">${link.commissionAmount}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(link.link)}
                    style={{
                      backgroundColor: copiedLink === link.link ? '#059669' : '#ff0000',
                      color: 'white',
                      fontWeight: 'bold',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      border: '2px solid #cc0000',
                      cursor: 'pointer',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      minWidth: '80px',
                      textAlign: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      if (copiedLink !== link.link) {
                        e.currentTarget.style.backgroundColor = '#cc0000';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (copiedLink !== link.link) {
                        e.currentTarget.style.backgroundColor = '#ff0000';
                      }
                    }}
                  >
                    {copiedLink === link.link ? '✓ COPIED!' : '📋 COPY'}
                  </button>
                </div>
                
                <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Affiliate Link:</label>
                      <input
                        type="text"
                        readOnly
                        value={link.link}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="ml-4 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Use Your Links Section */}
        <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <LightBulbIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-bold text-lg text-blue-900">💡 How to Use Your Links:</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center text-sm text-blue-800">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
              Share on Facebook, Instagram, Twitter, LinkedIn
            </div>
            <div className="flex items-center text-sm text-blue-800">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
              Send to WhatsApp groups and Telegram channels
            </div>
            <div className="flex items-center text-sm text-blue-800">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
              Include in email newsletters and marketing campaigns
            </div>
            <div className="flex items-center text-sm text-blue-800">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
              Post on forums and community groups
            </div>
            <div className="flex items-center text-sm text-blue-800">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
              Add to your website or blog
            </div>
            <div className="flex items-center text-sm text-blue-800">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
              Create YouTube videos and descriptions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 