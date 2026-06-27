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
  style: styleProp,   // extract style separately so we can MERGE it with getSizeStyle()
  ...props
}) {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':   return 'btn-primary';
      case 'secondary': return 'btn-secondary';
      case 'accent':    return 'btn-accent';
      case 'outline':   return 'btn-outline';
      case 'danger':    return 'btn-danger';
      case 'text':      return 'btn-text';
      default:          return 'btn-primary';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm': return { padding: '6px 14px', fontSize: '0.82rem' };
      case 'lg': return { padding: '14px 28px', fontSize: '1rem' };
      case 'md':
      default:
        return {};
    }
  };

  // Merge size defaults with any caller-supplied style overrides.
  // Previously Button spread {...props} AFTER style={getSizeStyle()}, which let
  // callers' `style` prop silently wipe out the size padding/font-size.
  const mergedStyle = { ...getSizeStyle(), ...styleProp };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${getVariantClass()} ${className}`}
      style={mergedStyle}
      {...props}
    >
      {loading ? (
        <>
          <svg
            style={{
              animation: 'spin 0.8s linear infinite',
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTopColor: 'currentColor',
              borderRadius: '50%',
              flexShrink: 0,
            }}
            viewBox="0 0 24 24"
          />
          <span>Loading...</span>
        </>
      ) : children}
    </button>
  );
}
