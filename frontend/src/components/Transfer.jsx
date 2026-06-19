import React, { useState, useEffect } from 'react';
import { Send, ArrowRightLeft, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Transfer({ user, addToast }) {
  const [accounts, setAccounts] = useState([]);
  const [sourceAccount, setSourceAccount] = useState('');
  const [transferType, setTransferType] = useState('external'); // 'internal' | 'external'
  const [destAccount, setDestAccount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('transfer');
  const [note, setNote] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
        if (data.length > 0) {
          setSourceAccount(data[0].id);
          // Set default destination account (different from source if possible)
          if (data.length > 1) {
            setDestAccount(data[1].id);
          } else {
            setDestAccount(data[0].id);
          }
        }
      }
    } catch (error) {
      addToast('Failed to load accounts', 'error');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSourceChange = (e) => {
    const val = e.target.value;
    setSourceAccount(val);
    // Auto-update destination to prevent identical accounts
    if (transferType === 'internal') {
      const alternative = accounts.find(a => String(a.id) !== String(val));
      if (alternative) {
        setDestAccount(alternative.id);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      addToast('Please enter a valid amount', 'info');
      return;
    }

    if (transferType === 'external' && !recipient) {
      addToast('Please enter a recipient email or account number', 'info');
      return;
    }

    if (transferType === 'internal' && String(sourceAccount) === String(destAccount)) {
      addToast('Source and destination accounts must be different', 'info');
      return;
    }

    setLoading(false);
    try {
      const recipientIdentifier = transferType === 'internal' 
        ? accounts.find(a => String(a.id) === String(destAccount))?.account_number
        : recipient;

      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_account_id: parseInt(sourceAccount),
          recipient_identifier: recipientIdentifier,
          amount: parseFloat(amount),
          category: category,
          note: note,
          security_pin: securityPin
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Transfer failed');
      }

      addToast('Transfer successfully processed!', 'success');
      
      // Reset form
      setAmount('');
      setNote('');
      setSecurityPin('');
      setRecipient('');
      
      // Refresh balances
      fetchAccounts();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Transfer Funds</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Send money instantly between your accounts or to someone else.</p>
      </div>

      <div className="glass-card" style={{ padding: '40px', borderRadius: '24px' }}>
        {/* Toggle Transfer Type */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          padding: '4px',
          background: 'var(--input-bg)',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '1px solid var(--card-border)'
        }}>
          <button
            type="button"
            onClick={() => setTransferType('external')}
            style={{
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              background: transferType === 'external' ? 'var(--bg-secondary)' : 'transparent',
              color: transferType === 'external' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Send size={16} /> External Recipient
          </button>
          <button
            type="button"
            onClick={() => {
              setTransferType('internal');
              // Set destination to first alternative
              const alt = accounts.find(a => String(a.id) !== String(sourceAccount));
              if (alt) setDestAccount(alt.id);
            }}
            style={{
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              background: transferType === 'internal' ? 'var(--bg-secondary)' : 'transparent',
              color: transferType === 'internal' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <ArrowRightLeft size={16} /> Between My Accounts
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Source Account */}
          <div className="form-group">
            <label>From Account</label>
            <select 
              className="form-input"
              value={sourceAccount}
              onChange={handleSourceChange}
              required
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_type.toUpperCase()} Account — ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({acc.account_number})
                </option>
              ))}
            </select>
          </div>

          {/* Destination Selector */}
          {transferType === 'internal' ? (
            <div className="form-group">
              <label>To Account</label>
              <select 
                className="form-input"
                value={destAccount}
                onChange={(e) => setDestAccount(e.target.value)}
                required
              >
                {accounts.filter(a => String(a.id) !== String(sourceAccount)).map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_type.toUpperCase()} Account — ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({acc.account_number})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label>Recipient Email or Account Number</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter email address or 10-digit account number" 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
            </div>
          )}

          {/* Amount and Category */}
          <div className="form-row">
            <div className="form-group">
              <label>Amount ($)</label>
              <input 
                type="number" 
                step="0.01" 
                min="0.01" 
                className="form-input" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select 
                className="form-input" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="transfer">Transfer</option>
                <option value="food">Food & Dining</option>
                <option value="bills">Bills & Utilities</option>
                <option value="shopping">Shopping</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          {/* Note */}
          <div className="form-group">
            <label>Note / Reference (Optional)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Rent payment, dinner split, etc." 
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Verification Box */}
          <div style={{
            background: 'var(--sidebar-active)',
            border: '1px solid var(--brand-primary-glow)',
            padding: '20px',
            borderRadius: '16px',
            marginTop: '24px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
              <ShieldCheck size={20} style={{ color: 'var(--brand-primary)' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Security Verification Required</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Please enter your 4-digit Security PIN to authenticate this transaction. This PIN was set up during registration.
            </p>
            <div className="form-group" style={{ margin: 0 }}>
              <input 
                type="password" 
                maxLength={4}
                pattern="[0-9]{4}"
                placeholder="••••"
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                className="form-input"
                style={{ width: '100px', textAlign: 'center', letterSpacing: '6px', fontFamily: 'var(--font-mono)' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '14px' }}
            disabled={loading}
          >
            {loading ? 'Processing Transfer...' : 'Confirm and Send Funds'}
          </button>
        </form>
      </div>
    </div>
  );
}
