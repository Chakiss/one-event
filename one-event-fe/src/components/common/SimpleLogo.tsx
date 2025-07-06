import React from 'react';

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
  const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 120, height: 120 }
  };

  const logoSrc = variant === 'dark' ? '/logo-dark.png' : '/logo.png';

  return (
    <img
      src={logoSrc}
      alt="OneEvent Logo"
      width={sizes[size].width}
      height={sizes[size].height}
      className={`drop-shadow-sm ${className}`}
      onError={(e) => {
        // Fallback to default logo if the requested variant fails
        (e.target as HTMLImageElement).src = '/logo.png';
      }}
    />
  );
};

export default SimpleLogo;
