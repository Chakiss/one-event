import React from 'react';
import Link from 'next/link';
import { Calendar, Users, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SimpleLogo } from '../components/common/SimpleLogo';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-red-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <SimpleLogo 
                  size="lg"
                  className="drop-shadow-lg"
                />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                OneEvent
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              The ultimate platform for managing enterprise events, conferences, and corporate gatherings. 
              Create, manage, and track your events with ease.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/events/create"
                    className="border border-red-600 text-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-50 transition-colors"
                  >
                    Create Event
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/auth/login"
                    className="border border-red-600 text-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-50 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to manage events
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features designed for enterprise event management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Event Management</h3>
              <p className="text-gray-600">
                Create, edit, and manage events with our intuitive interface. 
                Set dates, locations, and participant limits easily.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">User Registration</h3>
              <p className="text-gray-600">
                Advanced registration system with email verification, 
                role-based access, and company information management.
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Enterprise Security</h3>
              <p className="text-gray-600">
                Built with enterprise-grade security features including 
                JWT authentication and role-based permissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="py-20 bg-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-xl text-red-200 mb-8">
              Join thousands of organizations using OneEvent for their corporate events.
            </p>
            <Link
              href="/auth/register"
              className="bg-white text-red-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
            >
              Create Your Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
