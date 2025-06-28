import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Calendar, Users, MapPin, Clock, ArrowLeft, UserCheck, X, Edit } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../contexts/AuthContext';
import type { Event, Registration } from '../../types/api';

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async (eventId: string) => {
    try {
      setLoading(true);
      const eventData = await apiClient.getEvent(eventId);
      setEvent(eventData);
      
      // Check if user is registered for this event
      if (isAuthenticated && user) {
        const userRegistrations = await apiClient.getMyRegistrations();
        const eventRegistration = userRegistrations.find((reg: Registration) => reg.eventId === eventId);
        setRegistration(eventRegistration || null);
      }
    } catch (err) {
      setError('Failed to load event details');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchEvent(id);
    }
  }, [id, fetchEvent]);

  const handleRegister = async () => {
    if (!event || !isAuthenticated) return;

    try {
      setRegistering(true);
      const newRegistration = await apiClient.registerForEvent({ eventId: event.id });
      setRegistration(newRegistration);
      // Refresh event data to update registration count
      await fetchEvent(event.id);
    } catch (err) {
      console.error('Registration failed:', err);
      alert('Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!registration) return;

    if (!confirm('Are you sure you want to cancel your registration?')) {
      return;
    }

    try {
      setRegistering(true);
      await apiClient.cancelRegistration(registration.id);
      setRegistration(null);
      // Refresh event data to update registration count
      if (event) {
        await fetchEvent(event.id);
      }
    } catch (err) {
      console.error('Cancellation failed:', err);
      alert('Cancellation failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      // Same day
      return `${start.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })} from ${start.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })} to ${end.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    } else {
      // Different days
      return `${formatDate(startDate)} to ${formatDate(endDate)}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'conference':
        return 'bg-blue-100 text-blue-800';
      case 'workshop':
        return 'bg-purple-100 text-purple-800';
      case 'seminar':
        return 'bg-indigo-100 text-indigo-800';
      case 'networking':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canRegister = () => {
    if (!event || !isAuthenticated) return false;
    if (event.status !== 'published') return false;
    if (registration) return false; // Already registered
    
    const registrationCount = event._count?.registrations || 0;
    return registrationCount < event.maxAttendees;
  };

  const isEventFull = () => {
    if (!event) return false;
    const registrationCount = event._count?.registrations || 0;
    return registrationCount >= event.maxAttendees;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The event you are looking for does not exist.'}</p>
          <Link
            href="/events"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/events"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-500 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>

        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <Link
                    href={`/events/${event.id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Event
                  </Link>
                  <Link
                    href={`/events/${event.id}/landing-page`}
                    className="inline-flex items-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v1m0 0h6m-6 0V5a2 2 0 012-2h4a2 2 0 012 2v16a4 4 0 01-4 4H7z" />
                    </svg>
                    Customize Landing Page
                  </Link>
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="text-gray-900">{formatDateRange(event.startDate, event.endDate)}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-900">{event.location}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Users className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Attendance</p>
                    <p className="text-gray-900">
                      {event._count?.registrations || 0} / {event.maxAttendees} registered
                    </p>
                    {isEventFull() && (
                      <p className="text-red-600 text-sm font-medium">Event is full</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-gray-900">{formatDate(event.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Event</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            </div>

            {/* Registration Section */}
            {isAuthenticated && (
              <div className="border-t pt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Registration</h2>
                
                {registration ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-start">
                      <UserCheck className="w-6 h-6 text-green-600 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-green-900">You&apos;re registered!</h3>
                        <p className="text-green-700 mt-1">
                          Registration status: <span className="font-medium">{registration.status}</span>
                        </p>
                        <p className="text-green-700 text-sm mt-2">
                          Registered on {formatDate(registration.registeredAt)}
                        </p>
                        {registration.status === 'pending' && (
                          <p className="text-yellow-700 text-sm mt-2">
                            Your registration is pending approval.
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleCancelRegistration}
                        disabled={registering}
                        className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {registering ? 'Cancelling...' : 'Cancel Registration'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    {canRegister() ? (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Ready to join this event?
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Click the button below to register for this event.
                        </p>
                        <button
                          onClick={handleRegister}
                          disabled={registering}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserCheck className="w-5 h-5 mr-2" />
                          {registering ? 'Registering...' : 'Register for Event'}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Registration Not Available
                        </h3>
                        <p className="text-gray-600">
                          {event.status !== 'published' 
                            ? 'This event is not currently open for registration.'
                            : isEventFull()
                            ? 'This event is full and no longer accepting registrations.'
                            : 'Registration is not available at this time.'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <div className="border-t pt-8">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sign in to register
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You need to be signed in to register for events.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
