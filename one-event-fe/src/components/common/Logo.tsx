import React from 'react';
import Image from 'next/image';

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
    sm: { width: 32, height: 32, text: 'text-sm' },
    md: { width: 48, height: 48, text: 'text-lg' },
    lg: { width: 120, height: 120, text: 'text-4xl' }
  };

  const currentSize = sizes[size];
  const logoSrc = variant === 'dark' ? '/logo-dark.png' : '/logo.png';

  return (
    <div className={`relative ${className}`}>
      {/* Try to load the image first */}
      <Image
        src={logoSrc}
        alt="OneEvent Logo"
        width={currentSize.width}
        height={currentSize.height}
        className="drop-shadow-sm"
        unoptimized
        priority={size === 'lg'}
        onError={(e) => {
          // Hide the image and show fallback
          (e.target as HTMLImageElement).style.display = 'none';
          const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
          if (fallback) {
            fallback.style.display = 'flex';
          }
        }}
      />
      
      {/* Fallback text logo */}
      <div 
        className={`hidden items-center justify-center bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg ${currentSize.text}`}
        style={{ 
          width: currentSize.width, 
          height: currentSize.height 
        }}
      >
        OE
      </div>
    </div>
  );
};

export default Logo;
