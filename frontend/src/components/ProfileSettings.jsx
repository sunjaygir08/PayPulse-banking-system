import React, { useState } from 'react';
import { User, Key, Lock, Palette, Check, AlertCircle } from 'lucide-react';

export default function ProfileSettings({ user, setUser, theme, toggleTheme, addToast }) {
  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // PIN State
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  // Avatar Selection Pool
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80'
  ];

  const handleUpdateAvatar = async (url) => {
    try {
      const response = await fetch('/api/profile/update-avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: url })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update avatar');

      addToast('Profile avatar updated successfully!', 'success');
      setUser({ ...user, avatar_url: url });
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }

    setPwLoading(true);
    try {
      const response = await fetch('/api/profile/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update password');

      addToast('Password updated successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const handleUpdatePin = async (e) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      addToast('New PINs do not match.', 'error');
      return;
    }

    setPinLoading(true);
    try {
      const response = await fetch('/api/profile/update-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_pin: oldPin, new_pin: newPin })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update PIN');

      addToast('Security PIN updated successfully!', 'success');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Profile & Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure security keys, themes, and manage public credentials.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Profile Card & Avatar */}
        <div className="glass-card" style={{ padding: '30px', borderRadius: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: 'var(--brand-primary)' }} /> User Profile Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <img 
              src={user?.avatar_url || avatars[0]} 
              alt="Avatar" 
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-primary-glow)' }}
            />
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user?.full_name}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user?.email}</p>
            </div>
          </div>

          {/* Avatar selector pool */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
              Choose a Profile Avatar
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {avatars.map((url, i) => (
                <img 
                  key={i}
                  src={url}
                  onClick={() => handleUpdateAvatar(url)}
                  alt={`Av-${i}`}
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover',
                    cursor: 'pointer',
                    border: user?.avatar_url === url ? '2px solid var(--brand-primary)' : '1px solid var(--card-border)',
                    boxShadow: user?.avatar_url === url ? '0 0 8px var(--brand-primary-glow)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Theme card selection */}
          <div style={{
            background: 'var(--input-bg)',
            border: '1px solid var(--card-border)',
            padding: '20px',
            borderRadius: '16px'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Palette size={16} style={{ color: 'var(--brand-secondary)' }} /> Theme Configuration
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Toggle between Obsidian Dark (glowing) or Alpine Light visual environments.
            </p>
            <button 
              type="button" 
              onClick={toggleTheme} 
              className="btn-primary" 
              style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
            >
              Set to {theme === 'dark' ? 'Alpine Light Mode' : 'Obsidian Dark Mode'}
            </button>
          </div>
        </div>

        {/* Security Settings: Credentials Updates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Security PIN Change */}
          <div className="glass-card" style={{ padding: '30px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} style={{ color: 'var(--brand-accent)' }} /> Update Security PIN
            </h3>
            <form onSubmit={handleUpdatePin}>
              <div className="form-group">
                <label>Current 4-digit PIN</label>
                <input 
                  type="password" 
                  maxLength={4} 
                  pattern="[0-9]{4}"
                  placeholder="••••"
                  className="form-input"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>New 4-digit PIN</label>
                  <input 
                    type="password" 
                    maxLength={4} 
                    pattern="[0-9]{4}"
                    placeholder="••••"
                    className="form-input"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm PIN</label>
                  <input 
                    type="password" 
                    maxLength={4} 
                    pattern="[0-9]{4}"
                    placeholder="••••"
                    className="form-input"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }} disabled={pinLoading}>
                {pinLoading ? 'Updating PIN...' : 'Update Security PIN'}
              </button>
            </form>
          </div>

          {/* Password Change */}
          <div className="glass-card" style={{ padding: '30px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} style={{ color: 'var(--expense-red)' }} /> Update Account Password
            </h3>
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  className="form-input"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    className="form-input"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    className="form-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }} disabled={pwLoading}>
                {pwLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
