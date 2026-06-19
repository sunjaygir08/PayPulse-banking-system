import React from 'react';
import { ArrowRight, Shield, Zap, CreditCard, Sparkles, Activity, CheckCircle } from 'lucide-react';

export default function LandingPage({ onNavigate, theme, toggleTheme }) {
  return (
    <div className="landing-page" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', width: '100%' }}>
      {/* Top Navbar */}
      <header className="glass-card" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        margin: '20px auto',
        maxWidth: '1200px',
        borderRadius: '24px',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontFamily: 'var(--font-mono)'
          }}>P</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', fontFamily: 'var(--font-mono)' }}>
            Pay<span className="gradient-text">Pulse</span>
          </span>
        </div>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>Features</a>
          <a href="#security" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>Security</a>
          <button 
            onClick={toggleTheme} 
            className="btn-secondary" 
            style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem' }}
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button 
            onClick={() => onNavigate('login')}
            className="btn-secondary" 
            style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '0.95rem' }}
          >
            Sign In
          </button>
          <button 
            onClick={() => onNavigate('signup')}
            className="btn-primary" 
            style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '0.95rem', boxShadow: 'none' }}
          >
            Join PayPulse
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '60px auto 100px auto',
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '40px',
        alignItems: 'center'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--sidebar-active)',
            color: 'var(--brand-primary)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '20px'
          }}>
            <Sparkles size={14} /> The Future of Digital Wealth
          </div>
          <h1 style={{
            fontSize: '3.8rem',
            lineHeight: 1.15,
            fontWeight: 800,
            marginBottom: '24px',
            letterSpacing: '-1.5px'
          }}>
            Banking built for <br />
            the <span className="gradient-text">digital pulse</span>.
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.15rem',
            marginBottom: '36px',
            lineHeight: 1.6,
            maxWidth: '540px'
          }}>
            Re-imagine your finances with modern glassmorphism dashboards, virtual card toggles, and direct peer transfers protected by instant security layers.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={() => onNavigate('signup')} className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
              Create Free Account <ArrowRight size={18} />
            </button>
            <button onClick={() => onNavigate('login')} className="btn-secondary" style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
              Explore Sandbox
            </button>
          </div>
        </div>

        {/* Visual Mockup Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '380px',
            padding: '24px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.7))',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Balance</span>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', marginTop: '4px' }}>$14,250.45</h2>
              </div>
              <span className="pill" style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--income-green)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                alignSelf: 'flex-start'
              }}>Active</span>
            </div>

            {/* Glowing Virtual Card Preview */}
            <div style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              padding: '20px',
              borderRadius: '16px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px -5px rgba(124, 58, 237, 0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>PayPulse Gold</span>
                <div style={{ width: '32px', height: '20px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}></div>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', letterSpacing: '2px', marginBottom: '20px' }}>•••• •••• •••• 4890</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>Jane Doe</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>12/28</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{
        maxWidth: '1200px',
        margin: '0 auto 100px auto',
        padding: '0 20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>Power features for modern life</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>PayPulse includes everything you expect from a premium bank account, and adds features to protect your capital and cards.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          <div className="glass-card" style={{ padding: '30px', borderRadius: '20px' }}>
            <div style={{ background: 'var(--sidebar-active)', color: 'var(--brand-primary)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifySelf: 'left', justifyContent: 'center', marginBottom: '20px' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Instant Transfers</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>Send money across accounts or to other PayPulse users in real time. Validate payments instantly with a personal security PIN.</p>
          </div>

          <div className="glass-card" style={{ padding: '30px', borderRadius: '20px' }}>
            <div style={{ background: 'var(--sidebar-active)', color: 'var(--brand-secondary)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifySelf: 'left', justifyContent: 'center', marginBottom: '20px' }}>
              <CreditCard size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Virtual Card Toggles</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>Issue virtual credit cards, toggle freeze/unfreeze state instantly to block unapproved subscriptions, and adjust limits on the fly.</p>
          </div>

          <div className="glass-card" style={{ padding: '30px', borderRadius: '20px' }}>
            <div style={{ background: 'var(--sidebar-active)', color: 'var(--brand-accent)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifySelf: 'left', justifyContent: 'center', marginBottom: '20px' }}>
              <Shield size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Zero Trust Security</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>Passwords are cryptographically secured. Every money movement demands verification, ensuring your hard-earned funds stay exactly where they belong.</p>
          </div>
        </div>
      </section>

      {/* Security Banner */}
      <section id="security" className="glass-card" style={{
        maxWidth: '1200px',
        margin: '0 auto 100px auto',
        padding: '50px',
        borderRadius: '30px',
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: '40px',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(59, 130, 246, 0.05))'
      }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '20px', letterSpacing: '-0.5px' }}>Your money is protected, always.</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
            PayPulse applies institutional-grade security. Transactions are tracked in real-time, virtual cards shield your real card data online, and accounts are insured up to $250,000.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={18} className="gradient-text" style={{ color: 'var(--brand-primary)' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Federal Deposit Insurance Corporation (FDIC) insured</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={18} className="gradient-text" style={{ color: 'var(--brand-primary)' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Encrypted password hashes and secure API endpoints</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={18} className="gradient-text" style={{ color: 'var(--brand-primary)' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Instant lock settings for virtual cards</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Activity size={180} style={{ color: 'var(--brand-primary)', opacity: 0.2, filter: 'drop-shadow(0 0 40px var(--brand-primary-glow))' }} />
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        borderTop: '1px solid var(--card-border)',
        display: 'flex',
        justifyContent: 'between',
        alignItems: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <p>© 2026 PayPulse Banking Inc. All rights reserved. Demo platform for presentation.</p>
        <div style={{ display: 'flex', gap: '20px', marginLeft: 'auto' }}>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
