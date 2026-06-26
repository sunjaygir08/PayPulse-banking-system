import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorScreen({ 
  errorMsg = 'An unexpected error occurred during execution.', 
  onRetry, 
  className = '' 
}) {
  return (
    <div 
      className={`error-screen-container ${className}`} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '50vh', 
        textAlign: 'center',
        padding: '40px 20px'
      }}
    >
      <AlertCircle size={48} style={{ color: 'var(--expense-color)', marginBottom: '20px' }} />
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
        System Interruption
      </h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '380px', marginBottom: '24px', fontSize: '0.9rem' }}>
        {errorMsg}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
}
