import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Save, Copy, Check, Eye, EyeOff, ShieldOff, Shield } from 'lucide-react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Loader from '../common/Loader';
import Badge from '../common/Badge';

export default function VirtualCards({ user, addToast }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // New Card Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [cardType, setCardType] = useState('visa');
  const [cardTheme, setCardTheme] = useState('navy');
  const [cardLimit, setCardLimit] = useState(5000);

  // Show details toggles (per card ID)
  const [showDetailsIds, setShowDetailsIds] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Slider local edit states
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
      addToast('Failed to load virtual cards.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleToggleFreeze = async (card) => {
    const newStatus = card.status === 'active' ? 'frozen' : 'active';
    try {
      const response = await fetch('/api/cards/toggle-freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: card.id, status: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update card status');
      }

      addToast(
        newStatus === 'frozen' ? 'Card frozen. Online transactions blocked.' : 'Card activated.',
        newStatus === 'frozen' ? 'info' : 'success'
      );
      fetchCards();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleSaveLimit = async (cardId) => {
    setActionLoading(true);
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

      addToast('Card spending limit updated.', 'success');
      setEditingLimitId(null);
      fetchCards();
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCardSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
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
      if (!response.ok) throw new Error(data.error || 'Failed to create card');

      addToast('New virtual card created.', 'success');
      setShowAddForm(false);
      setCardLimit(5000);
      fetchCards();
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyCardNum = (cardId, num) => {
    navigator.clipboard.writeText(num);
    setCopiedId(cardId);
    addToast('Card number copied.', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleDetails = (cardId) => {
    setShowDetailsIds(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const getMaskedNumber = (cardId, fullNum) => {
    if (showDetailsIds[cardId]) return fullNum;
    const cleaned = fullNum.replace(/\s+/g, '');
    return `${cleaned.substr(0, 4)} •••• •••• ${cleaned.substr(cleaned.length - 4)}`;
  };

  const getCardThemeBackground = (themeName) => {
    switch (themeName) {
      case 'green':
        return 'linear-gradient(135deg, #0f5132 0%, #198754 100%)';
      case 'gold':
        return 'linear-gradient(135deg, #997300 0%, #d4af37 100%)';
      case 'indigo':
        return 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 100%)';
      case 'navy':
      default:
        return 'linear-gradient(135deg, #0a2540 0%, #113454 100%)';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Virtual Credit & Debit Cards
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Configure spending limits and security freezes instantly on your digital wallets.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} /> {showAddForm ? 'Cancel Creation' : 'Order New Card'}
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px' }}>
        
        {/* Left Column: Visual cards list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {cards.length === 0 ? (
            <Card style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No virtual cards active. Click "Order New Card" to provision one.
            </Card>
          ) : (
            cards.map((card) => {
              const isFrozen = card.status === 'frozen';
              const show = showDetailsIds[card.id] || false;
              const isEditing = editingLimitId === card.id;

              return (
                <Card 
                  key={card.id}
                  title={`${card.type.toUpperCase()} Card (${card.card_number.substr(-4)})`}
                  headerAction={
                    <Badge status={card.status}>
                      {card.status}
                    </Badge>
                  }
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'center' }}>
                    {/* Visual Card component */}
                    <div 
                      style={{
                        background: isFrozen ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' : getCardThemeBackground(card.color_theme),
                        padding: '20px',
                        borderRadius: '16px',
                        color: '#ffffff',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                        position: 'relative',
                        overflow: 'hidden',
                        opacity: isFrozen ? 0.75 : 1,
                        transition: 'all 0.3s ease',
                        minHeight: '190px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.6, letterSpacing: '0.5px' }}>
                            PayPulse Virtual
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', textTransform: 'capitalize' }}>
                            {card.type} Card
                          </span>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '1rem' }}>Visa</span>
                      </div>

                      {/* Masked Card Number */}
                      <span style={{ fontSize: '1.15rem', letterSpacing: '1.5px', fontFamily: 'monospace', display: 'block', margin: '20px 0' }}>
                        {getMaskedNumber(card.id, card.card_number)}
                      </span>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.8rem' }}>
                        <div>
                          <span style={{ fontSize: '0.6rem', opacity: 0.5, display: 'block' }}>Cardholder</span>
                          <span style={{ fontWeight: 600 }}>{card.card_holder}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div>
                            <span style={{ fontSize: '0.6rem', opacity: 0.5, display: 'block' }}>Expiry</span>
                            <span style={{ fontFamily: 'monospace' }}>{card.expiry}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.6rem', opacity: 0.5, display: 'block' }}>CVV</span>
                            <span style={{ fontFamily: 'monospace' }}>{show ? card.cvv : '•••'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Controls Actions Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleDetails(card.id)}
                          style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '34px' }}
                        >
                          {show ? <EyeOff size={14} /> : <Eye size={14} />} {show ? 'Hide Details' : 'Show Details'}
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCopyCardNum(card.id, card.card_number)}
                          style={{ padding: '0 10px', height: '34px' }}
                          title="Copy Card Number"
                        >
                          {copiedId === card.id ? <Check size={14} style={{ color: 'var(--income-color)' }} /> : <Copy size={14} />}
                        </Button>
                      </div>

                      <Button 
                        onClick={() => handleToggleFreeze(card)}
                        variant={isFrozen ? 'primary' : 'outline'}
                        size="sm"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '34px' }}
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

                      {/* Limit Display and Slider */}
                      <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '10px', marginTop: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Spent:</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            PKR {card.spent_amount.toLocaleString()} / {isEditing ? localLimitVal : card.limit_amount.toLocaleString()} Limit
                          </span>
                        </div>

                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                              type="range"
                              min="1000"
                              max="100000"
                              step="1000"
                              value={localLimitVal}
                              onChange={(e) => setLocalLimitVal(e.target.value)}
                              style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                            />
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setEditingLimitId(null)}
                                style={{ flexGrow: 1, padding: '4px', height: '24px', fontSize: '0.72rem' }}
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => handleSaveLimit(card.id)}
                                loading={actionLoading}
                                style={{ flexGrow: 1, padding: '4px', height: '24px', fontSize: '0.72rem' }}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingLimitId(card.id);
                              setLocalLimitVal(card.limit_amount);
                            }}
                            style={{ width: '100%', padding: '4px', height: '26px', fontSize: '0.75rem' }}
                          >
                            Adjust Spending Limit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Right Column: Add Card Form */}
        <div>
          {showAddForm && (
            <Card title="Provision Virtual Card">
              <form onSubmit={handleCreateCardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="form-label">Select Card Network</label>
                  <select
                    className="form-input"
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value)}
                  >
                    <option value="visa">Visa Platinum Card</option>
                    <option value="mastercard">Mastercard World Elite</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="form-label">Select Graphical Theme</label>
                  <select
                    className="form-input"
                    value={cardTheme}
                    onChange={(e) => setCardTheme(e.target.value)}
                  >
                    <option value="navy">Enterprise Navy (Default)</option>
                    <option value="green">Crescent Emerald Green</option>
                    <option value="gold">Metallic Royal Gold</option>
                    <option value="indigo">Obsidian Violet Indigo</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="form-label">Card Limit: PKR {parseInt(cardLimit).toLocaleString()}</label>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={cardLimit}
                    onChange={(e) => setCardLimit(e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--brand-primary)', marginBottom: '6px' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    * Virtual cards pull funds dynamically from checking balances up to this limit threshold.
                  </span>
                </div>

                <Button type="submit" variant="primary" loading={actionLoading} style={{ width: '100%', marginTop: '8px' }}>
                  Order Digital Card
                </Button>
              </form>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
