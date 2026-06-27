import React, { useState } from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  success = false,
  required = false,
  className = '',
  ...props
}) {
  // Generate a stable random ID once on mount (not on every render).
  // Using Math.random() directly in the render body created a new ID every
  // re-render, which caused React to unmount/remount the <label>/<input> pair
  // on every keystroke — breaking controlled inputs and crashing the Settings page.
  const [stableId] = useState(
    () => id || `input-${Math.random().toString(36).substr(2, 9)}`
  );
  const inputId = id || stableId;

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span style={{ color: 'var(--expense-color)' }}>*</span>}
        </label>
      )}
      <div className="input-container">
        {Icon && <Icon size={18} className="input-icon" />}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`form-input ${Icon ? 'form-input-with-icon' : ''} ${error ? 'error' : ''} ${success ? 'success' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
}
