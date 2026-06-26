import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Landmark, Check, Users, Sparkles, HelpCircle, Lock, Shield, Award } from 'lucide-react';
import Logo from '../common/Logo';
import Button from '../common/Button';

export default function LandingPage({ onNavigate, theme, toggleTheme }) {
  const [activeFaqIdx, setActiveFaqIdx] = useState(null);

  const faqs = [
    {
      q: "How does the pending transaction queue work?",
      a: "For security, you can toggle between 'Express' and 'Standard' transfers. Standard transfers enter a FIFO (First-In, First-Out) queue that requires administrative approval to settle, protecting your available funds from accidental or fraudulent dispatch."
    },
    {
      q: "Is PayPulse Banking secure?",
      a: "Yes. PayPulse implements cryptographic SHA-256 hashes for passwords and security PINs. The backend architecture separates account dictionary cache tables and database commits, preventing SQL injection vulnerabilities."
    },
    {
      q: "How do I calculate Zakat on my savings?",
      a: "Our system automatically monitors your savings balance. If your balance exceeds the Nisab threshold (PKR 100,000) and Zakat is enabled, you can view the calculated Zakat (2.5% of balance) and deduct it instantly with a single button."
    },
    {
      q: "What are the virtual debit card controls?",
      a: "You can instantly freeze/unfreeze your virtual debit cards to block unapproved transactions, copy card numbers to clipboard, show/hide CVV details, and drag sliders to dynamically adjust transaction limits."
    }
  ];

  const handleToggleFaq = (idx) => {
    setActiveFaqIdx(activeFaqIdx === idx ? null : idx);
  };

  return (
    <div className="landing-page" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', width: '100%', position: 'relative' }}>
      {/* Global Glow Background Elements */}
      <div className="bg-orb orb-one"></div>
      <div className="bg-orb orb-two"></div>

      {/* Top Header Navbar */}
      <header 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10
        }}
      >
        <Logo showText={true} />
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Services</a>
          <a href="#security" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Security</a>
          <a href="#faq" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>FAQs</a>
          <button 
            onClick={toggleTheme} 
            className="btn btn-outline" 
            style={{ padding: '6px 12px', fontSize: '0.8rem', height: '34px' }}
          >
            {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          </button>
          <Button onClick={() => onNavigate('login')} variant="outline" size="sm" style={{ height: '34px' }}>
            Sign In
          </Button>
          <Button onClick={() => onNavigate('signup')} variant="primary" size="sm" style={{ height: '34px' }}>
            Open Account
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section 
        style={{
          maxWidth: '1200px',
          margin: '40px auto 80px auto',
          padding: '0 40px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '40px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(25, 135, 84, 0.08)',
              color: 'var(--brand-primary)',
              padding: '6px 14px',
              borderRadius: '30px',
              fontSize: '0.78rem',
              fontWeight: 600,
              marginBottom: '20px'
            }}
          >
            <ShieldCheck size={14} /> State Bank of Pakistan Compliant
          </div>
          <h1 
            style={{
              fontSize: '3.4rem',
              lineHeight: 1.15,
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '20px',
              letterSpacing: '-1px'
            }}
          >
            The future of digital wealth, <br />
            protected by stability.
          </h1>
          <p 
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1.05rem',
              marginBottom: '32px',
              lineHeight: 1.6,
              maxWidth: '520px'
            }}
          >
            Manage checking, savings, and credit accounts. Dispatch instant express payments or queue transactions securely. Access virtual debit cards with granular spending controls.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Button onClick={() => onNavigate('signup')} variant="primary" style={{ padding: '12px 28px' }}>
              Create Account <ArrowRight size={16} />
            </Button>
            <Button onClick={() => onNavigate('login')} variant="outline" style={{ padding: '12px 28px' }}>
              Access Sandbox
            </Button>
          </div>
        </div>

        {/* Hero Illustration */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div 
            className="card"
            style={{
              width: '100%',
              maxWidth: '380px',
              padding: '30px',
              borderRadius: '20px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--card-shadow-hover)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Logo showText={false} size={28} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PREVIEW PORTAL</span>
            </div>
            
            {/* Account Card Illustration */}
            <div 
              style={{
                backgroundColor: 'var(--brand-secondary)',
                borderRadius: '12px',
                padding: '20px',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.7 }}>Available Checking Funds</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '2px 0 0 0' }}>PKR 142,500.00</h3>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.9 }}>
                <span>Jane Doe</span>
                <span>CID-892013</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Immediate transfers:</span>
                <span style={{ fontWeight: 600, color: 'var(--income-color)' }}>Enabled (Express)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Zakat status:</span>
                <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>Nisab calculation active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Message Banner */}
      <section 
        id="security"
        style={{
          borderTop: '1px solid var(--card-border)',
          borderBottom: '1px solid var(--card-border)',
          backgroundColor: 'var(--bg-secondary)',
          padding: '60px 40px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div 
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '60px',
            alignItems: 'center'
          }}
        >
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Institutional-grade ledger security
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '24px' }}>
              Your financial records are backed by a hybrid database-memory architecture. Hot transaction validations run at O(1) velocity via pre-seeded caches, while assets are logged to SQL databases. Every account freeze, transfer confirmation, and limit shift is protected by individual security PINs.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                <Check size={16} style={{ color: 'var(--brand-primary)' }} /> Cryptographically Encrypted PINs
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                <Check size={16} style={{ color: 'var(--brand-primary)' }} /> Real-time Account Isolation
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                <Check size={16} style={{ color: 'var(--brand-primary)' }} /> Standard Queue Pipelines
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                <Check size={16} style={{ color: 'var(--brand-primary)' }} /> FDIC Insured Assets
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Lock size={120} style={{ color: 'var(--brand-primary)', opacity: 0.1 }} />
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section 
        id="features"
        style={{
          maxWidth: '1200px',
          margin: '80px auto',
          padding: '0 40px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Complete banking suite
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto' }}>
            Everything you expect from an enterprise banking client, integrated into one seamless design system.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: 'rgba(25, 135, 84, 0.05)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Landmark size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>Savings & Zakat Ledgers</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Enable zakat declarations on savings lines. Track balances, calculate thresholds instantly on boot, and manage deductions cleanly.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: 'rgba(10, 37, 64, 0.05)', color: 'var(--brand-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>Virtual Debit Wallets</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Activate multiple debit cards. Configure transactional safety locks, copy card details, and adjust slider limits directly.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: 'rgba(212, 175, 55, 0.05)', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Award size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>P2P Transfer Speeds</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Dispatch funds directly or queue transactions. Create nicknames for beneficiaries and authorize payments via secure PIN codes.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section 
        style={{
          borderTop: '1px solid var(--card-border)',
          backgroundColor: 'rgba(10, 37, 64, 0.02)',
          padding: '60px 40px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div 
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '40px',
            textAlign: 'center'
          }}
        >
          <div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-secondary)', margin: 0 }}>4.8M+</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Customers Nationwide</span>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-primary)', margin: 0 }}>PKR 12.4B</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monthly Transaction Volume Secured</span>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-accent)', margin: 0 }}>99.99%</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>API Core Ledger Uptime</span>
          </div>
        </div>
      </section>

      {/* FAQ Section (Accordion) */}
      <section 
        id="faq"
        style={{
          maxWidth: '800px',
          margin: '80px auto',
          padding: '0 40px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Quick answers to core operations and security procedures.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = activeFaqIdx === idx;
            return (
              <div 
                key={idx}
                style={{
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                <button
                  onClick={() => handleToggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '18px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ color: 'var(--brand-primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div 
                    style={{ 
                      padding: '0 24px 20px 24px', 
                      fontSize: '0.88rem', 
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      borderTop: '1px solid rgba(0,0,0,0.02)'
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Section */}
      <footer 
        style={{
          borderTop: '1px solid var(--card-border)',
          backgroundColor: 'var(--bg-secondary)',
          padding: '40px 40px 20px 40px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div 
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '30px'
          }}
        >
          <Logo showText={true} size={24} />
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span style={{ cursor: 'pointer' }}>Regulatory Information</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Contact Support: 111-PAY-PULSE</span>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '1200px', margin: '0 auto' }}>
          © {new Date().getFullYear()} PayPulse Banking Platform. Licensed by the State Bank of Pakistan. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
