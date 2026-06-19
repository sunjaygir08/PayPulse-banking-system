import React from 'react';
import { LayoutDashboard, Send, Receipt, CreditCard, UserCog, LogOut, Moon, Sun } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, user, theme, toggleTheme }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transfer', label: 'Transfer', icon: Send },
    { id: 'bills', label: 'Bill Pay', icon: Receipt },
    { id: 'cards', label: 'Virtual Cards', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: UserCog },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="glass-card" style={{
        position: 'fixed',
        left: '20px',
        top: '20px',
        bottom: '20px',
        width: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '30px 20px',
        borderRadius: '24px',
        zIndex: 100,
      }}>
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', paddingLeft: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontFamily: 'var(--font-mono)'
            }}>P</div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.5px', fontFamily: 'var(--font-mono)' }}>
              Pay<span className="gradient-text">Pulse</span>
            </span>
          </div>

          {/* User info brief */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '30px', 
            padding: '10px',
            borderRadius: '12px',
            background: 'var(--input-bg)',
            border: '1px solid var(--card-border)'
          }}>
            <img 
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'} 
              alt="Avatar" 
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {user?.full_name}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sandbox User</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    width: '100%',
                    border: 'none',
                    borderRadius: '12px',
                    background: isActive ? 'var(--sidebar-active)' : 'transparent',
                    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  className="nav-btn"
                >
                  <Icon size={18} style={{ color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)' }} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              width: '100%',
              border: 'none',
              borderRadius: '12px',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? <Sun size={18} style={{ color: 'var(--text-muted)' }} /> : <Moon size={18} style={{ color: 'var(--text-muted)' }} />}
            {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          </button>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              width: '100%',
              border: 'none',
              borderRadius: '12px',
              background: 'transparent',
              color: 'var(--expense-red)',
              fontWeight: 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Floating Nav Bar */}
      <nav className="glass-card mobile-nav" style={{
        position: 'fixed',
        left: '10px',
        right: '10px',
        bottom: '10px',
        height: '64px',
        display: 'none', // Shown in CSS media query or style overrides
        alignItems: 'center',
        justifyContent: 'space-around',
        borderRadius: '20px',
        padding: '0 10px',
        zIndex: 1000
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                border: 'none',
                background: 'transparent',
                color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.65rem',
                fontWeight: isActive ? 600 : 500
              }}
            >
              <Icon size={20} />
            </button>
          );
        })}
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--expense-red)',
              cursor: 'pointer',
              fontSize: '0.65rem'
            }}
          >
            <LogOut size={20} />
            <span>Out</span>
          </button>
      </nav>

      {/* Inline styles to display mobile navigation appropriately based on screen width */}
      <style>{`
        @media (max-width: 1024px) {
          aside { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
