import React from 'react';
import { CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} style={{ color: 'var(--income-color)' }} />;
      case 'error':
        return <AlertCircle size={18} style={{ color: 'var(--expense-color)' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: 'var(--warning-color)' }} />;
      case 'info':
      default:
        return <Info size={18} style={{ color: 'var(--brand-secondary)' }} />;
    }
  };

  return (
    <div className={`toast ${type}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {getIcon()}
      <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)' }}>{message}</span>
    </div>
  );
}
