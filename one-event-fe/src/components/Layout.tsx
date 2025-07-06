'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { SimpleLogo } from './common/SimpleLogo';
import {
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Plus,
  BookOpen,
  Bell,
  Search,
} from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'กิจกรรม', href: '/events', icon: CalendarDays },
  { name: 'สร้างกิจกรรม', href: '/events/create', icon: Plus },
  { name: 'จัดการกิจกรรม', href: '/events/manage', icon: BookOpen },
  { name: 'การลงทะเบียนของฉัน', href: '/registrations', icon: BookOpen },
  { name: 'จัดการผู้ใช้', href: '/admin/users', icon: Users, adminOnly: true },
  { name: 'จัดการระบบ', href: '/admin/events', icon: Settings, adminOnly: true },
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Routes that don't require authentication
  const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/verify-email', '/events'];
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => 
    router.pathname === route || router.pathname.startsWith('/auth/')
  );

  // Check if current route is a registration page (should have minimal layout)
  const isRegistrationPage = router.pathname.includes('/register');
  
  // Check if current route is dashboard page (should not have sidebar)
  const isDashboardPage = router.pathname === '/dashboard';

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const filteredNavigation = navigation.filter((item) => {
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Minimal layout for registration pages (no navigation)
  if (isRegistrationPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // Simple layout for public routes or when user is not logged in
  if (isPublicRoute || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Simple Top Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <div className="relative">
                    <SimpleLogo 
                      size="sm"
                      className="mr-3 drop-shadow-sm"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">OneEvent</h1>
                  </div>
                </Link>
              </div>
              
              {!user && (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    สมัครสมาชิก
                  </Link>
                </div>
              )}

              {user && (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/dashboard"
                    className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  // Dashboard layout without sidebar
  if (isDashboardPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Main content without sidebar */}
        <div className="flex flex-col flex-1">
          {/* Top navigation */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
            <div className="flex h-16 items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
              <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                {/* Search bar */}
                <div className="flex flex-1 items-center">
                  <div className="relative max-w-md w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="ค้นหากิจกรรม..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Right side */}
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                  {user && (
                    <>
                      {/* Notifications */}
                      <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 block h-2 w-2 bg-red-500 rounded-full"></span>
                      </button>
                      
                      {/* User info */}
                      <div className="flex items-center gap-x-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                        {isAdmin && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Admin
                          </span>
                        )}
                      </div>
                      
                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        ออกจากระบบ
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Full dashboard layout for authenticated users

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-2xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="h-0 flex-1 overflow-y-auto pt-6 pb-4">
              {/* Mobile Logo */}
              <div className="flex flex-shrink-0 items-center px-6 mb-8">
                <div className="flex items-center">
                  <div className="relative">
                    <SimpleLogo 
                      size="sm"
                      className="mr-3 drop-shadow-sm"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">OneEvent</h1>
                    <p className="text-xs text-gray-500">Enterprise Platform</p>
                  </div>
                </div>
              </div>
              <nav className="mt-5 space-y-1 px-3">
                {filteredNavigation.map((item) => {
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-red-50 text-red-700 border-l-4 border-red-500'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200 shadow-lg">
          <div className="flex flex-1 flex-col pt-6 pb-4 overflow-y-auto">
            {/* Desktop Logo */}
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="flex items-center">
                <div className="relative">
                  <SimpleLogo 
                    size="sm"
                    className="mr-3 drop-shadow-sm"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">OneEvent</h1>
                  <p className="text-xs text-gray-500">Enterprise Platform</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="mt-5 flex-1 px-3 space-y-2">
              <div className="pb-4">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  เมนูหลัก
                </h3>
                {filteredNavigation.slice(0, 4).map((item) => {
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-red-50 text-red-700 border-l-4 border-red-500 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              
              {isAdmin && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    การจัดการ
                  </h3>
                  {filteredNavigation.slice(4).map((item) => {
                    const isActive = router.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gray-100 text-gray-700 border-l-4 border-gray-500 shadow-sm'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 h-5 w-5 ${
                            isActive ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 lg:hidden" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              {/* Search bar */}
              <div className="flex flex-1 items-center">
                <div className="relative max-w-md w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="ค้นหากิจกรรม..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Right side */}
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {user && (
                  <>
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-1 right-1 block h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>
                    
                    {/* User info */}
                    <div className="flex items-center gap-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>
                      {isAdmin && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Admin
                        </span>
                      )}
                    </div>
                    
                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      ออกจากระบบ
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gray-50">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[calc(100vh-12rem)]">
                <div className="p-6 lg:p-8">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
