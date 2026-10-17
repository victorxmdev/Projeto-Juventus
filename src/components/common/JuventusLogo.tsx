import React, { useState } from 'react';

interface JuventusLogoProps {
  className?: string;
  size?: number; // target height in pixels
  alt?: string;
}

export const JuventusLogo: React.FC<JuventusLogoProps> = ({ 
  className = '', 
  size = 40,
  alt = 'Clube Atlético Juventus SAF'
}) => {
  const [hasError, setHasError] = useState(false);

  // Natural aspect ratio: 393 width / 508 height ≈ 0.7736
  const width = Math.round(size * (393 / 508));

  if (hasError) {
    return (
      <div 
        className={`inline-flex items-center justify-center select-none flex-shrink-0 rounded-full bg-[#631426] text-[#D4AF37] font-black font-serif border border-[#D4AF37]/50 ${className}`}
        style={{ width: size, height: size }}
        title={alt}
      >
        J
      </div>
    );
  }

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 transition-transform duration-200 hover:scale-105 ${className}`} 
      style={{ width, height: size }}
      title={alt}
    >
      <img
        src="/juventus_logo.png"
        alt={alt}
        className="w-full h-full object-contain filter drop-shadow-xs"
        onError={() => setHasError(true)}
        draggable={false}
      />
    </div>
  );
};
