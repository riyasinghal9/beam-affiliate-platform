import React from 'react';

interface BeamLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showWordmark?: boolean;
  className?: string;
  textColor?: string;
  variant?: 'default' | 'minimal' | 'gradient';
}

const BeamLogo: React.FC<BeamLogoProps> = ({ 
  size = 'md', 
  showWordmark = true, 
  className = '',
  textColor = 'text-beam-charcoal-500',
  variant = 'default'
}) => {
  const sizeMap = {
    xs: { width: 20, height: 20, fontSize: 10, logoSize: 20 },
    sm: { width: 24, height: 24, fontSize: 12, logoSize: 24 },
    md: { width: 32, height: 32, fontSize: 16, logoSize: 32 },
    lg: { width: 40, height: 40, fontSize: 20, logoSize: 40 },
    xl: { width: 48, height: 48, fontSize: 24, logoSize: 48 },
    '2xl': { width: 64, height: 64, fontSize: 32, logoSize: 64 }
  };

  const { width, height, fontSize, logoSize } = sizeMap[size];

  const renderLogoMark = () => {
    if (variant === 'minimal') {
      return (
        <div 
          className="flex-shrink-0 bg-beam-pink-500 rounded-full flex items-center justify-center"
          style={{ width: logoSize, height: logoSize }}
        >
          <svg 
            width={logoSize * 0.6} 
            height={logoSize * 0.6}
            viewBox="0 0 40 40" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path 
              d="M10 8C10 6.89543 10.8954 6 12 6H28C29.1046 6 30 6.89543 30 8V32C30 33.1046 29.1046 34 28 34H12C10.8954 34 10 33.1046 10 32V8Z" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.8" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <line x1="12" y1="20" x2="28" y2="20" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"/>
            <path d="M12 8C12 7.44772 12.4477 7 13 7H27C27.5523 7 28 7.44772 28 8V19C28 19.5523 27.5523 20 27 20H13C12.4477 20 12 19.5523 12 19V8Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M12 21C12 20.4477 12.4477 20 13 20H27C27.5523 20 28 20.4477 28 21V32C28 32.5523 27.5523 33 27 33H13C12.4477 33 12 32.5523 12 32V21Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
      );
    }

    if (variant === 'gradient') {
      return (
        <div 
          className="flex-shrink-0 rounded-full flex items-center justify-center shadow-lg"
          style={{ width: logoSize, height: logoSize }}
        >
          <svg 
            width={logoSize} 
            height={logoSize}
            viewBox="0 0 40 40" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'#FF2069', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#E91E63', stopOpacity:1}} />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="19" fill="url(#beamGradient)"/>
            <circle cx="20" cy="20" r="16" fill="#FF2069" opacity="0.9"/>
            <path d="M10 8C10 6.89543 10.8954 6 12 6H28C29.1046 6 30 6.89543 30 8V32C30 33.1046 29.1046 34 28 34H12C10.8954 34 10 33.1046 10 32V8Z" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="20" x2="28" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
            <path d="M12 8C12 7.44772 12.4477 7 13 7H27C27.5523 7 28 7.44772 28 8V19C28 19.5523 27.5523 20 27 20H13C12.4477 20 12 19.5523 12 19V8Z" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M12 21C12 20.4477 12.4477 20 13 20H27C27.5523 20 28 20.4477 28 21V32C28 32.5523 27.5523 33 27 33H13C12.4477 33 12 32.5523 12 32V21Z" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
      );
    }

    // Default variant
    return (
      <div 
        className="flex-shrink-0 bg-gradient-to-br from-beam-pink-500 to-beam-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-beam-pink-500/25"
        style={{ width: logoSize, height: logoSize }}
      >
        <svg 
          width={logoSize * 0.6} 
          height={logoSize * 0.6}
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path 
            d="M10 8C10 6.89543 10.8954 6 12 6H28C29.1046 6 30 6.89543 30 8V32C30 33.1046 29.1046 34 28 34H12C10.8954 34 10 33.1046 10 32V8Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <line x1="12" y1="20" x2="28" y2="20" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"/>
          <path d="M12 8C12 7.44772 12.4477 7 13 7H27C27.5523 7 28 7.44772 28 8V19C28 19.5523 27.5523 20 27 20H13C12.4477 20 12 19.5523 12 19V8Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M12 21C12 20.4477 12.4477 20 13 20H27C27.5523 20 28 20.4477 28 21V32C28 32.5523 27.5523 33 27 33H13C12.4477 33 12 32.5523 12 32V21Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      </div>
    );
  };

  return (
    <div className={`flex items-center ${className}`}>
      {renderLogoMark()}
      
      {/* Wordmark - Modern italicized "beam" */}
      {showWordmark && (
        <div className="ml-3 flex flex-col">
          <span 
            className={`font-nunito-bold italic ${textColor} tracking-wide`}
            style={{ fontSize: `${fontSize}px` }}
          >
            beam
          </span>
          {size === 'lg' || size === 'xl' || size === '2xl' ? (
            <div 
              className="h-0.5 bg-beam-teal-400 rounded-full mt-1"
              style={{ width: `${fontSize * 1.5}px` }}
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default BeamLogo;