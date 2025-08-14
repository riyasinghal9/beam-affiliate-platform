import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bars3Icon, 
  XMarkIcon, 
  WalletIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const UserDropdown: React.FC<{ user: any; isOpen: boolean; onClose: () => void; onLogout: () => void }> = ({ user, isOpen, onClose, onLogout }) => {
  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: '4rem',
        right: '1rem',
        width: '14rem',
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e5e7eb',
        zIndex: 9999999,
        padding: '0.5rem 0'
      }}
    >
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
          {user.firstName} {user.lastName}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {user.email}
        </div>
      </div>
      <Link
        to="/profile"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          fontSize: '0.875rem',
          color: '#374151',
          textDecoration: 'none',
          transition: 'background-color 0.15s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        onClick={onClose}
      >
        <CogIcon style={{ width: '1rem', height: '1rem', marginRight: '0.75rem', color: '#9ca3af' }} />
        Profile Settings
      </Link>
      <button
        onClick={onLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '0.75rem 1rem',
          fontSize: '0.875rem',
          color: '#dc2626',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.15s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        Sign Out
      </button>
    </div>,
    document.body
  );
};

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY && currentScrollY > 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      // Always show navbar at the top of the page
      if (currentScrollY <= 50) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Home', href: '/', current: false },
    { name: 'Products', href: '/products', current: false },
    { name: 'Dashboard', href: '/dashboard', current: false },
    { name: 'Training', href: '/training', current: false },
    { name: 'Analytics', href: '/analytics', current: false },
    { name: 'Transactions', href: '/transactions', current: false },
  ];

  const adminNavigation = [
    { name: 'Admin Payments', href: '/admin/payments', current: false },
  ];

  return (
    <nav className={`bg-white/95 backdrop-blur-sm border-b border-gray-200/50 fixed top-0 left-0 right-0 z-[9998] transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center group">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
                  <span className="text-white font-bold text-sm sm:text-lg">B</span>
                </div>
                
                <span className="ml-4 sm:ml-6 text-lg sm:text-md lg:text-base font-medium bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text whitespace-nowrap">
                  Beam Affiliate
                </span>
              </Link>
            </div>
            
                                       {/* Desktop Navigation */}
                           <div className="hidden sm:ml-4 lg:ml-6 sm:flex sm:space-x-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50"
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <>
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-red-600 hover:text-red-700 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-50"
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>

                                   {/* Right side - User menu */}
                         <div className="hidden sm:flex sm:items-center sm:space-x-2 lg:space-x-4">
            {user ? (
              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                {/* Balance Display */}
                <div className="flex items-center space-x-2 px-2 sm:px-3 lg:px-4 py-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <WalletIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">
                    ${user.balance.toFixed(2)}
                  </span>
                </div>
                
                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user.firstName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden md:block font-medium">{user.firstName}</span>
                  </button>
                </div>
                
                {/* Dropdown Menu - Completely separate */}
                {isUserDropdownOpen && (
                  <UserDropdown
                    user={user}
                    isOpen={isUserDropdownOpen}
                    onClose={() => setIsUserDropdownOpen(false)}
                    onLogout={handleLogout}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-2 sm:px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 sm:px-4 lg:px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Start Earning
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
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
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center px-3 py-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg mb-3">
                    <WalletIcon className="h-5 w-5 mr-3 text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-green-700">Balance</p>
                      <p className="text-lg font-bold text-green-800">${user.balance.toFixed(2)}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-center shadow-lg"
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