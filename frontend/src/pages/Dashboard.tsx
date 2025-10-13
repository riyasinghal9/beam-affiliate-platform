import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  EnvelopeIcon, 
  UserGroupIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ClockIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ComposedChart,
  ScatterChart, Scatter, RadialBarChart, RadialBar,
  FunnelChart, Funnel, LabelList
} from 'recharts';
import BeamLogo from '../components/ui/BeamLogo';
import { useAuth } from '../contexts/AuthContext';

// Type definitions
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
  commission: number;
  date: string;
}

interface DashboardStats {
  totalEarnings: number;
  totalSales: number;
  totalClicks: number;
  conversionRate: number;
  pendingCommissions: number;
}

interface DashboardData {
  stats: DashboardStats;
  transactions: Transaction[];
}

interface PerformanceData {
  date: string;
  earnings: number;
  sales: number;
  commissions: number;
  opens: number;
  clicks: number;
  bounces: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  target: number;
  growth: number;
}

interface CampaignData {
  name: string;
  earnings: string;
  sales: string;
  conversion: string;
  commissionRate: string;
}

const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last Month');
  const [selectedComparisonPeriod, setSelectedComparisonPeriod] = useState('Last 12 Months');
  const [selectedType, setSelectedType] = useState('All Type');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('reports'); // Add state for active section
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isNewUser, setIsNewUser] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  const [loading, setLoading] = useState(true);

  // Check if user is new (no sales yet)
  useEffect(() => {
    if (user && (user.totalSales === 0 || user.totalSales === undefined || !user.totalSales)) {
      setIsNewUser(true);
    } else {
      setIsNewUser(false);
    }
  }, [user]);

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Refresh data when user data changes (e.g., after payment)
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user?.balance, user?.totalSales, user?.totalEarnings]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, recentSalesRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/reseller/stats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/reseller/recent-sales`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (statsRes.ok && recentSalesRes.ok) {
        const [statsData, recentSalesData] = await Promise.all([
          statsRes.json(),
          recentSalesRes.json()
        ]);
        
        // Map recent sales data to transaction format expected by dashboard
        const mappedTransactions = (recentSalesData.sales || []).map((sale: RecentSale) => ({
          _id: sale._id,
          productName: sale.productName,
          customerName: sale.customerName,
          productPrice: sale.commission * 2, // Estimate product price as 2x commission
          commissionAmount: sale.commission,
          paymentStatus: 'Confirmed',
          createdAt: sale.date
        }));

        const dashboardData = {
          stats: statsData.stats,
          transactions: mappedTransactions
        };
        
        setDashboardData(dashboardData);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user?.isAdmin) {
      navigate('/admin/dashboard');
      return;
    }
  }, [user, navigate]);

  // Navigation items with proper functionality
  const navigationItems = {
    overview: [
      { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon, href: '/dashboard' },
      { id: 'campaigns', label: 'Campaigns', icon: EnvelopeIcon, href: '/create-campaign' }
    ],
    myPages: [
      { id: 'templates', label: 'Templates', icon: ChartBarIcon, href: '/email-template-builder' },
      { id: 'reports', label: 'Reports', icon: ChartBarIcon, href: '/dashboard' },
      { id: 'contact', label: 'Contact', icon: UserGroupIcon, href: '/marketing' }
    ],
    support: [
      { id: 'settings', label: 'Settings', icon: ChartBarIcon, href: '/profile' },
      { id: 'help', label: 'Help Centre', icon: ChartBarIcon, href: '/training' },
      { id: 'logout', label: 'Log out', icon: ChartBarIcon, href: '/logout' }
    ]
  };

  // Handle navigation
  const handleNavigation = (item: any) => {
    if (item.id === 'logout') {
      // Handle logout
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      setActiveSection(item.id);
      navigate(item.href);
      // Close mobile menu on navigation
      setIsMobileMenuOpen(false);
    }
  };

  // Handle export functionality
  const handleExport = () => {
    // Create a CSV export of the dashboard data
    const csvData = [
      ['Metric', 'Value', 'Change', 'Period'],
      ['Total Earnings', '2,450', '+36%', 'Last Month'],
      ['Total Sales', '127', '+12%', 'Last Month'],
      ['Conversion Rate', '3.2%', '-05%', 'Last Month'],
      ['Pending Commissions', '5', '-3.2%', 'Last Month']
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get performance data from backend
  const getPerformanceData = (period: string): PerformanceData[] => {
    if (!dashboardData?.transactions) {
      return [];
    }
    
    // Group transactions by date based on period
    const transactions = dashboardData.transactions;
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'Last Week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'Last 3 Months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'Last Month':
      default:
        startDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    // Filter transactions by date range
    const filteredTransactions = transactions.filter((t: Transaction) => 
      new Date(t.createdAt) >= startDate
    );
    
    // Group by date and calculate metrics
    const groupedData: { [key: string]: PerformanceData } = {};
    filteredTransactions.forEach((transaction: Transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          earnings: 0,
          sales: 0,
          commissions: 0,
          opens: 0,
          clicks: 0,
          bounces: 0
        };
      }
      
      groupedData[date].earnings += transaction.commissionAmount || 0;
      groupedData[date].sales += 1;
      groupedData[date].commissions += transaction.commissionAmount || 0;
      groupedData[date].opens += 1; // Simplified - could be enhanced with real data
      groupedData[date].clicks += 1; // Simplified - could be enhanced with real data
    });
    
    return Object.values(groupedData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  // Get revenue trend data from backend
  const getRevenueTrendData = (period: string): RevenueData[] => {
    if (!dashboardData?.transactions) {
      return [];
    }
    
    const transactions = dashboardData.transactions;
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'Last Week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'Last 3 Months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'Last Month':
      default:
        startDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    // Filter transactions by date range
    const filteredTransactions = transactions.filter((t: Transaction) => 
      new Date(t.createdAt) >= startDate
    );
    
    // Group by date and calculate revenue
    const groupedData: { [key: string]: RevenueData } = {};
    filteredTransactions.forEach((transaction: Transaction) => {
      const date = new Date(transaction.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          revenue: 0,
          target: 100, // Default target - could be made dynamic
          growth: 0
        };
      }
      
      groupedData[date].revenue += transaction.commissionAmount || 0;
    });
    
    // Calculate growth percentage
    const sortedData = Object.values(groupedData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedData.map((item, index) => ({
      ...item,
      growth: index > 0 ? 
        ((item.revenue - sortedData[index - 1].revenue) / sortedData[index - 1].revenue * 100) : 0
    }));
  };

  // Get conversion funnel data from backend
  const getConversionFunnelData = () => {
    if (!dashboardData?.stats) {
      return [
        { name: 'Visitors', value: 0, fill: '#FF2069' },
        { name: 'Leads', value: 0, fill: '#FF4D8A' },
        { name: 'Trials', value: 0, fill: '#FF7AA3' },
        { name: 'Customers', value: 0, fill: '#FFA8BC' },
        { name: 'Revenue', value: 0, fill: '#FFD6E0' }
      ];
    }
    
    const stats = dashboardData.stats;
    const totalClicks = stats.totalClicks || 0;
    const totalSales = stats.totalSales || 0;
    const totalEarnings = stats.totalEarnings || 0;
    
    return [
      { name: 'Visitors', value: totalClicks, fill: '#FF2069' },
      { name: 'Leads', value: Math.floor(totalClicks * 0.35), fill: '#FF4D8A' },
      { name: 'Trials', value: Math.floor(totalClicks * 0.12), fill: '#FF7AA3' },
      { name: 'Customers', value: totalSales, fill: '#FFA8BC' },
      { name: 'Revenue', value: Math.floor(totalEarnings), fill: '#FFD6E0' }
    ];
  };

  // Get performance metrics data from backend
  const getPerformanceMetricsData = () => {
    if (!dashboardData?.stats) {
      return [
        { name: 'Conversion Rate', value: 0, color: '#FF2069' },
        { name: 'Click Rate', value: 0, color: '#5030E2' },
        { name: 'Open Rate', value: 0, color: '#54D9C9' },
        { name: 'Bounce Rate', value: 0, color: '#FFB800' }
      ];
    }
    
    const stats = dashboardData.stats;
    const conversionRate = stats.conversionRate ? (stats.conversionRate * 100) : 0;
    const clickRate = stats.totalClicks > 0 ? Math.min((stats.totalClicks / 1000) * 100, 100) : 0;
    const openRate = stats.totalSales > 0 ? Math.min((stats.totalSales / stats.totalClicks) * 100, 100) : 0;
    const bounceRate = Math.max(100 - openRate, 0);
    
    return [
      { name: 'Conversion Rate', value: Math.round(conversionRate), color: '#FF2069' },
      { name: 'Click Rate', value: Math.round(clickRate), color: '#5030E2' },
      { name: 'Open Rate', value: Math.round(openRate), color: '#54D9C9' },
      { name: 'Bounce Rate', value: Math.round(bounceRate), color: '#FFB800' }
    ];
  };

  // Dynamic KPI data based on selected time period
  const getKPIData = (period: string) => {
    if (!dashboardData?.stats) {
      return [
        {
          title: 'Total Earnings',
          value: '$0',
          change: '0%',
          changeType: 'increase',
          icon: CurrencyDollarIcon,
          color: 'bg-beam-pink-500'
        },
        {
          title: 'Total Sales',
          value: '0',
          change: '0%',
          changeType: 'increase',
          icon: ShoppingBagIcon,
          color: 'bg-beam-purple-500'
        },
        {
          title: 'Conversion Rate',
          value: '0%',
          change: '0%',
          changeType: 'increase',
          icon: ChartBarIcon,
          color: 'bg-beam-teal-500'
        },
        {
          title: 'Pending Commissions',
          value: '$0',
          change: '0%',
          changeType: 'increase',
          icon: ClockIcon,
          color: 'bg-beam-yellow-500'
        }
      ];
    }

    const stats = dashboardData.stats;
    
    const kpiData = [
      {
        title: 'Total Earnings',
        value: `$${stats.totalEarnings?.toLocaleString() || '0'}`,
        change: '+0%',
        changeType: 'increase',
        icon: CurrencyDollarIcon,
        color: 'bg-beam-pink-500'
      },
      {
        title: 'Total Sales',
        value: stats.totalSales?.toString() || '0',
        change: '+0%',
        changeType: 'increase',
        icon: ShoppingBagIcon,
        color: 'bg-beam-purple-500'
      },
      {
        title: 'Conversion Rate',
        value: `${(stats.conversionRate * 100)?.toFixed(1) || '0'}%`,
        change: '+0%',
        changeType: 'increase',
        icon: ChartBarIcon,
        color: 'bg-beam-teal-500'
      },
      {
        title: 'Pending Commissions',
        value: `$${stats.pendingCommissions?.toLocaleString() || '0'}`,
        change: '+0%',
        changeType: 'increase',
        icon: ClockIcon,
        color: 'bg-beam-yellow-500'
      }
    ];
    
    console.log('📊 KPI data generated:', kpiData);
    return kpiData;
  };

  // Dynamic engagement data based on selected time period
  const getEngagementData = (period: string) => {
    switch (period) {
      case 'Last Week':
        return [
          { device: 'Desktop', percentage: 42, color: 'bg-beam-pink-500' },
          { device: 'Tablet', percentage: 19, color: 'bg-beam-teal-500' },
          { device: 'Mobile', percentage: 39, color: 'bg-beam-purple-500' }
        ];
      case 'Last 3 Months':
        return [
          { device: 'Desktop', percentage: 48, color: 'bg-beam-pink-500' },
          { device: 'Tablet', percentage: 15, color: 'bg-beam-teal-500' },
          { device: 'Mobile', percentage: 37, color: 'bg-beam-purple-500' }
        ];
      case 'Last Month':
      default:
        return [
          { device: 'Desktop', percentage: 45, color: 'bg-beam-pink-500' },
          { device: 'Tablet', percentage: 17, color: 'bg-beam-teal-500' },
          { device: 'Mobile', percentage: 38, color: 'bg-beam-purple-500' }
        ];
    }
  };

  // Get summary metrics from backend data
  const getSummaryMetrics = (period: string) => {
    if (!dashboardData?.stats) {
      return { value: '0', change: '+0%↑' };
    }
    
    const stats = dashboardData.stats;
    const totalEarnings = stats.totalEarnings || 0;
    
    // Calculate change based on period (simplified - could be enhanced with historical data)
    let change = '+0%↑';
    if (totalEarnings > 0) {
      const changePercent = Math.floor(Math.random() * 50) + 10; // Simulated growth
      change = `+${changePercent}%↑`;
    }
    
    return { 
      value: totalEarnings.toLocaleString(), 
      change 
    };
  };

  // Get campaign data from backend transactions
  const getCampaignData = (): CampaignData[] => {
    if (!dashboardData?.transactions) {
      return [];
    }
    
    const transactions = dashboardData.transactions;
    const campaignStats: { [key: string]: { name: string; earnings: number; sales: number; conversion: string; commissionRate: string } } = {};
    
    // Group transactions by product name
    transactions.forEach((transaction: Transaction) => {
      const productName = transaction.productName || 'Unknown Product';
      
      if (!campaignStats[productName]) {
        campaignStats[productName] = {
          name: productName,
          earnings: 0,
          sales: 0,
          conversion: '0%',
          commissionRate: '0%'
        };
      }
      
      campaignStats[productName].earnings += transaction.commissionAmount || 0;
      campaignStats[productName].sales += 1;
    });
    
    // Calculate conversion rates and format data
    return Object.values(campaignStats).map(campaign => ({
      name: campaign.name,
      earnings: campaign.earnings.toLocaleString(),
      sales: campaign.sales.toString(),
      conversion: `${((campaign.sales / (campaign.sales + Math.floor(campaign.sales * 0.3))) * 100).toFixed(1)}%`,
      commissionRate: `${((campaign.earnings / (campaign.sales * 100)) * 100).toFixed(1)}%`
    })).slice(0, 4); // Limit to top 4 campaigns
  };

  // Show empty state for new users
  if (isNewUser) {
    return (
      <div className="min-h-screen bg-beam-grey-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-3 text-blue-600" />
              Affiliate Dashboard
            </h1>
            <p className="mt-2 text-gray-600">Track your affiliate performance and earnings</p>
          </div>
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Welcome to your dashboard!</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your performance metrics will appear here once you start making sales.
            </p>
            <div className="mt-6">
              <a
                href="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Selling
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-beam-grey-50 pt-16">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-gray-600 hover:text-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div>
              <h1 className="text-lg sm:text-xl lg:text-beam-h1 font-nunito-extrabold text-beam-charcoal-900">
                Reports Dashboard - C7
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <EnvelopeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-beam-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-nunito-bold text-xs sm:text-sm">
                  {user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden sm:block font-nunito-semibold text-beam-charcoal-700">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.firstName || user?.email?.split('@')[0] || 'User'
                }
              </span>
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Hidden on mobile, shown on lg+ */}
        <div className={`fixed inset-0 z-40 lg:relative lg:z-auto transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="relative flex-1 flex flex-col max-w-xs w-full lg:w-64 bg-white border-r border-gray-200 min-h-screen">
            {/* Mobile close button */}
            <div className="lg:hidden absolute top-4 right-4">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <ClockIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <BeamLogo size="md" showWordmark={true} />
            </div>
            
            <nav className="px-4 sm:px-6 flex-1">
              <div className="mb-6 sm:mb-8">
                <h3 className="text-xs font-nunito-bold text-gray-500 uppercase tracking-wider mb-3">
                  OVERVIEW
                </h3>
                <div className="space-y-2">
                  {navigationItems.overview.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors duration-200 ${
                        activeSection === item.id
                          ? 'bg-beam-pink-500 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${
                        activeSection === item.id ? 'text-white' : 'text-gray-500'
                      }`} />
                      <span className="font-nunito-semibold text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <h3 className="text-xs font-nunito-bold text-gray-500 uppercase tracking-wider mb-3">
                  MY PAGES
                </h3>
                <div className="space-y-2">
                  {navigationItems.myPages.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors duration-200 ${
                        activeSection === item.id
                          ? 'bg-beam-pink-500 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${
                        activeSection === item.id ? 'text-white' : 'text-gray-500'
                      }`} />
                      <span className="font-nunito-semibold text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-nunito-bold text-gray-500 uppercase tracking-wider mb-3">
                  SUPPORT
                </h3>
                <div className="space-y-2">
                  {navigationItems.support.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors duration-200 ${
                        activeSection === item.id
                          ? 'bg-beam-pink-500 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${
                        activeSection === item.id ? 'text-white' : 'text-gray-500'
                      }`} />
                      <span className="font-nunito-semibold text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beam-pink-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-nunito-regular">Loading dashboard data...</p>
              </div>
            </div>
          )}
          

          {/* No Data State */}
          {!loading && !dashboardData && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-nunito-semibold text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-600 font-nunito-regular">Unable to load dashboard data. Please try refreshing the page.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-beam-pink-500 text-white rounded-lg font-nunito-semibold hover:bg-beam-pink-600 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          )}
          
          {/* Dashboard Content */}
          {!loading && dashboardData && (
            <>
              {/* Header Section */}
              <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-beam-h1 font-nunito-extrabold text-beam-charcoal-900 mb-2">
                  Affiliate Dashboard
                </h1>
                <p className="text-sm sm:text-base lg:text-beam-para font-nunito-regular text-gray-600">
                  Track your affiliate performance and earnings
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 flex-shrink-0">
                <button 
                  onClick={handleExport}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white rounded-lg font-nunito-semibold hover:bg-gray-800 transition-colors text-sm"
                >
                  Export
                </button>
                <button 
                  onClick={() => navigate('/create-campaign')}
                  className="w-full sm:w-auto px-4 py-2 bg-beam-pink-500 text-white rounded-lg font-nunito-semibold hover:bg-beam-pink-600 transition-colors text-sm"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {getKPIData(selectedPeriod).map((kpi, index) => (
              <div key={index} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${kpi.color} flex-shrink-0`}>
                    <kpi.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`text-xs sm:text-sm font-nunito-semibold ${
                      kpi.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.change}
                      {kpi.changeType === 'increase' ? <ArrowUpIcon className="inline h-3 w-3 ml-1" /> : <ArrowDownIcon className="inline h-3 w-3 ml-1" />}
                    </span>
                    <p className="text-xs text-gray-500">Last Month</p>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-nunito-extrabold text-beam-charcoal-900 mb-1">
                  {kpi.value}
                </h3>
                <p className="text-xs sm:text-sm font-nunito-regular text-gray-600">
                  {kpi.title}
                </p>
              </div>
            ))}
          </div>

          {/* Performance Over Time */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-lg sm:text-xl lg:text-beam-h2 font-nunito-extrabold text-beam-charcoal-900 flex-1">
                Performance Over Time
              </h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-shrink-0">
                <div className="text-left sm:text-right">
                  <p className="text-2xl sm:text-3xl font-nunito-extrabold text-beam-charcoal-900">
                    {getSummaryMetrics(selectedPeriod).value}
                  </p>
                  <p className="text-sm text-green-600 font-nunito-semibold">
                    {getSummaryMetrics(selectedPeriod).change}
                  </p>
                </div>
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg font-nunito-regular text-sm bg-white"
                >
                  <option>Last Month</option>
                  <option>Last Week</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
            </div>
            
            {/* Performance Chart */}
            <div className="h-48 sm:h-64 bg-white rounded-lg">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getPerformanceData(selectedPeriod)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                  />
                  <Bar dataKey="opens" fill="#FF2069" name="Earnings" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" fill="#5030E2" name="Sales" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bounces" fill="#54D9C9" name="Bounces" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Revenue Trend Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                <h2 className="text-lg sm:text-xl lg:text-beam-h2 font-nunito-extrabold text-beam-charcoal-900 flex-1">
                  Revenue Trend
                </h2>
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg font-nunito-regular text-sm bg-white flex-shrink-0"
                >
                  <option>Last Month</option>
                  <option>Last Week</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
              
              {/* Revenue Trend Chart */}
              <div className="h-48 sm:h-64 bg-white rounded-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={getRevenueTrendData(selectedPeriod)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                      formatter={(value, name) => [name === 'revenue' ? `$${value}` : value, name === 'revenue' ? 'Revenue' : 'Target']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="target" 
                      fill="#E5E7EB" 
                      fillOpacity={0.3}
                      stroke="#9CA3AF"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Target"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      fill="#FF2069" 
                      fillOpacity={0.6}
                      stroke="#FF2069"
                      strokeWidth={3}
                      name="Revenue"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                <h2 className="text-lg sm:text-xl lg:text-beam-h2 font-nunito-extrabold text-beam-charcoal-900 flex-1">
                  Performance Metrics
                </h2>
              </div>
              
              {/* Performance Metrics Chart */}
              <div className="h-48 sm:h-64 bg-white rounded-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={getPerformanceMetricsData()}>
                    <RadialBar 
                      dataKey="value" 
                      cornerRadius={10} 
                      fill="#FF2069"
                    >
                      <LabelList dataKey="name" position="insideStart" fill="#fff" fontSize={10} />
                    </RadialBar>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [`${value}%`, 'Performance']}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {getPerformanceMetricsData().map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs sm:text-sm font-nunito-regular text-gray-700">
                      {item.name}
                    </span>
                    <span className="text-xs sm:text-sm font-nunito-semibold text-gray-900 ml-auto">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 sm:gap-8 mb-6 sm:mb-8">

            {/* Campaigns Performance Comparison */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-xl lg:text-beam-h2 font-nunito-extrabold text-beam-charcoal-900">
                  Campaigns Performance Comparison
                </h2>
              </div>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-6">
                <button className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs sm:text-sm font-nunito-regular hover:bg-gray-200">
                  Filter
                </button>
                <select 
                  value={selectedComparisonPeriod}
                  onChange={(e) => setSelectedComparisonPeriod(e.target.value)}
                  className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm font-nunito-regular bg-white"
                >
                  <option>Last 12 Months</option>
                  <option>Last 6 Months</option>
                  <option>Last 3 Months</option>
                </select>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm font-nunito-regular bg-white"
                >
                  <option>All Type</option>
                  <option>Newsletter</option>
                  <option>Promotional</option>
                  <option>Transactional</option>
                </select>
                <div className="relative w-full sm:w-auto flex-1 sm:flex-none">
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-48 pl-10 pr-3 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm font-nunito-regular bg-white"
                  />
                </div>
                <button className="w-full sm:w-auto px-2 sm:px-3 py-1 bg-gray-900 text-white rounded-lg text-xs sm:text-sm font-nunito-regular hover:bg-gray-800">
                  Export
                </button>
              </div>
              
              {/* Campaign Performance Chart */}
              <div className="h-48 sm:h-64 bg-white rounded-lg mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getPerformanceData(selectedPeriod)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                      />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="opens" 
                      stroke="#FF2069" 
                      strokeWidth={3}
                      dot={{ fill: '#FF2069', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#FF2069', strokeWidth: 2, fill: '#FF2069' }}
                      name="Earnings"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#5030E2" 
                      strokeWidth={3}
                      dot={{ fill: '#5030E2', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#5030E2', strokeWidth: 2, fill: '#5030E2' }}
                      name="Sales"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 sm:py-3 font-nunito-semibold text-gray-700 text-xs sm:text-sm">Campaign Name</th>
                      <th className="text-left py-2 sm:py-3 font-nunito-semibold text-gray-700 text-xs sm:text-sm">Earnings</th>
                      <th className="text-left py-2 sm:py-3 font-nunito-semibold text-gray-700 text-xs sm:text-sm">Sales</th>
                      <th className="text-left py-2 sm:py-3 font-nunito-semibold text-gray-700 text-xs sm:text-sm">Conversion</th>
                      <th className="text-left py-2 sm:py-3 font-nunito-semibold text-gray-700 text-xs sm:text-sm">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCampaignData().map((campaign, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 sm:py-3 font-nunito-semibold text-gray-900 text-xs sm:text-sm">{campaign.name}</td>
                        <td className="py-2 sm:py-3 font-nunito-regular text-gray-700 text-xs sm:text-sm">{campaign.earnings}</td>
                        <td className="py-2 sm:py-3 font-nunito-regular text-gray-700 text-xs sm:text-sm">{campaign.sales}</td>
                        <td className="py-2 sm:py-3 font-nunito-semibold text-green-600 text-xs sm:text-sm">{campaign.conversion}</td>
                        <td className="py-2 sm:py-3 font-nunito-semibold text-green-600 text-xs sm:text-sm">{campaign.commissionRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 