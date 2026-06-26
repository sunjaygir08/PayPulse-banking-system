import React, { useState, useEffect } from 'react';
import LandingPage from './components/pages/LandingPage';
import LoginSignup from './components/pages/LoginSignup';
import Dashboard from './components/pages/Dashboard';
import Transfer from './components/pages/Transfer';
import BillPay from './components/pages/BillPay';
import VirtualCards from './components/pages/VirtualCards';
import ProfileSettings from './components/pages/ProfileSettings';
import AdminPanel from './components/pages/AdminPanel';
import Sidebar from './components/Sidebar';
import Logo from './components/common/Logo';
import Toast from './components/common/Toast';

export default function App() {
  const [activePage, setActivePage] = useState('landing'); // 'landing' | 'login' | 'signup' | 'app'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  // Default theme is 'light' (Corporate Light Mode) as per design requirements
  const [theme, setTheme] = useState(localStorage.getItem('paypulse-theme') || 'light');
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restore existing session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setActivePage('app');
        }
      } catch (err) {
        // Not authenticated — stay on landing
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('paypulse-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const addToast = (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {
      // Ignore logout network errors
    }
    setUser(null);
    setActivePage('landing');
    setActiveTab('dashboard');
    addToast('You have been signed out successfully.', 'info');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} addToast={addToast} setActiveTab={setActiveTab} />;
      case 'transfer':
        return <Transfer user={user} addToast={addToast} />;
      case 'bills':
        return <BillPay user={user} addToast={addToast} />;
      case 'cards':
        return <VirtualCards user={user} addToast={addToast} />;
      case 'settings':
        return (
          <ProfileSettings
            user={user}
            setUser={setUser}
            theme={theme}
            toggleTheme={toggleTheme}
            addToast={addToast}
          />
        );
      case 'admin':
        return user?.is_admin === 1 
          ? <AdminPanel user={user} addToast={addToast} />
          : <Dashboard user={user} addToast={addToast} setActiveTab={setActiveTab} />;
      default:
        return <Dashboard user={user} addToast={addToast} setActiveTab={setActiveTab} />;
    }
  };

  // Full-screen loading spinner while session is being restored
  if (loading) {
    return (
      <div className="loading-overlay">
        <Logo showText={false} size={48} />
        <div className="spinner" style={{ marginTop: '16px' }} />
        <p style={{ 
          fontFamily: 'var(--font-sans)', 
          fontSize: '0.85rem', 
          color: 'var(--text-secondary)',
          marginTop: '12px'
        }}>
          Securing Connection...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification Overlay */}
      <div className="toast-overlay">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} />
        ))}
      </div>

      {/* Landing Page */}
      {activePage === 'landing' && (
        <LandingPage
          onNavigate={page => setActivePage(page)}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}

      {/* Authentication Gateway */}
      {(activePage === 'login' || activePage === 'signup') && (
        <LoginSignup
          initialMode={activePage}
          onAuthSuccess={userData => {
            setUser(userData);
            setActivePage('app');
            setActiveTab('dashboard');
          }}
          onBackToLanding={() => setActivePage('landing')}
          addToast={addToast}
        />
      )}

      {/* Main Application Shell */}
      {activePage === 'app' && (
        <div className="app-container">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            user={user}
            theme={theme}
            toggleTheme={toggleTheme}
          />
          <main 
            className="main-content"
            style={{ marginLeft: 'var(--sidebar-width)' }}
          >
            {renderTabContent()}
          </main>
        </div>
      )}
    </>
  );
}
