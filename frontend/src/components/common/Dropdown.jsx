import React, { useState, useRef, useEffect } from 'react';

export default function Dropdown({ trigger, items = [], align = 'right', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      className={`dropdown-container ${className}`} 
      ref={dropdownRef} 
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>
      {isOpen && (
        <div 
          className="dropdown-menu card" 
          style={{ 
            position: 'absolute', 
            top: '100%', 
            right: align === 'right' ? 0 : 'auto', 
            left: align === 'left' ? 0 : 'auto',
            marginTop: '8px', 
            minWidth: '180px', 
            zIndex: 100, 
            padding: '8px 0',
            borderRadius: '10px',
            boxShadow: 'var(--card-shadow-hover)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--card-border)'
          }}
        >
          {items.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => {
                if (item.onClick) item.onClick();
                setIsOpen(false);
              }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '10px 16px', 
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: item.danger ? 'var(--expense-color)' : 'var(--text-primary)',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.03)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              {item.icon && <item.icon size={16} />}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
