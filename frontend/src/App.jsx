import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginSignup from './components/LoginSignup';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transfer from './components/Transfer';
import BillPay from './components/BillPay';
import VirtualCards from './components/VirtualCards';
import ProfileSettings from './components/ProfileSettings';

export default function App() {
  const [activePage, setActivePage] = useState('landing'); // 'landing' | 'login' | 'signup' | 'app'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'transfer' | 'bills' | 'cards' | 'settings'
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('paypulse-theme') || 'dark');
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authenticate session on mount
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
        // Not authenticated, stay on landing
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('paypulse-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove toast
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setActivePage('landing');
      addToast('Signed out successfully.', 'info');
    } catch (err) {
      addToast('Logout error', 'error');
    }
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
      default:
        return <Dashboard user={user} addToast={addToast} setActiveTab={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>Securing Connection...</p>
      </div>
    );
  }

  return (
    <>
      {/* Dynamic Toast Container */}
      <div className="toast-overlay">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Page Routing */}
      {activePage === 'landing' && (
        <LandingPage 
          onNavigate={(page) => setActivePage(page)} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
      )}

      {(activePage === 'login' || activePage === 'signup') && (
        <LoginSignup 
          initialMode={activePage} 
          onAuthSuccess={(userData) => {
            setUser(userData);
            setActivePage('app');
            setActiveTab('dashboard');
          }}
          onBackToLanding={() => setActivePage('landing')}
          addToast={addToast}
        />
      )}

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
          <main className="main-content">
            {renderTabContent()}
          </main>
        </div>
      )}
    </>
  );
}
