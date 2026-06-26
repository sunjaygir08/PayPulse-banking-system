import React from 'react';

export default function Loader({ size = 'md', className = '' }) {
  const getSizeStyle = () => {
    switch (size) {
      case 'xs': return { width: '14px', height: '14px', borderWidth: '1.5px' };
      case 'sm': return { width: '20px', height: '20px', borderWidth: '2px' };
      case 'lg': return { width: '42px', height: '42px', borderWidth: '4px' };
      case 'md':
      default:
        return { width: '28px', height: '28px', borderWidth: '3px' };
    }
  };

  return (
    <div 
      className={`spinner ${className}`} 
      style={getSizeStyle()} 
    />
  );
}

// Skeleton subcomponent
export function Skeleton({ width = '100%', height = '20px', borderRadius = '4px', className = '' }) {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
}
