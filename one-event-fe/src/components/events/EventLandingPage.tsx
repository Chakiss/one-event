import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { Event } from '../../types/api';

interface EventLandingPageProps {
  event: Event;
}

const EventLandingPage: React.FC<EventLandingPageProps> = ({ event }) => {
  // Parse the JSON config string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsedConfig: any = {};
  try {
    parsedConfig = event.landingPageConfig ? JSON.parse(event.landingPageConfig) : {};
  } catch (error) {
    console.error('Failed to parse landing page config:', error);
    parsedConfig = {};
  }
  
  const theme = parsedConfig.theme || {};
  const hero = parsedConfig.hero || {};
  const sections = parsedConfig.sections || {};
  const contact = parsedConfig.contact || {};
  const seo = parsedConfig.seo || {};

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Custom styles from config
  const customStyle: React.CSSProperties = {
    '--primary-color': theme.primaryColor || '#ef4444',
    '--secondary-color': theme.secondaryColor || '#6b7280',
    '--background-color': theme.backgroundColor || '#ffffff',
    '--text-color': theme.textColor || '#111827',
    fontFamily: theme.fontFamily || 'Inter, sans-serif',
  } as React.CSSProperties;

  const pageTitle = seo.title || event.title;
  const pageDescription = seo.description || event.description;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={seo.keywords?.join(', ') || ''} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="event" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={seo.ogImage || event.imageUrl || '/logo.png'} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={seo.ogImage || event.imageUrl || '/logo.png'} />

        {/* Custom CSS */}
        {event.customCss && (
          <style dangerouslySetInnerHTML={{ __html: event.customCss }} />
        )}
      </Head>

      <div style={customStyle} className="min-h-screen">
        {/* Hero Section */}
        <section 
          className="relative bg-cover bg-center"
          style={{
            backgroundImage: hero.backgroundImage ? `url(${hero.backgroundImage})` : 'none',
            backgroundColor: theme.backgroundColor || '#ffffff',
          }}
        >
          {hero.backgroundImage && (
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          )}
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              {/* Event Image */}
              {event.imageUrl && !hero.backgroundImage && (
                <div className="flex justify-center mb-8">
                  <div className="relative w-48 h-48">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover rounded-2xl shadow-lg"
                    />
                  </div>
                </div>
              )}

              <h1 
                className="text-4xl md:text-6xl font-bold mb-6"
                style={{ 
                  color: hero.backgroundImage ? '#ffffff' : (theme.textColor || '#111827') 
                }}
              >
                {hero.title || event.title}
              </h1>
              
              {hero.subtitle && (
                <p 
                  className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
                  style={{ 
                    color: hero.backgroundImage ? '#e5e7eb' : (theme.secondaryColor || '#6b7280') 
                  }}
                >
                  {hero.subtitle}
                </p>
              )}

              {/* CTA Button */}
              <button
                style={{
                  backgroundColor: hero.ctaColor || theme.primaryColor || '#ef4444',
                  color: '#ffffff',
                }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:opacity-90 transition-opacity"
                onClick={() => {
                  // Scroll to registration form or open registration modal
                  document.getElementById('registration')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
              >
                {hero.ctaText || 'Register Now'}
              </button>
            </div>
          </div>
        </section>

        {/* Event Details */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Date */}
              <div className="text-center">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-4" style={{ color: theme.primaryColor }} />
                  <h3 className="font-semibold text-gray-900 mb-2">Date & Time</h3>
                  <p className="text-gray-600">{formatDate(event.startDate)}</p>
                  {event.endDate !== event.startDate && (
                    <p className="text-gray-600">to {formatDate(event.endDate)}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="text-center">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <MapPinIcon className="h-8 w-8 mx-auto mb-4" style={{ color: theme.primaryColor }} />
                  <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-600">{event.location}</p>
                  {event.address && (
                    <p className="text-sm text-gray-500 mt-1">{event.address}</p>
                  )}
                </div>
              </div>

              {/* Capacity */}
              <div className="text-center">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <UsersIcon className="h-8 w-8 mx-auto mb-4" style={{ color: theme.primaryColor }} />
                  <h3 className="font-semibold text-gray-900 mb-2">Capacity</h3>
                  <p className="text-gray-600">{event.maxAttendees} attendees</p>
                </div>
              </div>

              {/* Price */}
              <div className="text-center">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <ClockIcon className="h-8 w-8 mx-auto mb-4" style={{ color: theme.primaryColor }} />
                  <h3 className="font-semibold text-gray-900 mb-2">Price</h3>
                  <p className="text-gray-600">
                    {parseFloat(event.price) === 0 ? 'Free' : `$${event.price}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        {(sections.showAbout !== false) && (
          <section className="py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 
                  className="text-3xl font-bold mb-4"
                  style={{ color: theme.textColor || '#111827' }}
                >
                  About This Event
                </h2>
              </div>
              <div 
                className="prose prose-lg mx-auto"
                style={{ color: theme.textColor || '#111827' }}
              >
                <p>{event.description}</p>
              </div>
            </div>
          </section>
        )}

        {/* Custom HTML Sections */}
        {event.landingPageHtml && (
          <section 
            className="py-16"
            dangerouslySetInnerHTML={{ __html: event.landingPageHtml }}
          />
        )}

        {/* Registration Section */}
        <section id="registration" className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 
              className="text-3xl font-bold mb-8"
              style={{ color: theme.textColor || '#111827' }}
            >
              Ready to Join Us?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Don&apos;t miss out on this amazing event. Register now to secure your spot!
            </p>
            <button
              style={{
                backgroundColor: theme.primaryColor || '#ef4444',
                color: '#ffffff',
              }}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:opacity-90 transition-opacity"
              onClick={() => {
                // Redirect to registration page
                window.location.href = `/events/${event.id}/register`;
              }}
            >
              Register Now
            </button>
          </div>
        </section>

        {/* Contact/Organizer Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 
              className="text-3xl font-bold mb-8"
              style={{ color: theme.textColor || '#111827' }}
            >
              Event Organizer
            </h2>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {event.organizer?.name || 'Event Organizer'}
              </h3>
              <p className="text-gray-600 mb-4">{contact.email || event.organizer?.email || ''}</p>
              
              {/* Social Media Links */}
              {contact.socialMedia && (
                <div className="flex justify-center space-x-4">
                  {contact.socialMedia.facebook && (
                    <a 
                      href={contact.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Facebook
                    </a>
                  )}
                  {contact.socialMedia.twitter && (
                    <a 
                      href={contact.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-600"
                    >
                      Twitter
                    </a>
                  )}
                  {contact.socialMedia.linkedin && (
                    <a 
                      href={contact.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-900"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Custom JavaScript */}
        {event.customJs && (
          <script dangerouslySetInnerHTML={{ __html: event.customJs }} />
        )}
      </div>
    </>
  );
};

export default EventLandingPage;
