import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false, 
  className = '',
  ...props 
}) {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'btn-primary';
      case 'secondary': return 'btn-secondary';
      case 'accent': return 'btn-accent';
      case 'outline': return 'btn-outline';
      case 'danger': return 'btn-danger';
      case 'text': return 'btn-text';
      default: return 'btn-primary';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm': return { padding: '6px 12px', fontSize: '0.8rem' };
      case 'lg': return { padding: '14px 28px', fontSize: '1rem' };
      case 'md':
      default:
        return {};
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${getVariantClass()} ${className}`}
      style={getSizeStyle()}
      {...props}
    >
      {loading ? (
        <>
          <svg 
            className="animate-spin" 
            style={{ 
              animation: 'spin 1s linear infinite', 
              width: '16px', 
              height: '16px', 
              border: '2px solid transparent', 
              borderTopColor: 'currentColor', 
              borderRadius: '50%' 
            }} 
            viewBox="0 0 24 24"
          />
          <span>Loading...</span>
        </>
      ) : children}
    </button>
  );
}
