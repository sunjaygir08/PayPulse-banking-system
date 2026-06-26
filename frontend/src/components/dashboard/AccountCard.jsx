import React from 'react';
import { Landmark, ArrowUpRight, ArrowDownLeft, Shield } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function AccountCard({ account, isSelected, onSelect }) {
  if (!account) return null;

  const getAccountTypeLabel = () => {
    switch (account.account_type) {
      case 'checking': return 'Checking Account';
      case 'savings': return 'Savings Account';
      case 'credit': return 'Credit Card Account';
      default: return 'Bank Account';
    }
  };

  const getIcon = () => {
    switch (account.account_type) {
      case 'checking':
        return <Landmark size={22} style={{ color: 'var(--brand-primary)' }} />;
      case 'savings':
        return <Shield size={22} style={{ color: 'var(--brand-accent)' }} />;
      case 'credit':
        return <Landmark size={22} style={{ color: 'var(--brand-secondary)' }} />;
      default:
        return <Landmark size={22} />;
    }
  };

  const formattedBalance = account.balance.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const formattedAvailable = account.available_balance ? account.available_balance.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) : formattedBalance;

  return (
    <Card
      onClick={onSelect}
      className={`account-card ${isSelected ? 'active' : ''}`}
      style={{
        border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--card-border)',
        boxShadow: isSelected ? 'var(--card-shadow-hover)' : 'var(--card-shadow)',
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        backgroundColor: 'var(--card-bg)',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {getIcon()}
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {getAccountTypeLabel()}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Acc: {account.account_number}
            </span>
          </div>
        </div>
        <Badge status={account.status === 'frozen' ? 'frozen' : 'active'}>
          {account.status}
        </Badge>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Current Balance
        </span>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', fontFamily: 'var(--font-sans)' }}>
          PKR {formattedBalance}
        </h3>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          paddingTop: '10px', 
          borderTop: '1px solid rgba(0, 0, 0, 0.04)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}
      >
        <span>Available Funds:</span>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          PKR {formattedAvailable}
        </span>
      </div>
    </Card>
  );
}
