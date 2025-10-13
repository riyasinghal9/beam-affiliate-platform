import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bars3Icon,
  XMarkIcon,
  WalletIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import NotificationCenter from '../ui/NotificationCenter';
import BeamLogo from '../ui/BeamLogo';

const UserDropdown: React.FC<{ user: any; isOpen: boolean; onClose: () => void; onLogout: () => void }> = ({ user, isOpen, onClose, onLogout }) => {
  if (!isOpen) return null;

  // Debug logging
  console.log('UserDropdown - User data:', user);
  console.log('UserDropdown - User firstName:', user?.firstName);
  console.log('UserDropdown - User lastName:', user?.lastName);
  console.log('UserDropdown - User email:', user?.email);

  const handleProfileClick = () => {
    console.log('Profile Settings clicked');
    onClose();
  };

  const handleSignOutClick = () => {
    console.log('Sign Out clicked');
    onLogout();
  };

  return (
    <div
      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-beam-lg border border-beam-grey-200 z-[9999] py-3"
    >
      <div className="px-4 py-3 border-b border-beam-grey-200">
        <div className="text-base font-nunito-semibold text-beam-charcoal-900">
          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || 'User'}
        </div>
        <div className="text-sm font-nunito-regular text-beam-charcoal-600">
          {user.email || 'No email available'}
        </div>
      </div>
      <Link
        to="/profile"
        className="flex items-center px-4 py-3 text-sm font-nunito-regular text-beam-charcoal-700 hover:text-beam-pink-600 hover:bg-beam-pink-50 transition-colors duration-200"
        onClick={handleProfileClick}
      >
        <CogIcon className="h-4 w-4 mr-3 text-beam-charcoal-400" />
        Profile Settings
      </Link>
      <button
        onClick={handleSignOutClick}
        className="flex items-center w-full px-4 py-3 text-sm font-nunito-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 text-left"
      >
        Sign Out
      </button>
    </div>
  );
};

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);





  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Ensure dropdown is closed when user changes or component mounts
  useEffect(() => {
    setIsUserDropdownOpen(false);
  }, [user]);

  // Fetch total revenue for admin users
  useEffect(() => {
    const fetchTotalRevenue = async () => {
      if (user?.isAdmin) {
        try {
          const response = await fetch("http://localhost:5001/api/admin/dashboard", {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            setTotalRevenue(data.stats?.totalRevenue || 0);
          }
        } catch (error) {
          console.error('Error fetching total revenue:', error);
        }
      }
    };

    fetchTotalRevenue();
  }, [user]);



  const handleLogout = () => {
    console.log('handleLogout called');
    console.log('Current user before logout:', user);
    logout();
    console.log('User after logout:', user);
    navigate('/');
    console.log('Navigated to home page');
  };

  const guestNavigation = [
    { name: 'Home', href: '/', current: false },
    { name: 'Products', href: '/products', current: false },
    { name: 'Training', href: '/training', current: false },
    { name: 'Marketing', href: '/marketing', current: false },
  ];

  const userNavigation = [
    { name: 'Home', href: '/', current: false },
    { name: 'Products', href: '/products', current: false },
    { name: 'Dashboard', href: '/dashboard', current: false },
    { name: 'Training', href: '/training', current: false },
    { name: 'Analytics', href: '/analytics', current: false },
    { name: 'Gamification', href: '/gamification', current: false },
    { name: 'Marketing', href: '/marketing', current: false },
    { name: 'Email Templates', href: '/email-template-builder', current: false },
    { name: 'Create Campaign', href: '/create-campaign', current: false },
    { name: 'Transactions', href: '/transactions', current: false },
  ];

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', current: false },
    { name: 'Admin Payments', href: '/admin/payments', current: false },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-beam-grey-200/50 fixed top-0 left-0 right-0 z-[9998]">

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center group">
                <BeamLogo
                  size="lg"
                  showWordmark={true}
                  className="group-hover:scale-105 transition-transform duration-200"
                />
                <span className="ml-2 text-lg sm:text-md lg:text-base font-nunito-semibold text-beam-charcoal-600 whitespace-nowrap tracking-beam-normal">
                  Affiliate
                </span>
              </Link>
            </div>

            {/* Desktop Navigation - Different for guests vs users */}
            <div className={`hidden lg:ml-6 lg:flex lg:space-x-1 ${
              user 
                ? 'lg:overflow-x-auto lg:whitespace-nowrap lg:pb-2 lg:max-w-2xl lg:scrollbar-hide' 
                : ''
            }`}>
              
              {(user ? userNavigation : guestNavigation).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-beam-charcoal-700 hover:text-beam-pink-600 px-3 py-2 rounded-lg text-sm font-nunito-semibold transition-all duration-200 hover:bg-beam-pink-50 tracking-beam-normal flex-shrink-0"
                >
                  {item.name}
                </Link>
              ))}
              {user?.isAdmin && (
                <>
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-red-600 hover:text-red-700 px-3 py-2 rounded-lg text-sm font-nunito-semibold transition-all duration-200 hover:bg-red-50 flex-shrink-0"
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-2 lg:space-x-3">


            {user ? (
              <div className="flex items-center space-x-3 lg:space-x-4">
                {/* Balance Display - Show total revenue for admin, individual balance for users */}
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-beam-teal-50 to-beam-teal-100 rounded-lg border border-beam-teal-200">
                  <WalletIcon className="h-5 w-5 text-beam-teal-600" />
                  <span className="text-sm font-nunito-semibold text-beam-teal-700">
                    ${user.isAdmin ? totalRevenue.toFixed(2) : (user.totalEarnings || 0).toFixed(2)}
                  </span>
                </div>

                {/* Notification Center - Show for all users including admin */}
                <NotificationCenter />

                {/* User Profile Dropdown - Show for all users including admin */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('User dropdown button clicked, current state:', isUserDropdownOpen);
                      setIsUserDropdownOpen(!isUserDropdownOpen);
                    }}
                    className="flex items-center space-x-3 text-beam-charcoal-700 hover:text-beam-pink-600 transition-colors duration-200 px-2 py-1 rounded-lg hover:bg-beam-pink-50"
                  >
                    <div className="w-10 h-10 bg-gradient-beam rounded-full flex items-center justify-center shadow-beam">
                      <span className="text-white text-base font-nunito-bold">
                        {(user.firstName || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-nunito-semibold text-beam-charcoal-900">
                      {user.firstName || user.email?.split('@')[0] || 'User'}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <UserDropdown
                      user={user}
                      isOpen={isUserDropdownOpen}
                      onClose={() => setIsUserDropdownOpen(false)}
                      onLogout={handleLogout}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                <Link
                  to="/login"
                  className="text-beam-charcoal-700 hover:text-beam-pink-600 px-3 py-2 rounded-lg text-sm font-nunito-semibold transition-all duration-200 hover:bg-beam-pink-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-beam hover:bg-gradient-beam-reverse text-white px-4 py-2 rounded-lg text-sm font-nunito-semibold transition-all duration-200 shadow-beam hover:shadow-beam-lg transform hover:-translate-y-0.5"
                >
                  Start Earning
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-beam-charcoal-400 hover:text-beam-charcoal-500 hover:bg-beam-pink-50 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-beam-grey-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {(user ? userNavigation : guestNavigation).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-beam-charcoal-900 hover:text-beam-pink-600 block px-3 py-2 rounded-lg text-base font-nunito-semibold transition-colors duration-200 tracking-beam-normal"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user?.isAdmin && (
              <>
                <div className="border-t border-beam-grey-200 pt-4 mt-4">
                  <p className="px-3 py-2 text-xs font-nunito-semibold text-beam-charcoal-500 uppercase tracking-wider">Admin</p>
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-red-600 hover:text-red-700 block px-3 py-2 rounded-lg text-base font-nunito-semibold transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
            {user ? (
              <>
                <div className="border-t border-beam-grey-200 pt-4 mt-4">
                  <div className="flex items-center px-3 py-3 bg-gradient-to-r from-beam-teal-50 to-beam-teal-100 rounded-lg mb-3 border border-beam-teal-200">
                    <WalletIcon className="h-5 w-5 mr-3 text-beam-teal-600" />
                    <div>
                      <p className="text-sm font-nunito-semibold text-beam-teal-700">
                        {user.isAdmin ? 'Total Revenue' : 'Balance'}
                      </p>
                      <p className="text-lg font-nunito-bold text-beam-teal-800">
                        ${user.isAdmin ? totalRevenue.toFixed(2) : (user.totalEarnings?.toFixed(2) || '0.00')}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-base font-nunito-semibold text-beam-charcoal-700 hover:text-beam-pink-600 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-nunito-semibold text-red-600 hover:text-red-700 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-beam-grey-200 pt-4 mt-4 space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-nunito-semibold text-beam-charcoal-700 hover:text-beam-pink-600 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-3 text-base font-nunito-semibold bg-gradient-beam text-white rounded-lg text-center shadow-beam"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start Earning
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 