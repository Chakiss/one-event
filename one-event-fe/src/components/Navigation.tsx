import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { SimpleLogo } from './common/SimpleLogo';

const Navigation = () => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Safety check for router.pathname
  const currentPath = router.pathname || '';

  const handleLogout = async () => {
    console.log('Logout button clicked'); // Debug log
    await logout();
    router.push('/');
    setIsMenuOpen(false);
  };

  // Public navigation items (shown when not logged in)
  const publicNavItems = [
    { label: 'Home', href: '/', icon: '🏠' },
    { label: 'Events', href: '/events', icon: '📅' },
    { label: 'About', href: '/about', icon: 'ℹ️' },
  ];

  // Authenticated navigation items (shown when logged in)
  const authNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'My Events', href: '/events/manage', icon: '📝' },
    { label: 'Create Event', href: '/events/create', icon: '➕' },
    { label: 'Profile', href: '/profile', icon: '👤' },
  ];

  if (loading) {
    return (
      <nav className="glass-navbar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 glass rounded-lg animate-pulse"></div>
              <div className="ml-3 h-6 w-24 glass rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="glass-navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Enhanced Logo */}
          <div className="flex items-center">
            <Link href={user ? '/dashboard' : '/'} className="flex items-center group">
              <div className="glass-logo-container">
                <SimpleLogo 
                  size="sm"
                  className="drop-shadow-sm"
                />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-red-600 group-hover:to-red-700 transition-all duration-300">
                OneEvent
              </span>
            </Link>
          </div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                {/* Authenticated Navigation with Glass Effect */}
                {authNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`glass-nav-item px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 ${
                      currentPath === item.href
                        ? 'active'
                        : 'text-gray-700 hover:text-red-600'
                    }`}
                  >
                    <span className="mr-2 text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                
                {/* Enhanced User Menu */}
                <div className="relative ml-4">
                  <button
                    onClick={() => {
                      console.log('User menu toggle clicked', !isMenuOpen); // Debug log
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className="glass-nav-item flex items-center px-4 py-2 rounded-2xl text-sm font-medium text-gray-700 hover:text-red-600 group"
                  >
                    <div className="glass-user-avatar h-8 w-8 rounded-full flex items-center justify-center mr-3">
                      <span className="text-red-600 font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="max-w-32 truncate">{user?.name || 'User'}</span>
                    <svg className="ml-2 h-4 w-4 transform transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Enhanced Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 glass-dropdown z-50">
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-white/20">
                          <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
                          <p className="text-xs text-gray-600">{user?.email || ''}</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white mt-1">
                            {user.role}
                          </span>
                        </div>
                        
                        <Link
                          href="/profile"
                          className="glass-dropdown-item flex items-center px-4 py-3 text-sm text-gray-700 hover:text-red-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span className="mr-3 text-lg">👤</span>
                          Profile Settings
                        </Link>
                        
                        <Link
                          href="/settings"
                          className="glass-dropdown-item flex items-center px-4 py-3 text-sm text-gray-700 hover:text-red-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span className="mr-3 text-lg">⚙️</span>
                          Account Settings
                        </Link>
                        
                        <div className="border-t border-white/20 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="glass-dropdown-item flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            <span className="mr-3 text-lg">🚪</span>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Public Navigation with Glass Effect */}
                {publicNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`glass-nav-item px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 ${
                      currentPath === item.href
                        ? 'active'
                        : 'text-gray-700 hover:text-red-600'
                    }`}
                  >
                    <span className="mr-2 text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                
                {/* Enhanced Auth Buttons */}
                <div className="flex items-center space-x-3 ml-6">
                  <Link
                    href="/auth/login"
                    className="glass-nav-item text-gray-700 hover:text-red-600 px-4 py-2 rounded-2xl text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="glass-button-nav text-white px-6 py-2 rounded-2xl text-sm font-bold shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Enhanced Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => {
                console.log('Mobile menu toggle clicked', !isMenuOpen); // Debug log
                setIsMenuOpen(!isMenuOpen);
              }}
              className="glass-nav-item p-2 rounded-xl text-gray-600 hover:text-red-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-mobile-menu border-t border-white/30">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  {/* Enhanced User Info */}
                  <div className="glass px-4 py-4 rounded-2xl mb-4 mx-2">
                    <div className="flex items-center">
                      <div className="glass-user-avatar h-12 w-12 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold text-lg">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-600">{user?.email || ''}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white mt-1">
                          {user?.role || 'User'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Authenticated Mobile Navigation */}
                  {authNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`glass-nav-item mx-2 block px-4 py-3 rounded-2xl text-base font-medium transition-all duration-300 ${
                        currentPath === item.href
                          ? 'active'
                          : 'text-gray-700 hover:text-red-600'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}

                  <div className="border-t border-white/30 mt-4 pt-4">
                    <button
                      onClick={handleLogout}
                      className="glass-nav-item mx-2 flex items-center w-full text-left px-4 py-3 rounded-2xl text-base font-bold text-red-600 hover:text-red-700"
                    >
                      <span className="mr-3 text-lg">🚪</span>
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Public Mobile Navigation */}
                  {publicNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`glass-nav-item mx-2 block px-4 py-3 rounded-2xl text-base font-medium transition-all duration-300 ${
                        currentPath === item.href
                          ? 'active'
                          : 'text-gray-700 hover:text-red-600'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}

                  <div className="border-t border-white/30 mt-4 pt-4 space-y-2">
                    <Link
                      href="/auth/login"
                      className="glass-nav-item mx-2 block px-4 py-3 rounded-2xl text-base font-medium text-gray-700 hover:text-red-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="glass-button-nav mx-2 block px-4 py-3 rounded-2xl text-base font-bold text-white text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
