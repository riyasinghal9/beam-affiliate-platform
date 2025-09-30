import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'billing', name: 'Billing', icon: '💳' }
  ];

  return (
    <div className="min-h-screen bg-beam-grey-50 pt-16">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-nunito-extrabold text-beam-charcoal-900 tracking-beam-tight">Account Settings</h1>
          <p className="text-sm sm:text-base font-nunito-regular text-beam-charcoal-700 mt-1 sm:mt-2 tracking-beam-normal">
            Manage your account information and preferences
          </p>
        </div>

        <div className="bg-white shadow-beam rounded-2xl">
          {/* Tabs - Mobile Optimized */}
          <div className="border-b border-beam-grey-200">
            <nav className="-mb-px flex px-3 sm:px-6 overflow-x-auto">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-nunito-semibold text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-beam-pink-500 text-beam-pink-600'
                      : 'border-transparent text-beam-charcoal-500 hover:text-beam-charcoal-700 hover:border-beam-grey-300'
                  }`}
                  style={{ marginRight: index < tabs.length - 1 ? '1rem sm:3rem' : '0' }}
                >
                  <span className="mr-1 sm:mr-3">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-3 sm:p-6">
            {activeTab === 'profile' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-nunito-semibold text-beam-charcoal-900 tracking-beam-normal">Profile Information</h3>
                  <p className="text-xs sm:text-sm font-nunito-regular text-beam-charcoal-600 tracking-beam-normal">
                    Update your personal information and contact details.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                  <div>
                    <label className="block text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-700 mb-1 sm:mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue={user?.firstName}
                      className="block w-full border border-beam-grey-300 rounded-lg px-3 py-2 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-beam-pink-500 font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-700 mb-1 sm:mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue={user?.lastName}
                      className="block w-full border border-beam-grey-300 rounded-lg px-3 py-2 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-beam-pink-500 font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-700 mb-1 sm:mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="block w-full border border-beam-grey-300 rounded-lg px-3 py-2 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-beam-pink-500 font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-700 mb-1 sm:mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="block w-full border border-beam-grey-300 rounded-lg px-3 py-2 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-beam-pink-500 font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-700 mb-1 sm:mb-2">Reseller ID</label>
                    <input
                      type="text"
                      defaultValue={user?.resellerId}
                      readOnly
                      className="block w-full border border-beam-grey-300 rounded-lg px-3 py-2 sm:py-2 text-sm bg-beam-grey-50 font-nunito-regular text-beam-charcoal-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-700 mb-1 sm:mb-2">Level</label>
                    <input
                      type="text"
                      defaultValue={user?.level}
                      readOnly
                      className="block w-full border border-beam-grey-300 rounded-lg px-3 py-2 sm:py-2 text-sm bg-beam-grey-50 font-nunito-regular text-beam-charcoal-700"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 sm:pt-4">
                  <button className="bg-gradient-beam text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gradient-beam-reverse text-sm sm:text-base font-nunito-semibold transition-all duration-200 shadow-beam hover:shadow-beam-lg">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-nunito-semibold text-beam-charcoal-900 tracking-beam-normal">Security Settings</h3>
                  <p className="text-xs sm:text-sm font-nunito-regular text-beam-charcoal-600 tracking-beam-normal">
                    Manage your password and security preferences.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-700 mb-1 sm:mb-2">Current Password</label>
                    <input
                      type="password"
                      className="block w-full border border-beam-grey-300 rounded-lg px-3 py-2 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-beam-pink-500 font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-700 mb-1 sm:mb-2">New Password</label>
                    <input
                      type="password"
                      className="block w-full border border-beam-grey-300 rounded-lg px-3 py-2 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-beam-pink-500 font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-700 mb-1 sm:mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="block w-full border border-beam-grey-300 rounded-lg px-3 py-2 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-beam-pink-500 focus:border-beam-pink-500 font-nunito-regular text-beam-charcoal-900 placeholder-beam-grey-400 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 sm:pt-4">
                  <button className="bg-gradient-beam text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gradient-beam-reverse text-sm sm:text-base font-nunito-semibold transition-all duration-200 shadow-beam hover:shadow-beam-lg">
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-nunito-semibold text-beam-charcoal-900 tracking-beam-normal">Notification Preferences</h3>
                  <p className="text-xs sm:text-sm font-nunito-regular text-beam-charcoal-600 tracking-beam-normal">
                    Choose how you want to be notified about your account activity.
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-beam-grey-50 rounded-lg">
                    <div className="flex-1 mr-3">
                      <h4 className="text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-900 tracking-beam-normal">Email Notifications</h4>
                      <p className="text-xs sm:text-sm font-nunito-regular text-beam-charcoal-600 mt-1 tracking-beam-normal">Receive notifications about sales and payments</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-beam-pink-600 focus:ring-beam-pink-500 border-beam-grey-300 rounded flex-shrink-0"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-beam-grey-50 rounded-lg">
                    <div className="flex-1 mr-3">
                      <h4 className="text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-900 tracking-beam-normal">SMS Notifications</h4>
                      <p className="text-xs sm:text-sm font-nunito-regular text-beam-charcoal-600 mt-1 tracking-beam-normal">Receive SMS alerts for important updates</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-beam-pink-600 focus:ring-beam-pink-500 border-beam-grey-300 rounded flex-shrink-0"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-beam-grey-50 rounded-lg">
                    <div className="flex-1 mr-3">
                      <h4 className="text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-900 tracking-beam-normal">Weekly Reports</h4>
                      <p className="text-xs sm:text-sm font-nunito-regular text-beam-charcoal-600 mt-1 tracking-beam-normal">Get weekly performance summaries</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-beam-pink-600 focus:ring-beam-pink-500 border-beam-grey-300 rounded flex-shrink-0"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-beam-grey-50 rounded-lg">
                    <div className="flex-1 mr-3">
                      <h4 className="text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-900 tracking-beam-normal">Marketing Updates</h4>
                      <p className="text-xs sm:text-sm font-nunito-regular text-beam-charcoal-600 mt-1 tracking-beam-normal">Receive updates about new features and promotions</p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-beam-pink-600 focus:ring-beam-pink-500 border-beam-grey-300 rounded flex-shrink-0"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2 sm:pt-4">
                  <button className="bg-gradient-beam text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gradient-beam-reverse text-sm sm:text-base font-nunito-semibold transition-all duration-200 shadow-beam hover:shadow-beam-lg">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-nunito-semibold text-beam-charcoal-900 tracking-beam-normal">Billing Information</h3>
                  <p className="text-xs sm:text-sm font-nunito-regular text-beam-charcoal-600 tracking-beam-normal">
                    Manage your payment methods and billing details.
                  </p>
                </div>

                <div className="bg-beam-grey-50 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div>
                      <h4 className="text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-900 tracking-beam-normal">Current Balance</h4>
                      <p className="text-xl sm:text-2xl font-nunito-extrabold text-beam-charcoal-900 tracking-beam-tight">${user?.balance?.toFixed(2) || '0.00'}</p>
                    </div>
                    <button className="bg-gradient-beam text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gradient-beam-reverse text-sm sm:text-base font-nunito-semibold transition-all duration-200 w-full sm:w-auto shadow-beam hover:shadow-beam-lg">
                      Withdraw Funds
                    </button>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-900 tracking-beam-normal">Payment Methods</h4>
                  <div className="border border-beam-grey-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-beam-pink-100 rounded-lg flex items-center justify-center">
                          <span className="text-beam-pink-600 font-nunito-bold text-xs sm:text-sm">B</span>
                        </div>
                        <div className="ml-2 sm:ml-3">
                          <p className="text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-900 tracking-beam-normal">Beam Wallet</p>
                          <p className="text-xs sm:text-sm font-nunito-regular text-beam-charcoal-600 tracking-beam-normal">Connected</p>
                        </div>
                      </div>
                      <span className="text-beam-teal-600 text-xs sm:text-sm font-nunito-semibold">Default</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-900 tracking-beam-normal">Recent Transactions</h4>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between p-3 bg-beam-grey-50 rounded-lg">
                      <div>
                        <p className="text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-900 tracking-beam-normal">Commission Earned</p>
                        <p className="text-xs font-nunito-regular text-beam-charcoal-600 tracking-beam-normal">Today, 2:30 PM</p>
                      </div>
                      <span className="text-beam-teal-600 text-xs sm:text-sm font-nunito-semibold">+$25.00</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-beam-grey-50 rounded-lg">
                      <div>
                        <p className="text-xs sm:text-sm font-nunito-semibold text-beam-charcoal-900 tracking-beam-normal">Withdrawal</p>
                        <p className="text-xs font-nunito-regular text-beam-charcoal-600 tracking-beam-normal">Yesterday, 1:15 PM</p>
                      </div>
                      <span className="text-beam-pink-600 text-xs sm:text-sm font-nunito-semibold">-$100.00</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 