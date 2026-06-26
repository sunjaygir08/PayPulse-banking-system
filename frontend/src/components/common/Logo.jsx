import React from 'react';

export default function Logo({ size = 32, showText = true, className = '' }) {
  return (
    <div className={`flex-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Shield background */}
        <path 
          d="M12 2L4 5V11C4 16.52 7.42 20.74 12 22C16.58 20.74 20 16.52 20 11V5L12 2Z" 
          fill="var(--brand-primary)" 
        />
        {/* Inner shadow/accent path */}
        <path 
          d="M12 3.5L5.5 6V11C5.5 15.6 8.35 19.14 12 20.25V3.5Z" 
          fill="rgba(255, 255, 255, 0.08)" 
        />
        {/* Monogram P integrated with financial growth line */}
        <path 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M10 7H13.5C14.88 7 16 8.12 16 9.5C16 10.88 14.88 12 13.5 12H12V16.5C12 16.78 11.78 17 11.5 17H10.5C10.22 17 10 16.78 10 16.5V7ZM12 8.5V10.5H13.5C14.05 10.5 14.5 10.05 14.5 9.5C14.5 8.95 14.05 8.5 13.5 8.5H12Z" 
          fill="#FFFFFF" 
        />
        {/* Subtle accent dot representing the digital pulse */}
        <circle cx="14.5" cy="14.5" r="1.5" fill="var(--brand-accent)" />
      </svg>
      {showText && (
        <span 
          style={{ 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            letterSpacing: '-0.5px',
            color: 'inherit',
            fontFamily: 'var(--font-sans)'
          }}
        >
          Pay<span style={{ color: 'var(--brand-primary)' }}>Pulse</span>
        </span>
      )}
    </div>
  );
}
