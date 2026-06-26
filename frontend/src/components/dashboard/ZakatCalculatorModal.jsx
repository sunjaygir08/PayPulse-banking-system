import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { AlertCircle, HelpCircle } from 'lucide-react';

export default function ZakatCalculatorModal({
  isOpen,
  onClose,
  zakatData,
  onDeduct,
  loading = false,
  deducting = false
}) {
  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 0', gap: '12px' }}>
          <Loader />
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Calculating Zakat liability...</span>
        </div>
      );
    }

    if (!zakatData) return null;

    if (zakatData.zakat_due === 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div>
              <h5 style={{ fontWeight: 700, margin: 0 }}>No Zakat Due</h5>
              <p style={{ fontSize: '0.82rem', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                {zakatData.reason || 'Criteria for Zakat deduction not met for this savings account.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Savings Balance:</span>
              <span style={{ fontWeight: 600 }}>PKR {zakatData.balance ? zakatData.balance.toLocaleString() : '0.00'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Nisab Threshold:</span>
              <span style={{ fontWeight: 600 }}>PKR {zakatData.nisab ? zakatData.nisab.toLocaleString() : '100,000.00'}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div 
          style={{ 
            padding: '16px', 
            borderRadius: '12px', 
            backgroundColor: 'rgba(25, 135, 84, 0.05)',
            border: '1px solid rgba(25, 135, 84, 0.15)',
            display: 'flex',
            gap: '12px',
            color: 'var(--income-color)'
          }}
        >
          <HelpCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <h5 style={{ fontWeight: 700, margin: 0 }}>Zakat Liability Calculated</h5>
            <p style={{ fontSize: '0.82rem', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              Your savings balance is above the Nisab threshold of PKR 100,000. The annual rate of 2.5% is due.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Savings Balance:</span>
            <span style={{ fontWeight: 600 }}>PKR {zakatData.balance.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Deduction Rate:</span>
            <span style={{ fontWeight: 600 }}>2.5%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Calculated Zakat Due:</span>
            <span style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: '1.05rem' }}>
              PKR {zakatData.zakat_due.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const showDeductBtn = zakatData && zakatData.zakat_due > 0 && !loading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Annual Zakat Calculator"
      footer={
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" onClick={onClose} disabled={deducting}>
            Close
          </Button>
          {showDeductBtn && (
            <Button variant="primary" onClick={onDeduct} loading={deducting}>
              Deduct Zakat
            </Button>
          )}
        </div>
      }
    >
      {renderContent()}
    </Modal>
  );
}
