import React from 'react';
import { Calendar, Receipt, Landmark, Check } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function BillCard({ bill, onPay, paying = false }) {
  const isPaid = bill.status === 'paid';
  
  // Custom icons based on provider name
  const getProviderIcon = () => {
    const payee = bill.payee.toLowerCase();
    if (payee.includes('electric') || payee.includes('power')) {
      return <Landmark size={22} style={{ color: 'var(--brand-accent)' }} />;
    } else if (payee.includes('gas') || payee.includes('sui')) {
      return <Landmark size={22} style={{ color: 'var(--brand-primary)' }} />;
    } else {
      return <Receipt size={22} style={{ color: 'var(--brand-secondary)' }} />;
    }
  };

  const formattedAmount = bill.amount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <Card 
      style={{ 
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '180px',
        opacity: isPaid ? 0.8 : 1,
        transition: 'all 0.2s ease',
        backgroundColor: 'var(--card-bg)'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div 
            style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '8px', 
              backgroundColor: isPaid ? 'rgba(0,0,0,0.03)' : 'rgba(10, 37, 64, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {getProviderIcon()}
          </div>
          <Badge status={bill.status} />
        </div>

        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          {bill.payee}
        </h4>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={12} /> Due: {bill.due_date}
        </span>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginTop: '20px', 
          paddingTop: '12px',
          borderTop: '1px solid rgba(0, 0, 0, 0.03)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>
            Amount Due
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            PKR {formattedAmount}
          </span>
        </div>

        {!isPaid ? (
          <Button 
            onClick={() => onPay(bill)} 
            variant="primary" 
            size="sm"
            loading={paying}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Pay Now
          </Button>
        ) : (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              color: 'var(--income-color)', 
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            <Check size={14} /> Settled
          </div>
        )}
      </div>
    </Card>
  );
}
