import React, { useState, useEffect } from 'react';
import { CreditCard, Eye, EyeOff, Lock, Unlock, Plus, Save, Copy } from 'lucide-react';

export default function VirtualCards({ user, addToast }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [showDetailsId, setShowDetailsId] = useState(null);

  // New Card Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [cardType, setCardType] = useState('visa');
  const [cardTheme, setCardTheme] = useState('indigo');
  const [cardLimit, setCardLimit] = useState(1000);

  // Local limit edit states
  const [editingLimitId, setEditingLimitId] = useState(null);
  const [localLimitVal, setLocalLimitVal] = useState(0);

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/cards');
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
      }
    } catch (error) {
      addToast('Failed to load virtual cards', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleToggleFreeze = async (cardId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'frozen' : 'active';
      const response = await fetch('/api/cards/toggle-freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId, status: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update card status');
      }

      addToast(
        newStatus === 'frozen' ? 'Card frozen. Online payments are disabled.' : 'Card activated successfully!',
        newStatus === 'frozen' ? 'info' : 'success'
      );
      fetchCards();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleSaveLimit = async (cardId) => {
    try {
      const response = await fetch('/api/cards/update-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: cardId, limit_amount: parseFloat(localLimitVal) })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update card limit');
      }

      addToast('Spending limit updated successfully!', 'success');
      setEditingLimitId(null);
      fetchCards();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/cards/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: cardType,
          limit_amount: parseFloat(cardLimit),
          color_theme: cardTheme
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create card');
      }

      addToast('Virtual card issued successfully!', 'success');
      setShowAddForm(false);
      fetchCards();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const copyCardNumber = (e, num) => {
    e.stopPropagation(); // Stop flip trigger
    navigator.clipboard.writeText(num);
    addToast('Card number copied to clipboard', 'success');
  };

  const toggleFlip = (cardId) => {
    setFlippedCardId(flippedCardId === cardId ? null : cardId);
  };

  const toggleShowDetails = (e, cardId) => {
    e.stopPropagation(); // Stop flip trigger
    setShowDetailsId(showDetailsId === cardId ? null : cardId);
  };

  const getThemeBackground = (theme) => {
    switch (theme) {
      case 'indigo': return 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)';
      case 'violet': return 'linear-gradient(135deg, #5b21b6 0%, #3b0764 100%)';
      case 'rose': return 'linear-gradient(135deg, #881337 0%, #4c0519 100%)';
      case 'emerald': return 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)';
      case 'ocean': return 'linear-gradient(135deg, #164e63 0%, #083344 100%)';
      default: return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
    }
  };

  const formatCardNumber = (num, show) => {
    if (show) return num;
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Virtual Cards</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Instantly issue, freeze, and manage disposable card tokens for online shopping.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px' }}
        >
          <Plus size={16} /> New Card
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: showAddForm ? '2fr 1.1fr' : '1fr',
        gap: '30px',
        alignItems: 'start'
      }}>
        
        {/* Card List Container */}
        <div className="glass-card" style={{ padding: '30px', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px' }}>Your Virtual Wallet</h2>
          
          {cards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
              No virtual cards active. Click 'New Card' to generate one.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
              {cards.map((card) => {
                const isFlipped = flippedCardId === card.id;
                const isShowing = showDetailsId === card.id;
                const isFrozen = card.status === 'frozen';
                const spendPercentage = (card.spent_amount / card.limit_amount) * 100;

                return (
                  <div key={card.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* 3D Flip Card Container */}
                    <div className="card-wrapper" onClick={() => toggleFlip(card.id)}>
                      <div className={`credit-card ${isFlipped ? 'flipped' : ''}`}>
                        {/* Front Side */}
                        <div 
                          className="card-face card-front" 
                          style={{ background: getThemeBackground(card.color_theme) }}
                        >
                          {isFrozen && <div className="card-frozen-watermark">FROZEN</div>}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', letterSpacing: '1px', opacity: 0.85 }}>PayPulse Virtual</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{card.type}</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div className="card-chip"></div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={(e) => toggleShowDetails(e, card.id)} 
                                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', color: 'white', padding: '6px', cursor: 'pointer' }}
                              >
                                {isShowing ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                              <button 
                                onClick={(e) => copyCardNumber(e, card.card_number)} 
                                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', color: 'white', padding: '6px', cursor: 'pointer' }}
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="card-number">
                            {formatCardNumber(card.card_number, isShowing)}
                          </div>

                          <div className="card-footer">
                            <div>
                              <p className="card-expiry-label">Card Holder</p>
                              <p className="card-holder">{card.card_holder}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p className="card-expiry-label">Expires</p>
                              <p className="card-expiry">{card.expiry}</p>
                            </div>
                          </div>
                        </div>

                        {/* Back Side */}
                        <div className="card-face card-back" style={{ background: getThemeBackground(card.color_theme) }}>
                          <div className="card-magnetic-strip"></div>
                          <div style={{ padding: '0 10px', marginTop: '10px' }}>
                            <div className="card-signature-area">
                              <span style={{ fontSize: '0.65rem', marginRight: '10px', opacity: 0.7 }}>CVV2</span>
                              <span className="card-cvv">{isShowing ? card.cvv : '•••'}</span>
                            </div>
                            <p style={{ fontSize: '0.55rem', opacity: 0.7, marginTop: '20px', lineHeight: 1.4 }}>
                              This token is a virtual debit/credit instrument issued for sandbox simulations. Authorized signature is not required. Keep details secure.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Panel */}
                    <div style={{ padding: '0 10px' }}>
                      {/* Freeze toggle and Flip guide */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click card to flip</span>
                        <button
                          onClick={() => handleToggleFreeze(card.id, card.status)}
                          className="btn-secondary"
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: isFrozen ? 'var(--income-green)' : 'var(--expense-red)'
                          }}
                        >
                          {isFrozen ? <Unlock size={14} /> : <Lock size={14} />}
                          {isFrozen ? 'Activate Card' : 'Freeze Card'}
                        </button>
                      </div>

                      {/* Limit Progress and adjustment */}
                      <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', padding: '16px', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Monthly Limit</span>
                          <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                            PKR {card.spent_amount.toLocaleString()} / PKR {card.limit_amount.toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Progress slider */}
                        <div style={{ background: 'var(--bg-primary)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                          <div style={{
                            background: isFrozen ? 'var(--text-muted)' : 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))',
                            width: `${Math.min(spendPercentage, 100)}%`,
                            height: '100%'
                          }} />
                        </div>

                        {/* Adjust limit slider toggles */}
                        {editingLimitId === card.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <input 
                                type="range" 
                                min={500} 
                                max={5000} 
                                step={100}
                                value={localLimitVal}
                                onChange={(e) => setLocalLimitVal(e.target.value)}
                                style={{ flex: 1, accentColor: 'var(--brand-primary)' }}
                              />
                              <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', minWidth: '80px' }}>PKR {localLimitVal}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleSaveLimit(card.id)}
                                className="btn-primary" 
                                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', flex: 1 }}
                              >
                                <Save size={12} /> Save Limit
                              </button>
                              <button 
                                onClick={() => setEditingLimitId(null)}
                                className="btn-secondary" 
                                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingLimitId(card.id);
                              setLocalLimitVal(card.limit_amount);
                            }}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', width: '100%' }}
                            disabled={isFrozen}
                          >
                            Adjust Card Spending Limit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Generate Virtual Card Side Form */}
        {showAddForm && (
          <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Generate Virtual Token</h3>
            <form onSubmit={handleCreateCard}>
              <div className="form-group">
                <label>Card Issuer Network</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setCardType('visa')}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px',
                      border: '1px solid',
                      borderColor: cardType === 'visa' ? 'var(--brand-primary)' : 'var(--input-border)',
                      background: cardType === 'visa' ? 'var(--sidebar-active)' : 'var(--input-bg)',
                      color: cardType === 'visa' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Visa
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardType('mastercard')}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px',
                      border: '1px solid',
                      borderColor: cardType === 'mastercard' ? 'var(--brand-primary)' : 'var(--input-border)',
                      background: cardType === 'mastercard' ? 'var(--sidebar-active)' : 'var(--input-bg)',
                      color: cardType === 'mastercard' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Mastercard
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Card Color & Pattern</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['indigo', 'violet', 'rose', 'emerald', 'ocean'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCardTheme(c)}
                      style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: getThemeBackground(c),
                        border: '2px solid',
                        borderColor: cardTheme === c ? '#ffffff' : 'transparent',
                        cursor: 'pointer',
                        boxShadow: cardTheme === c ? '0 0 8px rgba(255,255,255,0.8)' : 'none'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Monthly Spending Limit (PKR)</label>
                <input 
                  type="number" 
                  min={100} 
                  max={10000} 
                  step={100}
                  className="form-input"
                  value={cardLimit}
                  onChange={(e) => setCardLimit(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Limits can be adjusted later at any time.</span>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                Issue Card Token
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
