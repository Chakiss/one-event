import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import type { Event } from '@/types/api';
import EventAnalyticsDashboard from '@/components/EventAnalyticsDashboard';
import RegistrationFormBuilder from '@/components/RegistrationFormBuilder';

const EventManagementPage = () => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview, analytics, registration-form, settings

  const loadEvent = useCallback(async () => {
    try {
      setIsLoadingEvent(true);
      const response = await apiClient.getEvent(id as string);
      setEvent(response);
    } catch (error) {
      console.error('Failed to load event:', error);
      router.push('/dashboard');
    } finally {
      setIsLoadingEvent(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (id && typeof id === 'string') {
      loadEvent();
    }
  }, [user, loading, router, id, loadEvent]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (loading || isLoadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user || !event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center mr-4">
                <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L16 7M9 7h6" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-gray-900">OneEvent</span>
              </Link>
              <nav className="text-sm text-gray-500">
                <span>Dashboard</span>
                <span className="mx-2">/</span>
                <span>จัดการกิจกรรม</span>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{event.title}</span>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium text-gray-900">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Event Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {event.status === 'published' ? 'เผยแพร่แล้ว' : 'ร่าง'}
                </span>
                <span>{new Date(event.startDate).toLocaleDateString('th-TH')}</span>
                <span>{event.location}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/events/${event.id}/edit`}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                แก้ไขกิจกรรม
              </Link>
              {event.status === 'published' && (
                <button
                  onClick={() => window.open(`/events/${event.id}/register`, '_blank')}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  ดูหน้าลงทะเบียน
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSubTab === 'overview'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ภาพรวม
            </button>
            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSubTab === 'analytics'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveSubTab('registration-form')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSubTab === 'registration-form'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ฟอร์มลงทะเบียน
            </button>
            <button
              onClick={() => setActiveSubTab('email-campaign')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeSubTab === 'email-campaign'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Email Campaign
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSubTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Title</dt>
                  <dd className="text-sm text-gray-900">{event.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">{event.status}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                  <dd className="text-sm text-gray-900">{new Date(event.startDate).toLocaleString('th-TH')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">End Date</dt>
                  <dd className="text-sm text-gray-900">{new Date(event.endDate).toLocaleString('th-TH')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="text-sm text-gray-900">{event.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Max Attendees</dt>
                  <dd className="text-sm text-gray-900">{event.maxAttendees}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="text-sm text-gray-900 mt-1">{event.description}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeSubTab === 'analytics' && (
          <EventAnalyticsDashboard eventId={event.id} />
        )}

        {activeSubTab === 'registration-form' && (
          <RegistrationFormBuilder eventId={event.id} />
        )}

        {activeSubTab === 'email-campaign' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Campaign</h2>
            <p className="text-gray-600 mb-4">Send email invitations to your target audience.</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Coming Soon:</strong> Email campaign functionality will be available in the next update.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EventManagementPage;
