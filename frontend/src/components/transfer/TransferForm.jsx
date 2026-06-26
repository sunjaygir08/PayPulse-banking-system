import React, { useState } from 'react';
import { Send, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

export default function TransferForm({ 
  accounts = [], 
  selectedAccId,
  setSelectedAccId,
  recipient,
  setRecipient,
  amount,
  setAmount,
  category,
  setCategory,
  note,
  setNote,
  securityPin,
  setSecurityPin,
  isExpress,
  setIsExpress,
  onSubmit,
  loading = false
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const activeAccount = accounts.find(a => String(a.id) === String(selectedAccId)) || null;

  const handleSubmitAttempt = (e) => {
    e.preventDefault();
    if (!selectedAccId || !recipient || !amount || !securityPin) return;
    
    // Check frozen
    if (activeAccount && activeAccount.status === 'frozen') {
      alert('Source account is frozen. Transfers are disabled.');
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSend = () => {
    setShowConfirm(false);
    onSubmit();
  };

  const formattedAmount = amount ? parseFloat(amount).toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) : '0.00';

  return (
    <Card title="P2P Fund Dispatcher">
      {!showConfirm ? (
        <form onSubmit={handleSubmitAttempt} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Source account select */}
          <div style={{ marginBottom: '14px' }}>
            <label className="form-label">Debit Source Account</label>
            <select
              value={selectedAccId}
              onChange={(e) => setSelectedAccId(e.target.value)}
              className="form-input"
              required
            >
              <option value="">-- Choose Account --</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_type.toUpperCase()} ({acc.account_number}) - PKR {acc.available_balance.toLocaleString()} Available
                </option>
              ))}
            </select>
          </div>

          {/* Toggle standard / express */}
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Processing Channel Speed</label>
            <div style={{ display: 'flex', border: '1px solid var(--card-border)', borderRadius: '12px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setIsExpress(true)}
                style={{
                  flexGrow: 1,
                  padding: '10px',
                  background: isExpress ? 'var(--brand-primary)' : 'transparent',
                  color: isExpress ? '#ffffff' : 'var(--text-primary)',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Express (Instant Ledger)
              </button>
              <button
                type="button"
                onClick={() => setIsExpress(false)}
                style={{
                  flexGrow: 1,
                  padding: '10px',
                  background: !isExpress ? 'var(--brand-primary)' : 'transparent',
                  color: !isExpress ? '#ffffff' : 'var(--text-primary)',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Standard (FIFO Queued)
              </button>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px', lineHeight: 1.3 }}>
              {isExpress 
                ? '⚡ Express processing executes instantly. Reversals can only be initiated by system administrators.' 
                : '⏳ Standard transactions lock Available Funds, but only execute upon Admin Dashboard approval.'
              }
            </span>
          </div>

          {/* Recipient */}
          <Input
            label="Recipient Account / Email"
            placeholder="Enter account number or registered email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />

          {/* Amount */}
          <Input
            label="Transfer Amount (PKR)"
            placeholder="0.00"
            type="number"
            step="0.01"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div className="form-row">
            {/* Category select */}
            <div style={{ marginBottom: '14px' }}>
              <label className="form-label">Transfer Purpose</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
              >
                <option value="transfer">General Transfer</option>
                <option value="utilities">Utility bill reimbursals</option>
                <option value="zakat">Charitable Zakat dispatch</option>
              </select>
            </div>

            {/* PIN */}
            <Input
              label="4-Digit Security PIN"
              type="password"
              placeholder="••••"
              maxLength={4}
              value={securityPin}
              onChange={(e) => setSecurityPin(e.target.value)}
              required
            />
          </div>

          {/* Note */}
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Transaction Memo</label>
            <textarea
              className="form-input"
              placeholder="Add details / memo"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ minHeight: '60px', resize: 'vertical' }}
            />
          </div>

          <Button type="submit" variant="primary" style={{ width: '100%' }}>
            <Send size={16} /> Proceed to Dispatch
          </Button>
        </form>
      ) : (
        /* Confirmation screen details */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
          <div 
            style={{ 
              padding: '16px', 
              borderRadius: '12px', 
              backgroundColor: 'rgba(255, 193, 7, 0.05)',
              border: '1px solid rgba(255, 193, 7, 0.15)',
              display: 'flex',
              gap: '12px',
              color: '#997300'
            }}
          >
            <ShieldCheck size={24} style={{ flexShrink: 0 }} />
            <div>
              <h5 style={{ fontWeight: 700, margin: 0 }}>Review Transaction Details</h5>
              <p style={{ fontSize: '0.82rem', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                Please confirm that the recipient account and funds requested are correct before authorizing.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Debit From:</span>
              <span style={{ fontWeight: 600 }}>{activeAccount?.account_type.toUpperCase()} ({activeAccount?.account_number})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Credit Recipient:</span>
              <span style={{ fontWeight: 600 }}>{recipient}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Channel Speed:</span>
              <span style={{ fontWeight: 600 }}>{isExpress ? 'Express (Instant)' : 'Standard (Queued)'}</span>
            </div>
            {note && (
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Note Memo:</span>
                <span style={{ fontWeight: 600 }}>{note}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Total Dispatch Amount:</span>
              <span style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: '1.1rem' }}>
                PKR {formattedAmount}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <Button variant="outline" onClick={() => setShowConfirm(false)} style={{ flexGrow: 1 }} disabled={loading}>
              Back to Form
            </Button>
            <Button variant="primary" onClick={handleConfirmSend} loading={loading} style={{ flexGrow: 1 }}>
              Confirm & Send
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
