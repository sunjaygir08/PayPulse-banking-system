import React from 'react';
import { Calendar, Receipt } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function QuickBillPayment({ bills = [], onPayClick }) {
  // Only display pending bills on the dashboard quick section
  const pendingBills = bills.filter((b) => b.status === 'pending').slice(0, 3);

  return (
    <Card 
      title="Upcoming Bills"
      headerAction={
        pendingBills.length > 0 && (
          <Badge status="pending">
            {pendingBills.length} Due
          </Badge>
        )
      }
    >
      {pendingBills.length === 0 ? (
        <div style={{ padding: '20px 0', textAlignment: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No pending bill invoices due.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pendingBills.map((bill) => (
            <div
              key={bill.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.005)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div 
                  style={{ 
                    width: '34px', 
                    height: '34px', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(255, 193, 7, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--warning-color)'
                  }}
                >
                  <Receipt size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {bill.payee}
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> Due: {bill.due_date}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                  PKR {bill.amount.toLocaleString()}
                </span>
                <button
                  onClick={() => onPayClick(bill)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '2px 0',
                    marginTop: '2px',
                    textDecoration: 'underline'
                  }}
                >
                  Pay Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
