import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Shield, ShieldOff, Check } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function DebitCardWidget({ card, onToggleFreeze, addToast }) {
  const [showNumber, setShowNumber] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!card) {
    return (
      <Card title="Debit Card" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active debit card linked.</span>
      </Card>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(card.card_number);
    setCopied(true);
    if (addToast) addToast('Card number copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const getMaskedNumber = () => {
    if (showNumber) return card.card_number;
    // Show only first 4 and last 4
    const cleaned = card.card_number.replace(/\s+/g, '');
    return `${cleaned.substr(0, 4)} •••• •••• ${cleaned.substr(cleaned.length - 4)}`;
  };

  const isFrozen = card.status === 'frozen';

  return (
    <Card 
      title="Linked Debit Card"
      headerAction={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            onClick={handleCopy} 
            variant="outline" 
            size="sm" 
            style={{ padding: '4px 8px', height: '28px' }}
            title="Copy Card Number"
          >
            {copied ? <Check size={14} style={{ color: 'var(--income-color)' }} /> : <Copy size={14} />}
          </Button>
          <Button 
            onClick={() => setShowNumber(!showNumber)} 
            variant="outline" 
            size="sm" 
            style={{ padding: '4px 8px', height: '28px' }}
            title={showNumber ? 'Hide Details' : 'Show Details'}
          >
            {showNumber ? <EyeOff size={14} /> : <Eye size={14} />}
          </Button>
        </div>
      }
    >
      <div 
        style={{
          background: isFrozen 
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
            : 'linear-gradient(135deg, #0a2540 0%, #113454 100%)',
          padding: '24px',
          borderRadius: '16px',
          color: '#ffffff',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '20px',
          opacity: isFrozen ? 0.75 : 1,
          transition: 'all 0.3s ease'
        }}
      >
        {/* Card design overlay lines */}
        <div 
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '2px solid rgba(255, 255, 255, 0.05)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.6, letterSpacing: '1px' }}>
              PayPulse Premium
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <div 
                style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: isFrozen ? 'var(--expense-color)' : 'var(--income-color)' 
                }} 
              />
              <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                {isFrozen ? 'Card Frozen' : 'Active'}
              </span>
            </div>
          </div>
          {/* Card Brand */}
          <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.5px' }}>
            Visa
          </span>
        </div>

        {/* Chip Graphic */}
        <div 
          style={{ 
            width: '38px', 
            height: '28px', 
            backgroundColor: 'var(--brand-accent)', 
            borderRadius: '6px', 
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #d4af37 0%, #bda031 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)'
          }} 
        />

        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '1.25rem', letterSpacing: '2px', fontFamily: 'monospace' }}>
            {getMaskedNumber()}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '2px' }}>
              Cardholder
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px' }}>
              {card.card_holder}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '2px' }}>
                Expires
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace' }}>
                {card.expiry}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '2px' }}>
                CVV
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace' }}>
                {showNumber ? card.cvv : '•••'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Temporary Card Lockout
        </span>
        <Button 
          onClick={onToggleFreeze} 
          variant={isFrozen ? 'primary' : 'outline'} 
          size="sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {isFrozen ? (
            <>
              <Shield size={14} /> Unfreeze Card
            </>
          ) : (
            <>
              <ShieldOff size={14} /> Freeze Card
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
