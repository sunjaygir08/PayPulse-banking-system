import React from 'react';
import { ShieldAlert } from 'lucide-react';
import Button from './Button';

export default function NotFound({ onBackHome, className = '' }) {
  return (
    <div 
      className={`not-found-container ${className}`} 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh', 
        textAlign: 'center',
        padding: '40px 20px'
      }}
    >
      <ShieldAlert size={64} style={{ color: 'var(--expense-color)', marginBottom: '24px' }} />
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px', marginBottom: '30px', fontSize: '0.95rem' }}>
        The link you followed may be broken, or the page may have been removed by security protocols.
      </p>
      <Button onClick={onBackHome} variant="primary">
        Go Back Home
      </Button>
    </div>
  );
}
