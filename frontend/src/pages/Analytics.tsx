import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import trackingService from '../services/trackingService';
import commissionService from '../services/commissionService';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AnalyticsData {
  clicks: number;
  sales: number;
  earnings: number;
  conversionRate: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
    commission: number;
  }>;
  trafficSources: Array<{
    source: string;
    clicks: number;
    sales: number;
    conversionRate: number;
  }>;
  dailyStats: Array<{
    date: string;
    clicks: number;
    sales: number;
    earnings: number;
  }>;
  monthlyStats: Array<{
    month: string;
    clicks: number;
    sales: number;
    earnings: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'clicks' | 'sales' | 'earnings'>('earnings');

  useEffect(() => {
    loadAnalyticsData();
  }, [period, user?.resellerId]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data
      setTimeout(() => {
        setAnalyticsData({
          clicks: 2450,
          sales: 89,
          earnings: 4450.75,
          conversionRate: 3.63,
          averageOrderValue: 50.01,
          topProducts: [
            { name: 'Beam Wallet Installation', sales: 45, revenue: 3375, commission: 1687.50 },
            { name: 'Commercial Agent License', sales: 28, revenue: 4200, commission: 1680 },
            { name: 'Premium Support Package', sales: 16, revenue: 3200, commission: 1083.25 }
          ],
          trafficSources: [
            { source: 'Social Media', clicks: 1200, sales: 45, conversionRate: 3.75 },
            { source: 'Email Marketing', clicks: 650, sales: 28, conversionRate: 4.31 },
            { source: 'Direct Traffic', clicks: 400, sales: 12, conversionRate: 3.00 },
            { source: 'Referrals', clicks: 200, sales: 4, conversionRate: 2.00 }
          ],
          dailyStats: [
            { date: '2024-01-01', clicks: 45, sales: 2, earnings: 75.00 },
            { date: '2024-01-02', clicks: 52, sales: 3, earnings: 112.50 },
            { date: '2024-01-03', clicks: 38, sales: 1, earnings: 37.50 },
            { date: '2024-01-04', clicks: 67, sales: 4, earnings: 150.00 },
            { date: '2024-01-05', clicks: 73, sales: 5, earnings: 187.50 },
            { date: '2024-01-06', clicks: 58, sales: 3, earnings: 112.50 },
            { date: '2024-01-07', clicks: 82, sales: 6, earnings: 225.00 }
          ],
          monthlyStats: [
            { month: 'Jan', clicks: 2450, sales: 89, earnings: 4450.75 },
            { month: 'Dec', clicks: 2100, sales: 76, earnings: 3800.25 },
            { month: 'Nov', clicks: 1850, sales: 68, earnings: 3400.50 },
            { month: 'Oct', clicks: 2200, sales: 82, earnings: 4100.00 },
            { month: 'Sep', clicks: 1950, sales: 71, earnings: 3550.75 },
            { month: 'Aug', clicks: 2300, sales: 85, earnings: 4250.25 }
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setLoading(false);
    }
  };

  const exportData = (format: 'csv' | 'pdf') => {
    // Simulate data export
    console.log(`Exporting data in ${format} format`);
    alert(`Data exported as ${format.toUpperCase()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8 space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-lg mr-4 mb-4 sm:mb-0">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">Analytics Dashboard</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600">Track your performance and optimize your strategy</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={loadAnalyticsData}
              className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => exportData('csv')}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => exportData('pdf')}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Period:</span>
              </div>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Metric:</span>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="clicks">Clicks</option>
                <option value="sales">Sales</option>
                <option value="earnings">Earnings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <EyeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <ArrowTrendingUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{analyticsData?.clicks.toLocaleString()}</h3>
            <p className="text-sm sm:text-base text-gray-600">Total Clicks</p>
            <p className="text-xs sm:text-sm text-green-600 mt-2">+12.5% from last period</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <ArrowTrendingUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{analyticsData?.sales}</h3>
            <p className="text-sm sm:text-base text-gray-600">Total Sales</p>
            <p className="text-xs sm:text-sm text-green-600 mt-2">+8.2% from last period</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <ArrowTrendingUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">${analyticsData?.earnings.toFixed(2)}</h3>
            <p className="text-sm sm:text-base text-gray-600">Total Earnings</p>
            <p className="text-xs sm:text-sm text-green-600 mt-2">+15.3% from last period</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <ArrowTrendingUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{analyticsData?.conversionRate.toFixed(2)}%</h3>
            <p className="text-sm sm:text-base text-gray-600">Conversion Rate</p>
            <p className="text-xs sm:text-sm text-green-600 mt-2">+2.1% from last period</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Performance Trend */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Performance Trend</h3>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <AreaChart data={analyticsData?.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Comparison */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Monthly Comparison</h3>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={analyticsData?.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clicks" fill="#3B82F6" />
                <Bar dataKey="sales" fill="#10B981" />
                <Bar dataKey="earnings" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Top Performing Products</h3>
            <div className="space-y-3 sm:space-y-4">
              {analyticsData?.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xs sm:text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900">{product.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-bold text-gray-900">${product.commission.toFixed(2)}</div>
                    <div className="text-xs sm:text-sm text-gray-600">commission</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Traffic Sources</h3>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <PieChart>
                <Pie
                  data={analyticsData?.trafficSources}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={60}
                  className="sm:outerRadius={80}"
                  fill="#8884d8"
                  dataKey="clicks"
                >
                  {analyticsData?.trafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources Table */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Traffic Sources Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-900 text-sm">Source</th>
                  <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-900 text-sm">Clicks</th>
                  <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-900 text-sm">Sales</th>
                  <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-900 text-sm">Conv. Rate</th>
                  <th className="text-right py-3 px-2 sm:px-4 font-semibold text-gray-900 text-sm">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData?.trafficSources.map((source, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 sm:px-4 font-medium text-gray-900 text-sm">{source.source}</td>
                    <td className="py-3 px-2 sm:px-4 text-right text-gray-600 text-sm">{source.clicks.toLocaleString()}</td>
                    <td className="py-3 px-2 sm:px-4 text-right text-gray-600 text-sm">{source.sales}</td>
                    <td className="py-3 px-2 sm:px-4 text-right text-gray-600 text-sm">{source.conversionRate.toFixed(2)}%</td>
                    <td className="py-3 px-2 sm:px-4 text-right font-semibold text-green-600 text-sm">
                      ${(source.sales * 50).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 