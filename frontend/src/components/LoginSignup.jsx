import React, { useState } from 'react';
import { Mail, Lock, User, Key, Eye, EyeOff } from 'lucide-react';

export default function LoginSignup({ initialMode = 'login', onAuthSuccess, onBackToLanding, addToast }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login' 
      ? { email, password }
      : { email, password, full_name: fullName, security_pin: securityPin };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      addToast(
        mode === 'login' ? 'Welcome back to PayPulse!' : 'Account created successfully! Welcome to PayPulse.',
        'success'
      );
      
      onAuthSuccess(data.user);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px',
        borderRadius: '24px'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span 
            onClick={onBackToLanding}
            style={{ 
              fontSize: '1.5rem', 
              fontWeight: 800, 
              letterSpacing: '-0.5px', 
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer' 
            }}
          >
            Pay<span className="gradient-text">Pulse</span>
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '16px' }}>
            {mode === 'login' ? 'Sign in to PayPulse' : 'Create your account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            {mode === 'login' ? 'Access your digital banking sandbox' : 'Open checking and savings demo accounts instantly'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="John Doe" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-input" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '44px', paddingRight: '44px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '14px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label>Security PIN (4 Digits)</label>
              <div style={{ position: 'relative' }}>
                <Key size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  maxLength={4}
                  pattern="[0-9]{4}"
                  className="form-input" 
                  placeholder="••••" 
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                  style={{ width: '100%', paddingLeft: '44px', fontFamily: 'var(--font-mono)', letterSpacing: '8px' }}
                  required
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required to authorize transfers and bill payments.</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--brand-primary)', 
              fontWeight: 600, 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {mode === 'login' ? 'Register here' : 'Sign In'}
          </button>
        </div>

        <button 
          onClick={onBackToLanding}
          className="btn-secondary" 
          style={{ width: '100%', marginTop: '16px', fontSize: '0.85rem', padding: '8px' }}
        >
          Back to Homepage
        </button>
      </div>
    </div>
  );
}
