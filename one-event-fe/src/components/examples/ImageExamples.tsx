import React from 'react';
import { EnhancedImage, UserAvatar, EventImage, Logo } from '../common/ImageComponents';

const ImageExamples: React.FC = () => {
  // ตัวอย่างข้อมูล
  const sampleUser = {
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  };

  const sampleEvent = {
    id: '1',
    title: 'Tech Conference 2025',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop'
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      
      {/* Logo Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-6">1. Logo Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Small Logo</h3>
            <div className="flex justify-center">
              <Logo size="sm" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Medium Logo</h3>
            <div className="flex justify-center">
              <Logo size="md" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Large Logo</h3>
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* User Avatar Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-6">2. User Avatars</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
            <div key={size} className="text-center">
              <h3 className="text-sm font-semibold mb-4 capitalize">{size}</h3>
              <div className="flex justify-center mb-2">
                <UserAvatar user={sampleUser} size={size} />
              </div>
              <div className="flex justify-center">
                <UserAvatar user={{ name: 'Jane Smith' }} size={size} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Image Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-6">3. Enhanced Images</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Fixed Size Image */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Fixed Size Image</h3>
            <EnhancedImage
              src="https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=300&h=200&fit=crop"
              alt="Sample image"
              width={300}
              height={200}
              className="rounded-lg shadow-lg"
            />
          </div>

          {/* Fill Container Image */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Fill Container Image</h3>
            <div className="relative h-48 w-full">
              <EnhancedImage
                src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop"
                alt="Sample fill image"
                fill
                className="object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Event Image Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-6">4. Event Images</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EventImage event={sampleEvent} />
          <EventImage event={{ id: '2', title: 'Workshop', image: undefined }} />
        </div>
      </section>

      {/* Background Image Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-6">5. Background Images</h2>
        
        {/* CSS Background */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">CSS Background</h3>
          <div 
            className="h-64 bg-cover bg-center rounded-lg flex items-center justify-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&h=400&fit=crop)'
            }}
          >
            <div className="bg-black bg-opacity-50 text-white p-6 rounded-lg">
              <h4 className="text-2xl font-bold">CSS Background Example</h4>
              <p>This uses CSS background-image property</p>
            </div>
          </div>
        </div>

        {/* Next.js Image as Background */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Next.js Image Background</h3>
          <div className="relative h-64 w-full rounded-lg overflow-hidden">
            <EnhancedImage
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop"
              alt="Background"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <h4 className="text-2xl font-bold">Next.js Image Background</h4>
                <p>This uses Next.js Image component with fill</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Example */}
      <section>
        <h2 className="text-2xl font-bold mb-6">6. Image Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=200&h=200&fit=crop'
          ].map((src, index) => (
            <div key={index} className="relative aspect-square">
              <EnhancedImage
                src={src}
                alt={`Gallery image ${index + 1}`}
                fill
                className="object-cover rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default ImageExamples;
