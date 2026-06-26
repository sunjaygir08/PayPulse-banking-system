import React from 'react';
import { CheckCircle, Printer, ArrowLeft, Landmark } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function TransferSuccessScreen({ 
  receipt, 
  onReset 
}) {
  const handlePrintMock = () => {
    window.print();
  };

  const formattedAmount = receipt?.amount ? parseFloat(receipt.amount).toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) : '0.00';

  return (
    <Card 
      style={{ 
        maxWidth: '520px', 
        margin: '20px auto', 
        padding: '36px',
        textAlign: 'center',
        boxShadow: 'var(--card-shadow-hover)',
        borderRadius: '16px'
      }}
    >
      <div 
        style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(25, 135, 84, 0.08)',
          color: 'var(--income-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}
      >
        <CheckCircle size={36} />
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
        Transaction Authorized
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '30px' }}>
        Your funds transfer request has been submitted successfully to the ledger.
      </p>

      {/* Details Box */}
      <div 
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.01)', 
          border: '1px solid var(--card-border)', 
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'left',
          fontSize: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '30px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '6px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
          <span style={{ fontWeight: 600, color: 'var(--income-color)' }}>
            {receipt?.status === 'queued' ? 'PENDING QUEUE APPROVAL' : 'SUCCESSFUL'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '6px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Credit Recipient:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{receipt?.recipient}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '6px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Category Purp:</span>
          <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{receipt?.category}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '6px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Date & Time:</span>
          <span style={{ fontWeight: 600 }}>{new Date().toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Amount Transferred:</span>
          <span style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: '1.05rem' }}>
            PKR {formattedAmount}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button variant="outline" onClick={handlePrintMock} style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Printer size={16} /> Print Receipt
        </Button>
        <Button variant="primary" onClick={onReset} style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Make Another
        </Button>
      </div>
    </Card>
  );
}
