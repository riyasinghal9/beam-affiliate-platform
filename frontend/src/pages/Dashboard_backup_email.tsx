import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  EnvelopeIcon, 
  ArrowPathIcon,
  UserGroupIcon,
  EyeIcon,
  CursorArrowRaysIcon as CursorIcon,
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import BeamLogo from '../components/ui/BeamLogo';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last Month');
  const [selectedEngagementPeriod, setSelectedEngagementPeriod] = useState('Last Month');
  const [selectedComparisonPeriod, setSelectedComparisonPeriod] = useState('Last 12 Months');
  const [selectedType, setSelectedType] = useState('All Type');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('reports'); // Add state for active section
  const navigate = useNavigate();
  const { user } = useAuth();

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
      { id: 'logout', label: 'Log out', icon: ArrowPathIcon, href: '/logout' }
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
      ['Open Rate', '24%', '+36%', 'Last Month'],
      ['Click Rate', '08%', '+12%', 'Last Month'],
      ['Bounce Rate', '02%', '-05%', 'Last Month'],
      ['Unsubscribe Rate', '01%', '-02%', 'Last Month']
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

  // Dynamic data based on selected time period
  const getPerformanceData = (period: string) => {
    switch (period) {
      case 'Last Week':
        return [
          { date: 'Mon', opens: 85, clicks: 62, bounces: 28 },
          { date: 'Tue', opens: 92, clicks: 71, bounces: 31 },
          { date: 'Wed', opens: 78, clicks: 58, bounces: 25 },
          { date: 'Thu', opens: 105, clicks: 83, bounces: 35 },
          { date: 'Fri', opens: 118, clicks: 89, bounces: 42 },
          { date: 'Sat', opens: 95, clicks: 67, bounces: 29 },
          { date: 'Sun', opens: 87, clicks: 64, bounces: 26 }
        ];
      case 'Last 3 Months':
        return [
          { date: 'Apr', opens: 2840, clicks: 1980, bounces: 890 },
          { date: 'May', opens: 3120, clicks: 2240, bounces: 1020 },
          { date: 'Jun', opens: 2987, clicks: 2150, bounces: 980 }
        ];
      case 'Last Month':
      default:
        return [
          { date: 'Jun 10', opens: 120, clicks: 85, bounces: 45 },
          { date: 'Jun 11', opens: 135, clicks: 92, bounces: 38 },
          { date: 'Jun 12', opens: 245, clicks: 180, bounces: 60 },
          { date: 'Jun 13', opens: 198, clicks: 145, bounces: 52 },
          { date: 'Jun 14', opens: 167, clicks: 128, bounces: 43 },
          { date: 'Jun 15', opens: 189, clicks: 156, bounces: 48 }
        ];
    }
  };

  // Dynamic KPI data based on selected time period
  const getKPIData = (period: string) => {
    switch (period) {
      case 'Last Week':
        return [
          {
            title: 'Open Rate',
            value: '18%',
            change: '+22%',
            changeType: 'increase',
            icon: EyeIcon,
            color: 'bg-beam-pink-500'
          },
          {
            title: 'Click Rate',
            value: '06%',
            change: '+15%',
            changeType: 'increase',
            icon: CursorIcon,
            color: 'bg-beam-purple-500'
          },
          {
            title: 'Bounce Rate',
            value: '03%',
            change: '-08%',
            changeType: 'decrease',
            icon: ArrowPathIcon,
            color: 'bg-beam-teal-500'
          },
          {
            title: 'Unsubscribe Rate',
            value: '01%',
            change: '-03%',
            changeType: 'decrease',
            icon: XMarkIcon,
            color: 'bg-beam-yellow-500'
          }
        ];
      case 'Last 3 Months':
        return [
          {
            title: 'Open Rate',
            value: '26%',
            change: '+42%',
            changeType: 'increase',
            icon: EyeIcon,
            color: 'bg-beam-pink-500'
          },
          {
            title: 'Click Rate',
            value: '12%',
            change: '+28%',
            changeType: 'increase',
            icon: CursorIcon,
            color: 'bg-beam-purple-500'
          },
          {
            title: 'Bounce Rate',
            value: '01%',
            change: '-12%',
            changeType: 'decrease',
            icon: ArrowPathIcon,
            color: 'bg-beam-teal-500'
          },
          {
            title: 'Unsubscribe Rate',
            value: '00%',
            change: '-05%',
            changeType: 'decrease',
            icon: XMarkIcon,
            color: 'bg-beam-yellow-500'
          }
        ];
      case 'Last Month':
      default:
        return [
          {
            title: 'Open Rate',
            value: '24%',
            change: '+36%',
            changeType: 'increase',
            icon: EyeIcon,
            color: 'bg-beam-pink-500'
          },
          {
            title: 'Click Rate',
            value: '08%',
            change: '+12%',
            changeType: 'increase',
            icon: CursorIcon,
            color: 'bg-beam-purple-500'
          },
          {
            title: 'Bounce Rate',
            value: '02%',
            change: '-05%',
            changeType: 'decrease',
            icon: ArrowPathIcon,
            color: 'bg-beam-teal-500'
          },
          {
            title: 'Unsubscribe Rate',
            value: '01%',
            change: '-02%',
            changeType: 'decrease',
            icon: XMarkIcon,
            color: 'bg-beam-yellow-500'
          }
        ];
    }
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

  // Dynamic summary metrics based on selected time period
  const getSummaryMetrics = (period: string) => {
    switch (period) {
      case 'Last Week':
        return { value: '658', change: '+22%↑' };
      case 'Last 3 Months':
        return { value: '8,947', change: '+42%↑' };
      case 'Last Month':
      default:
        return { value: '2,987', change: '+36%↑' };
    }
  };

  const campaignData = [
    {
      name: 'Summer Sale 2025',
      opens: '2,456',
      clicks: '189',
      ctr: '7.7%',
      bounceRate: '2.1%'
    },
    {
      name: 'Newsletter #12',
      opens: '1,892',
      clicks: '145',
      ctr: '7.7%',
      bounceRate: '1.8%'
    },
    {
      name: 'Product Launch',
      opens: '3,124',
      clicks: '267',
      ctr: '8.5%',
      bounceRate: '2.3%'
    },
    {
      name: 'Weekly Update',
      opens: '1,567',
      clicks: '98',
      ctr: '6.3%',
      bounceRate: '1.5%'
    }
  ];

  return (
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
                <XMarkIcon className="h-6 w-6" />
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
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-beam-h1 font-nunito-extrabold text-beam-charcoal-900 mb-2">
                  Analytics & Reports
                </h1>
                <p className="text-sm sm:text-base lg:text-beam-para font-nunito-regular text-gray-600">
                  Track your email campaign performance and insights
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
                  <Bar dataKey="opens" fill="#FF2069" name="Opens" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" fill="#5030E2" name="Clicks" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bounces" fill="#54D9C9" name="Bounces" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Engagement */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                <h2 className="text-lg sm:text-xl lg:text-beam-h2 font-nunito-extrabold text-beam-charcoal-900 flex-1">
                  Engagement
                </h2>
                <select 
                  value={selectedEngagementPeriod}
                  onChange={(e) => setSelectedEngagementPeriod(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg font-nunito-regular text-sm bg-white flex-shrink-0"
                >
                  <option>Last Month</option>
                  <option>Last Week</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
              
              {/* Engagement Chart */}
              <div className="h-36 sm:h-48 bg-white rounded-lg relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getEngagementData(selectedEngagementPeriod)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percentage }) => `${device} ${percentage}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {getEngagementData(selectedEngagementPeriod).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color.replace('bg-', '#').split('-')[0] === 'beam' ? 
                          (entry.color.includes('pink') ? '#FF2069' : 
                           entry.color.includes('teal') ? '#54D9C9' : 
                           entry.color.includes('purple') ? '#5030E2' : '#FF2069') : '#FF2069'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="mt-4 space-y-2">
                {getEngagementData(selectedEngagementPeriod).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-xs sm:text-sm font-nunito-regular text-gray-700">
                        {item.device}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-nunito-semibold text-gray-900">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

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
                      name="Opens"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#5030E2" 
                      strokeWidth={3}
                      dot={{ fill: '#5030E2', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#5030E2', strokeWidth: 2, fill: '#5030E2' }}
                      name="Clicks"
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
                      <th className="text-left py-2 sm:py-3 font-nunito-semibold text-gray-700 text-xs sm:text-sm">Opens</th>
                      <th className="text-left py-2 sm:py-3 font-nunito-semibold text-gray-700 text-xs sm:text-sm">Clicks</th>
                      <th className="text-left py-2 sm:py-3 font-nunito-semibold text-gray-700 text-xs sm:text-sm">CTR</th>
                      <th className="text-left py-2 sm:py-3 font-nunito-semibold text-gray-700 text-xs sm:text-sm">Bounce Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignData.map((campaign, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2 sm:py-3 font-nunito-semibold text-gray-900 text-xs sm:text-sm">{campaign.name}</td>
                        <td className="py-2 sm:py-3 font-nunito-regular text-gray-700 text-xs sm:text-sm">{campaign.opens}</td>
                        <td className="py-2 sm:py-3 font-nunito-regular text-gray-700 text-xs sm:text-sm">{campaign.clicks}</td>
                        <td className="py-2 sm:py-3 font-nunito-semibold text-green-600 text-xs sm:text-sm">{campaign.ctr}</td>
                        <td className="py-2 sm:py-3 font-nunito-semibold text-green-600 text-xs sm:text-sm">{campaign.bounceRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 