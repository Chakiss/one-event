import React from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import EventLandingPage from '../../components/events/EventLandingPage';
import type { Event } from '../../types/api';

interface EventLandingPageProps {
  event: Event;
  error?: string;
}

const EventLandingPageBySlug: React.FC<EventLandingPageProps> = ({ event, error }) => {
  const router = useRouter();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return <EventLandingPage event={event} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params!;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/events/slug/${slug}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          props: {
            error: 'Event not found or not published',
          },
        };
      }
      throw new Error('Failed to fetch event');
    }

    const event = await response.json();

    return {
      props: {
        event,
      },
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    return {
      props: {
        error: 'Failed to load event',
      },
    };
  }
};

export default EventLandingPageBySlug;
