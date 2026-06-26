import React from 'react';
import { Check, X, RefreshCw, Layers } from 'lucide-react';
import Card from '../common/Card';
import Table from '../common/Table';
import Button from '../common/Button';

export default function QueueManager({ 
  queue = [], 
  onProcess, 
  onReject, 
  processing = false,
  refreshing = false,
  onRefresh 
}) {
  return (
    <Card 
      title="Pending Transaction Queue (FIFO)"
      headerAction={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            disabled={refreshing}
            style={{ padding: '4px 8px', height: '28px' }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={onProcess} 
            disabled={queue.length === 0 || processing}
            style={{ padding: '4px 10px', height: '28px', fontSize: '0.8rem' }}
          >
            Process Next
          </Button>
        </div>
      }
    >
      <Table
        headers={['ID', 'Sender', 'Recipient', 'Category', 'Amount', 'Date & Time', 'Action']}
        rows={queue}
        emptyMessage="Pending transaction approval queue is empty."
        renderRow={(req) => {
          const dateObj = new Date(req.created_at);
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
          const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

          return (
            <>
              <td>
                <span style={{ fontWeight: 600 }}>{req.id}</span>
              </td>
              <td>
                <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{req.sender_account_number}</span>
              </td>
              <td>
                <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{req.recipient_account_number}</span>
              </td>
              <td>
                <span style={{ textTransform: 'capitalize', fontSize: '0.82rem' }}>{req.category || req.type}</span>
              </td>
              <td>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  PKR {req.amount.toLocaleString()}
                </span>
              </td>
              <td>
                <span style={{ display: 'block', fontSize: '0.82rem' }}>{formattedDate}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formattedTime}</span>
              </td>
              <td>
                <Button 
                  onClick={() => onReject(req.id)} 
                  variant="outline" 
                  size="sm" 
                  style={{ 
                    padding: '4px 8px', 
                    height: '26px', 
                    color: 'var(--expense-color)', 
                    borderColor: 'rgba(220, 53, 69, 0.15)',
                    backgroundColor: 'rgba(220, 53, 69, 0.02)'
                  }}
                  title="Reject Transaction"
                >
                  <X size={14} /> Reject
                </Button>
              </td>
            </>
          );
        }}
      />
      <div 
        style={{ 
          marginTop: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontSize: '0.78rem',
          color: 'var(--text-secondary)'
        }}
      >
        <Layers size={14} style={{ color: 'var(--brand-primary)' }} />
        <span>Transactions are enqueued FIFO. Available balances are locked immediately to prevent double spending.</span>
      </div>
    </Card>
  );
}
