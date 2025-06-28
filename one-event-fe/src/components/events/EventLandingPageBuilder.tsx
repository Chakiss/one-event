import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  EyeIcon, 
  PaintBrushIcon, 
  CodeBracketIcon, 
  Cog6ToothIcon,
  PhotoIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../lib/api-client';

interface LandingPageConfig {
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
  };
  hero?: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    backgroundVideo?: string;
    ctaText?: string;
    ctaColor?: string;
  };
  sections?: {
    showAbout?: boolean;
    showAgenda?: boolean;
    showSpeakers?: boolean;
    showLocation?: boolean;
    showPricing?: boolean;
    showTestimonials?: boolean;
    customSections?: Array<{
      title: string;
      content: string;
      type: 'text' | 'image' | 'video' | 'html';
      order: number;
    }>;
  };
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
}

interface EventLandingPageBuilderProps {
  eventId: string;
  initialConfig?: LandingPageConfig;
  initialHtml?: string;
  initialCss?: string;
  initialJs?: string;
  initialSlug?: string;
}

const EventLandingPageBuilder: React.FC<EventLandingPageBuilderProps> = ({
  eventId,
  initialConfig = {},
  initialHtml = '',
  initialCss = '',
  initialJs = '',
  initialSlug = ''
}) => {
  
  // Create default config with all required properties
  const defaultConfig: LandingPageConfig = {
    theme: {
      primaryColor: '#ef4444',
      secondaryColor: '#f97316',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Inter, sans-serif'
    },
    hero: {
      title: '',
      subtitle: '',
      ctaText: 'Register Now',
      ctaColor: '#ef4444'
    },
    sections: {
      showAbout: true,
      showAgenda: true,
      showSpeakers: true,
      showLocation: true,
      showPricing: true,
      showTestimonials: true,
      customSections: []
    },
    contact: {
      email: '',
      phone: '',
      website: '',
      socialMedia: {}
    },
    seo: {
      title: '',
      description: '',
      keywords: [],
      ogImage: ''
    }
  };

  // Merge initial config with defaults
  const mergedConfig = { ...defaultConfig, ...initialConfig };
  
  const [config, setConfig] = useState<LandingPageConfig>(mergedConfig);
  const [customHtml, setCustomHtml] = useState(initialHtml);
  const [customCss, setCustomCss] = useState(initialCss);
  const [customJs, setCustomJs] = useState(initialJs);
  const [slug, setSlug] = useState(initialSlug);
  const [isLoading, setSaving] = useState(false);

  const tabs = [
    { name: 'Design', icon: PaintBrushIcon },
    { name: 'Content', icon: PhotoIcon },
    { name: 'Settings', icon: Cog6ToothIcon },
    { name: 'Code', icon: CodeBracketIcon },
  ];

  const updateConfig = (path: string, value: unknown) => {
    setConfig(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current: Record<string, unknown> = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) current[key] = {};
        current = current[key] as Record<string, unknown>;
      }
      
      current[keys[keys.length - 1]] = value;
      return updated as LandingPageConfig;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.updateEventLandingPage(eventId, {
        landingPageConfig: JSON.stringify(config),
        landingPageHtml: customHtml,
        customCss,
        customJs,
        slug: slug || undefined,
      });
      
      toast.success('Landing page saved successfully!');
    } catch (error) {
      console.error('Failed to save landing page:', error);
      toast.error('Failed to save landing page');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    console.log('Preview button clicked!');
    
    try {
      // Show immediate feedback
      toast('Preparing preview...');
      setSaving(true);
      
      console.log('Starting preview with config:', { eventId, slug, config });
      
      // Determine which slug to use for preview
      const previewSlug = slug || `preview-${eventId}`;
      
      // Save the current configuration first
      await apiClient.updateEventLandingPage(eventId, {
        landingPageConfig: JSON.stringify(config),
        landingPageHtml: customHtml,
        customCss,
        customJs,
        slug: previewSlug,
      });
      
      console.log('Configuration saved successfully, opening preview with slug:', previewSlug);
      
      // Open the landing page in a new tab
      const newWindow = window.open(`/landing/${previewSlug}`, '_blank', 'noopener,noreferrer');
      
      if (newWindow) {
        toast.success('Preview opened in new tab!');
      } else {
        // Fallback if popup was blocked
        toast('Popup blocked. Opening in current tab...', {
          duration: 3000
        });
        // Open in current tab as fallback
        setTimeout(() => {
          window.open(`/landing/${previewSlug}`, '_self');
        }, 1000);
      }
      
    } catch (error) {
      console.error('Failed to generate preview:', error);
      toast.error('Failed to generate preview: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Landing Page Builder
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePreview}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-8">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ${
                    selected
                      ? 'bg-white shadow'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            {/* Design Tab */}
            <Tab.Panel className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Theme Settings</h3>
                
                {/* Color Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <input
                      type="color"
                      value={config.theme?.primaryColor || '#ef4444'}
                      onChange={(e) => updateConfig('theme.primaryColor', e.target.value)}
                      className="h-10 w-full rounded border-gray-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <input
                      type="color"
                      value={config.theme?.secondaryColor || '#6b7280'}
                      onChange={(e) => updateConfig('theme.secondaryColor', e.target.value)}
                      className="h-10 w-full rounded border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={config.theme?.backgroundColor || '#ffffff'}
                      onChange={(e) => updateConfig('theme.backgroundColor', e.target.value)}
                      className="h-10 w-full rounded border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={config.theme?.textColor || '#111827'}
                      onChange={(e) => updateConfig('theme.textColor', e.target.value)}
                      className="h-10 w-full rounded border-gray-300"
                    />
                  </div>
                </div>

                {/* Font Family */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <select
                    value={config.theme?.fontFamily || 'Inter'}
                    onChange={(e) => updateConfig('theme.fontFamily', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Roboto">Roboto</option>
                  </select>
                </div>
              </div>
            </Tab.Panel>

            {/* Content Tab */}
            <Tab.Panel className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hero Section</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      value={config.hero?.title || ''}
                      onChange={(e) => updateConfig('hero.title', e.target.value)}
                      placeholder="Override event title..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Subtitle
                    </label>
                    <textarea
                      value={config.hero?.subtitle || ''}
                      onChange={(e) => updateConfig('hero.subtitle', e.target.value)}
                      placeholder="Compelling subtitle..."
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Image URL
                    </label>
                    <input
                      type="url"
                      value={config.hero?.backgroundImage || ''}
                      onChange={(e) => updateConfig('hero.backgroundImage', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call to Action Text
                    </label>
                    <input
                      type="text"
                      value={config.hero?.ctaText || 'Register Now'}
                      onChange={(e) => updateConfig('hero.ctaText', e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sections Visibility */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Page Sections</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: 'showAbout', label: 'About Event' },
                    { key: 'showAgenda', label: 'Agenda' },
                    { key: 'showSpeakers', label: 'Speakers' },
                    { key: 'showLocation', label: 'Location' },
                    { key: 'showPricing', label: 'Pricing' },
                    { key: 'showTestimonials', label: 'Testimonials' },
                  ].map((section) => (
                    <label key={section.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          section.key === 'customSections' 
                            ? Array.isArray(config.sections?.customSections) && config.sections.customSections.length > 0
                            : config.sections?.[section.key as keyof Omit<typeof config.sections, 'customSections'>] ?? true
                        }
                        onChange={(e) => updateConfig(`sections.${section.key}`, e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{section.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Tab.Panel>

            {/* Settings Tab */}
            <Tab.Panel className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">URL Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom URL Slug
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      /events/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="my-awesome-event"
                      className="flex-1 rounded-none rounded-r-md border-gray-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty to use event ID. Only letters, numbers, and hyphens allowed.
                  </p>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={config.seo?.title || ''}
                      onChange={(e) => updateConfig('seo.title', e.target.value)}
                      placeholder="Custom page title for SEO"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={config.seo?.description || ''}
                      onChange={(e) => updateConfig('seo.description', e.target.value)}
                      placeholder="Brief description for search engines"
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Open Graph Image
                    </label>
                    <input
                      type="url"
                      value={config.seo?.ogImage || ''}
                      onChange={(e) => updateConfig('seo.ogImage', e.target.value)}
                      placeholder="https://example.com/social-image.jpg"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </Tab.Panel>

            {/* Code Tab */}
            <Tab.Panel className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Custom HTML</h3>
                <textarea
                  value={customHtml}
                  onChange={(e) => setCustomHtml(e.target.value)}
                  placeholder="Add custom HTML sections..."
                  rows={10}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 font-mono text-sm"
                />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Custom CSS</h3>
                <textarea
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  placeholder="Add custom CSS styles..."
                  rows={10}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 font-mono text-sm"
                />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Custom JavaScript</h3>
                <textarea
                  value={customJs}
                  onChange={(e) => setCustomJs(e.target.value)}
                  placeholder="Add custom JavaScript..."
                  rows={10}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 font-mono text-sm"
                />
                <p className="mt-2 text-sm text-gray-500">
                  ⚠️ Custom JavaScript will be executed on the page. Use with caution.
                </p>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default EventLandingPageBuilder;
