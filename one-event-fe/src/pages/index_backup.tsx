import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, MapPin, Clock, ChevronRight, Plus, TrendingUp, Shield, Zap } from 'lucide-react';
import { apiClient } from '../lib/api-client';
import { useAuth } from '../contexts/AuthContext';
import type { Event } from '../types/api';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await apiClient.getEvents();
        // Show only upcoming events on homepage
        const upcomingEvents = eventsData.filter(event => 
          new Date(event.startDate) > new Date()
        ).slice(0, 6); // Show max 6 events
        setEvents(upcomingEvents);
      } catch (err) {
        setError('Failed to load events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-t-xl"></div>
        
        <div className="relative px-6 py-12 lg:py-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-6">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
              Enterprise Event Management Platform
            </div>
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              ยินดีต้อนรับสู่{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                OneEvent
              </span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              แพลตฟอร์มการจัดการงานอีเวนต์แบบครบวงจร เหมาะสำหรับองค์กรขนาดใหญ่ 
              ด้วยระบบที่มั่นคง ปลอดภัย และใช้งานง่าย
            </p>
            {!isAuthenticated && (
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  เริ่มต้นใช้งาน
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-indigo-700 bg-white border-2 border-indigo-200 hover:border-indigo-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/events/create"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  สร้างกิจกรรมใหม่
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-indigo-700 bg-white border-2 border-indigo-200 hover:border-indigo-300 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  ดูกิจกรรมทั้งหมด
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
                <div className="rounded-md shadow">
                  <Link
                    href="/events"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                  >
                    Browse All Events
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
          <p className="mt-4 text-lg text-gray-600">
            Don&apos;t miss out on these exciting upcoming events
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No upcoming events found.</p>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>
                        {event.registrations?.length || 0} / {event.maxAttendees} registered
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.status === 'published' 
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {event.status}
                    </span>
                    <Link
                      href={`/events/${event.id}`}
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/events"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
            >
              View All Events
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose OneEvent?</h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Calendar className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Event Discovery</h3>
              <p className="text-gray-600">
                Find events that match your interests with our intuitive search and filtering system.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Users className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect with People</h3>
              <p className="text-gray-600">
                Meet like-minded individuals and build meaningful connections at every event.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Clock className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Stay informed with instant notifications about event changes and reminders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
