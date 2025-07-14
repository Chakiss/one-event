import React, { useState } from 'react';
import Image from 'next/image';

interface SimpleLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  className?: string;
}

export const SimpleLogo: React.FC<SimpleLogoProps> = ({ 
  size = 'md', 
  variant = 'light',
  className = '' 
}) => {
  const [hasError, setHasError] = useState(false);
  
  const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 120, height: 120 }
  };

  const logoSrc = variant === 'dark' ? '/logo-dark.png' : '/logo.png';
  
  // Text-based fallback for logo
  const TextLogo = () => {
    const textSizes = {
      sm: 'text-lg',
      md: 'text-xl', 
      lg: 'text-4xl'
    };
    
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg ${textSizes[size]} ${className}`}
        style={{ 
          width: sizes[size].width, 
          height: sizes[size].height 
        }}
      >
        OE
      </div>
    );
  };

  if (hasError) {
    return <TextLogo />;
  }

  return (
    <Image
      src={logoSrc}
      alt="OneEvent Logo"
      width={sizes[size].width}
      height={sizes[size].height}
      className={`drop-shadow-sm ${className}`}
      priority={size === 'lg'} // Prioritize large logos (usually on homepage)
      unoptimized={true} // Use unoptimized to avoid potential issues
      onError={() => {
        console.warn('Logo image failed to load, using text fallback');
        setHasError(true);
      }}
    />
  );
};

export default SimpleLogo;
