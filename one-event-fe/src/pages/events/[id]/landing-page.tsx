import React, { useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import EventLandingPageBuilder from '../../../components/events/EventLandingPageBuilder';
import { useAuth } from '../../../contexts/AuthContext';

interface LandingPageBuilderPageProps {
  eventId: string;
  initialData?: {
    landingPageConfig?: Record<string, unknown>;
    landingPageHtml?: string;
    customCss?: string;
    customJs?: string;
    slug?: string;
  };
}

const LandingPageBuilderPage: React.FC<LandingPageBuilderPageProps> = ({ 
  eventId, 
  initialData 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Landing Page Builder - OneEvent</title>
        <meta name="description" content="Customize your event landing page" />
      </Head>
      
      <EventLandingPageBuilder
        eventId={eventId}
        initialConfig={initialData?.landingPageConfig}
        initialHtml={initialData?.landingPageHtml}
        initialCss={initialData?.customCss}
        initialJs={initialData?.customJs}
        initialSlug={initialData?.slug}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  try {
    // Fetch existing landing page config
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-c78d7.up.railway.app'}/events/${id}/landing-page`,
      {
        headers: {
          'Authorization': `Bearer ${context.req.cookies.token || ''}`,
        },
      }
    );

    let initialData = {};
    if (response.ok) {
      initialData = await response.json();
    }

    return {
      props: {
        eventId: id as string,
        initialData,
      },
    };
  } catch (error) {
    console.error('Error fetching landing page data:', error);
    return {
      props: {
        eventId: id as string,
        initialData: {},
      },
    };
  }
};

export default LandingPageBuilderPage;
