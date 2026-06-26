import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function Alert({
  type = 'info', // success | danger | warning | info
  message,
  children,
  onClose,
  className = '',
  ...props
}) {
  const getAlertClass = () => {
    switch (type) {
      case 'success': return 'alert-success';
      case 'danger': return 'alert-danger';
      case 'warning': return 'alert-warning';
      case 'info':
      default:
        return 'alert-success'; // fallback or similar
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={18} />;
      case 'danger': return <AlertCircle size={18} />;
      case 'warning': return <AlertCircle size={18} />;
      case 'info':
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className={`alert ${getAlertClass()} ${className}`} {...props}>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {getIcon()}
      </span>
      <div style={{ flexGrow: 1 }}>
        {message || children}
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: 'currentColor', 
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
