import React from 'react';
import { LayoutDashboard, Send, Receipt, CreditCard, UserCog, LogOut, Moon, Sun, ShieldCheck } from 'lucide-react';
import Logo from './common/Logo';

export default function Sidebar({ activeTab, setActiveTab, onLogout, user, theme, toggleTheme }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transfer', label: 'Transfer', icon: Send },
    { id: 'bills', label: 'Bill Pay', icon: Receipt },
    { id: 'cards', label: 'Virtual Cards', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: UserCog },
  ];

  if (user && user.is_admin === 1) {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldCheck });
  }

  const getInitials = () => {
    if (!user?.full_name) return 'PB';
    const parts = user.full_name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.full_name.substr(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Desktop Sidebar (Corporate Navy) */}
      <aside 
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '30px 20px',
          zIndex: 100,
          borderRight: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div>
          {/* Custom Banking Logo */}
          <div style={{ marginBottom: '40px', paddingLeft: '10px', color: '#ffffff' }}>
            <Logo showText={true} size={28} />
          </div>

          {/* User profile brief card */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '30px', 
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt="Avatar" 
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div 
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--brand-accent)', 
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                {getInitials()}
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', margin: 0 }}>
                {user?.full_name}
              </p>
              <p style={{ fontSize: '0.68rem', color: 'var(--sidebar-text-muted)', margin: 0 }}>
                {user?.is_admin === 1 ? 'System Admin' : 'Customer Account'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                    padding: '11px 16px',
                    width: '100%',
                    border: 'none',
                    borderRadius: '10px',
                    background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                    color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text-muted)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left'
                  }}
                  className="nav-btn"
                >
                  <Icon size={18} style={{ color: isActive ? 'var(--brand-primary)' : 'var(--sidebar-text-muted)', opacity: isActive ? 1 : 0.7 }} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              width: '100%',
              border: 'none',
              borderRadius: '10px',
              background: 'transparent',
              color: 'var(--sidebar-text-muted)',
              fontWeight: 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          </button>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              width: '100%',
              border: 'none',
              borderRadius: '10px',
              background: 'transparent',
              color: 'var(--expense-color)',
              fontWeight: 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sticky Bottom Nav Bar */}
      <nav 
        className="mobile-nav" 
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: '60px',
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 10px',
          zIndex: 1000,
          borderTop: '1px solid rgba(255,255,255,0.05)'
        }}
      >
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
                gap: '2px',
                border: 'none',
                background: 'transparent',
                color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text-muted)',
                cursor: 'pointer',
                fontSize: '0.65rem',
                fontWeight: isActive ? 600 : 500
              }}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--brand-primary)' : 'var(--sidebar-text-muted)' }} />
              <span>{item.label}</span>
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
            gap: '2px',
            border: 'none',
            background: 'transparent',
            color: 'var(--expense-color)',
            cursor: 'pointer',
            fontSize: '0.65rem'
          }}
        >
          <LogOut size={18} />
          <span>Exit</span>
        </button>
      </nav>

      <style>{`
        @media (max-width: 1024px) {
          aside { display: none !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
