# 🖼️ การใช้งานรูปภาพใน OneEvent

## 1. โลโก้และไอคอน

```tsx
import Image from 'next/image';

// โลโก้หลัก
<Image 
  src="/logo.png" 
  alt="OneEvent Logo" 
  width={120} 
  height={120}
  className="drop-shadow-lg"
  priority // สำหรับรูปที่สำคัญ
/>

// โลโก้ขนาดเล็กใน Navigation
<Image 
  src="/logo.png" 
  alt="OneEvent Logo" 
  width={32} 
  height={32}
  className="drop-shadow-sm"
/>
```

## 2. รูปภาพพื้นหลัง (Background Images)

```tsx
// วิธีที่ 1: ใช้ CSS Background
<div 
  className="bg-cover bg-center h-64"
  style={{
    backgroundImage: 'url(/images/hero-bg.jpg)'
  }}
>
  <div className="bg-black bg-opacity-50 h-full flex items-center justify-center">
    <h1 className="text-white text-4xl">Welcome</h1>
  </div>
</div>

// วิธีที่ 2: ใช้ Next.js Image เป็น Background
<div className="relative h-64 w-full">
  <Image
    src="/images/hero-bg.jpg"
    alt="Hero Background"
    fill
    className="object-cover"
  />
  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <h1 className="text-white text-4xl">Welcome</h1>
  </div>
</div>
```

## 3. รูปภาพจาก API/Database

```tsx
import { useState } from 'react';
import Image from 'next/image';

interface EventImageProps {
  eventId: string;
  title: string;
}

const EventImage: React.FC<EventImageProps> = ({ eventId, title }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative w-full h-48">
      {!imageError ? (
        <Image
          src={`/api/events/${eventId}/image`}
          alt={title}
          fill
          className="object-cover rounded-lg"
          onError={() => setImageError(true)}
        />
      ) : (
        // Fallback image
        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">No Image</span>
        </div>
      )}
    </div>
  );
};
```

## 4. อวตาร์ผู้ใช้

```tsx
interface UserAvatarProps {
  user: {
    name: string;
    avatar?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden`}>
      {user.avatar ? (
        <Image
          src={user.avatar}
          alt={user.name}
          fill
          className="object-cover"
        />
      ) : (
        // Initial-based avatar
        <div className="w-full h-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 font-medium">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};
```

## 5. Gallery/Carousel

```tsx
import { useState } from 'react';
import Image from 'next/image';

const ImageGallery: React.FC<{ images: string[] }> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative h-96 w-full">
        <Image
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex space-x-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 ${
              index === currentIndex ? 'ring-2 ring-red-500' : ''
            }`}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
```

## 6. Responsive Images

```tsx
// สำหรับ responsive design
<div className="w-full">
  <Image
    src="/images/event-banner.jpg"
    alt="Event Banner"
    width={800}
    height={400}
    className="w-full h-auto"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
</div>

// หรือใช้ fill กับ responsive container
<div className="relative w-full aspect-video">
  <Image
    src="/images/event-banner.jpg"
    alt="Event Banner"
    fill
    className="object-cover"
  />
</div>
```

## 7. Loading States

```tsx
import { useState } from 'react';

const ImageWithLoading: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"></div>
      )}
      <Image
        src={src}
        alt={alt}
        width={400}
        height={300}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  );
};
```

## 🔧 Tips และ Best Practices

### 1. Optimization
- ใช้ `priority` สำหรับรูป above-the-fold
- ใช้ `sizes` สำหรับ responsive images
- ใช้ WebP format เมื่อเป็นไปได้

### 2. Performance
```tsx
// Lazy loading (default)
<Image src="/image.jpg" alt="..." width={400} height={300} />

// Eager loading สำหรับรูปสำคัญ
<Image 
  src="/logo.png" 
  alt="..." 
  width={100} 
  height={100} 
  priority 
/>
```

### 3. Error Handling
```tsx
const [imageError, setImageError] = useState(false);

<Image
  src="/image.jpg"
  alt="..."
  width={400}
  height={300}
  onError={() => setImageError(true)}
/>
```

### 4. External Images
สำหรับรูปจาก domain ภายนอก ต้อง config ใน `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['example.com', 'api.unsplash.com'],
  },
}

module.exports = nextConfig
```
