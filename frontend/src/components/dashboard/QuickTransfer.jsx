import React from 'react';
import { Send, DollarSign, User } from 'lucide-react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';

export default function QuickTransfer({
  recipient,
  setRecipient,
  amount,
  setAmount,
  onSubmit,
  loading = false,
  beneficiaries = []
}) {
  return (
    <Card title="Quick Transfer">
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Input
          label="Recipient Account / Email"
          placeholder="Enter account number or email"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          icon={User}
          required
        />
        
        {beneficiaries.length > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Select Beneficiary Shortcut:
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {beneficiaries.slice(0, 3).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setRecipient(b.account_number)}
                  style={{
                    background: 'rgba(0, 0, 0, 0.03)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.borderColor = 'var(--brand-primary)'}
                  onMouseLeave={(e) => e.target.style.borderColor = 'var(--card-border)'}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Transfer Amount (PKR)"
          placeholder="0.00"
          type="number"
          step="0.01"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          icon={DollarSign}
          required
        />

        <Button 
          type="submit" 
          variant="primary" 
          loading={loading}
          style={{ width: '100%', marginTop: '10px' }}
        >
          <Send size={16} /> Send Funds
        </Button>
      </form>
    </Card>
  );
}
