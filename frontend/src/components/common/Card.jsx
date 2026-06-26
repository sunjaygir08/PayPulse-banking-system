import React from 'react';

export default function Card({
  children,
  title,
  headerAction,
  className = '',
  hoverable = false,
  onClick,
  ...props
}) {
  return (
    <div
      className={`card ${hoverable ? 'card-hover' : ''} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      {...props}
    >
      {(title || headerAction) && (
        <div 
          className="card-header" 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            borderBottom: '1px solid var(--card-border)',
            paddingBottom: '12px'
          }}
        >
          {title && <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>}
          {headerAction && <div className="card-header-action">{headerAction}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}
