import React, { useState } from 'react';
import Image from 'next/image';

interface ImageComponentProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  fallback?: string;
}

/**
 * Enhanced Image Component with error handling and loading states
 */
export const EnhancedImage: React.FC<ImageComponentProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  fallback = '/images/placeholder.png'
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        {fallback !== src ? (
          <Image
            src={fallback}
            alt="Fallback image"
            width={width}
            height={height}
            fill={fill}
            className="object-cover"
          />
        ) : (
          <span className="text-gray-500 text-sm">Image not found</span>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && !fill && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
          style={{ width, height }}
        />
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};

/**
 * User Avatar Component
 */
interface UserAvatarProps {
  user: {
    name: string;
    avatar?: string;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-xl'
  };

  const initials = (user?.name || 'User')
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden ${className}`}>
      {user.avatar ? (
        <EnhancedImage
          src={user.avatar}
          alt={user?.name || 'User'}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 font-medium">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Event Card Image Component
 */
interface EventImageProps {
  event: {
    id: string;
    title: string;
    image?: string;
  };
  className?: string;
}

export const EventImage: React.FC<EventImageProps> = ({ event, className = '' }) => {
  return (
    <div className={`relative aspect-video w-full overflow-hidden rounded-lg ${className}`}>
      <EnhancedImage
        src={event.image || '/images/event-placeholder.jpg'}
        alt={event.title}
        fill
        className="object-cover hover:scale-105 transition-transform duration-300"
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>
  );
};

/**
 * Logo Component
 */
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'light',
  className = '' 
}) => {
  const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 120, height: 120 }
  };

  const logoSrc = variant === 'dark' ? '/logo-dark.png' : '/logo.png';

  return (
    <EnhancedImage
      src={logoSrc}
      alt="OneEvent Logo"
      width={sizes[size].width}
      height={sizes[size].height}
      className={`drop-shadow-sm ${className}`}
      priority={size === 'lg'}
      fallback="/logo.png"
    />
  );
};

export default EnhancedImage;
