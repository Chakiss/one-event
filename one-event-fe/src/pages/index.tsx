import React from 'react';
import Link from 'next/link';
import { Calendar, Users, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/common/Logo';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Morphing Animated Background */}
      <div className="fixed inset-0 morphing-background"></div>
      
      {/* Enhanced Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-full blur-3xl floating-element opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-purple-400/15 rounded-full blur-3xl floating-element opacity-70" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-3xl floating-element opacity-50" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-10 right-1/3 w-48 h-48 bg-gradient-to-r from-yellow-400/15 to-orange-400/15 rounded-full blur-3xl floating-element opacity-40" style={{animationDelay: '6s'}}></div>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Enhanced Logo Container */}
            <div className="flex justify-center mb-8">
              <div className="liquid-glass-intense rounded-3xl p-8 floating-particles">
                <Logo 
                  size="lg"
                  className="drop-shadow-lg"
                />
              </div>
            </div>
            
            {/* Enhanced Main Title */}
            <div className="liquid-glass rounded-3xl p-16 mb-10 relative floating-particles">
              <div className="absolute top-6 right-6">
                <Sparkles className="h-8 w-8 text-red-500/70 animate-pulse" />
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-red-600 via-pink-600 to-red-700 bg-clip-text text-transparent animate-pulse">
                  OneEvent
                </span>
              </h1>
              
              <p className="text-2xl md:text-3xl text-gray-800 mb-8 max-w-5xl mx-auto leading-relaxed font-light">
                The ultimate platform for managing enterprise events with{' '}
                <span className="font-semibold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Liquid Glass Design
                </span>{' '}
                - beautiful, delightful, and instantly familiar.
              </p>
              
              <div className="text-lg text-gray-600 max-w-4xl mx-auto">
                Experience a more consistent interface across your apps and devices with our revolutionary liquid glass technology.
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="glass-button text-white px-12 py-6 rounded-3xl text-xl font-semibold group flex items-center justify-center glass-minimal-hover"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                  <Link
                    href="/events/create"
                    className="glass-secondary text-red-600 px-12 py-6 rounded-3xl text-xl font-semibold group flex items-center justify-center glass-minimal-hover"
                  >
                    Create Event
                    <Calendar className="ml-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="glass-button text-white px-12 py-6 rounded-3xl text-xl font-semibold group flex items-center justify-center glass-minimal-hover"
                  >
                    Experience Liquid Glass
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                  <Link
                    href="/auth/login"
                    className="glass-secondary text-red-600 px-12 py-6 rounded-3xl text-xl font-semibold group flex items-center justify-center glass-minimal-hover"
                  >
                    Sign In
                    <Sparkles className="ml-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div className="relative py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Section Header */}
          <div className="text-center mb-24">
            <div className="liquid-glass rounded-3xl p-12 mb-12 inline-block floating-particles">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Everything you need to manage events
              </h2>
              <p className="text-2xl text-gray-700 font-light">
                Powerful features designed for enterprise event management with{' '}
                <span className="font-semibold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  liquid glass elegance
                </span>
              </p>
            </div>
          </div>

          {/* Enhanced Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Event Management - Enhanced */}
            <div className="liquid-glass-intense rounded-3xl p-10 text-center group glass-minimal-hover floating-particles">
              <div className="relative">
                <div className="h-24 w-24 liquid-glass rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden liquid-glass-pulse glass-icon-minimal">
                  <Calendar className="h-12 w-12 text-red-600 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 via-pink-500/20 to-red-600/30 rounded-3xl opacity-70"></div>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Event Management</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Create, edit, and manage events with our intuitive liquid glass interface. 
                  Set dates, locations, and participant limits with unprecedented elegance and fluidity.
                </p>
              </div>
            </div>

            {/* User Registration - Enhanced */}
            <div className="liquid-glass-intense rounded-3xl p-10 text-center group glass-minimal-hover floating-particles">
              <div className="relative">
                <div className="h-24 w-24 liquid-glass rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden liquid-glass-pulse glass-icon-minimal" style={{animationDelay: '1s'}}>
                  <Users className="h-12 w-12 text-blue-600 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-blue-600/30 rounded-3xl opacity-70"></div>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-6">User Registration</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Advanced registration system with email verification, 
                  role-based access, and company information management through beautiful liquid glass interfaces.
                </p>
              </div>
            </div>

            {/* Enterprise Security - Enhanced */}
            <div className="liquid-glass-intense rounded-3xl p-10 text-center group glass-minimal-hover floating-particles">
              <div className="relative">
                <div className="h-24 w-24 liquid-glass rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden liquid-glass-pulse glass-icon-minimal" style={{animationDelay: '2s'}}>
                  <Shield className="h-12 w-12 text-green-600 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 via-emerald-500/20 to-green-600/30 rounded-3xl opacity-70"></div>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Enterprise Security</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Built with enterprise-grade security features including 
                  JWT authentication and role-based permissions, all wrapped in stunning liquid glass design.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      {!user && (
        <div className="relative py-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="liquid-glass-intense rounded-3xl p-20 relative overflow-hidden floating-particles">
              {/* Enhanced background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/3 via-pink-500/5 to-purple-500/3 opacity-80"></div>
              
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 relative z-10">
                Ready to experience the future?
              </h2>
              <p className="text-2xl md:text-3xl text-gray-700 mb-12 relative z-10 max-w-4xl mx-auto font-light">
                Join thousands of organizations using OneEvent with our revolutionary{' '}
                <span className="font-semibold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Liquid Glass Interface
                </span>{' '}
                - beautiful, delightful, and instantly familiar.
              </p>
              <Link
                href="/auth/register"
                className="glass-button text-white px-16 py-8 rounded-3xl text-2xl font-semibold group inline-flex items-center relative z-10"
              >
                Experience Liquid Glass
                <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Footer Decoration */}
      <div className="relative h-40">
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-red-500/60 via-pink-500/60 to-purple-500/60 animate-pulse"></div>
        <div className="absolute bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      </div>
    </div>
  );
}
