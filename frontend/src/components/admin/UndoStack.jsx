import React from 'react';
import { RotateCcw, HelpCircle, ArrowUpRight, ArrowDownLeft, Receipt, Landmark } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function UndoStack({ 
  logs = [], 
  stackSize = 0, 
  onUndo, 
  undoing = false 
}) {
  // Find latest completed valid transactions that are NOT undone
  const undoableTransactions = logs.filter(l => l.is_undone === 0 && l.type !== 'undo' && l.type !== 'charge').slice(0, 3);
  const nextUndoTx = undoableTransactions[0] || null;

  const getTransactionIcon = (type, category) => {
    if (type === 'deposit') {
      return <ArrowDownLeft size={16} style={{ color: 'var(--income-color)' }} />;
    }
    switch (category?.toLowerCase()) {
      case 'utilities': return <Receipt size={16} style={{ color: 'var(--warning-color)' }} />;
      case 'transfer': return <ArrowUpRight size={16} style={{ color: 'var(--brand-secondary)' }} />;
      case 'zakat': return <Landmark size={16} style={{ color: 'var(--brand-accent)' }} />;
      default: return <HelpCircle size={16} />;
    }
  };

  return (
    <Card 
      title="Transaction Reversal Stack (LIFO)"
      headerAction={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge status={stackSize > 0 ? 'active' : 'frozen'}>
            Depth: {stackSize}
          </Badge>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={onUndo} 
            disabled={stackSize === 0 || undoing}
            style={{ padding: '4px 10px', height: '28px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RotateCcw size={13} /> Rollback Last
          </Button>
        </div>
      }
    >
      {nextUndoTx ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div 
            style={{ 
              padding: '14px', 
              borderRadius: '12px', 
              border: '1px dashed var(--expense-color)', 
              backgroundColor: 'rgba(220, 53, 69, 0.01)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Next Stack Item to Revert:
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getTransactionIcon(nextUndoTx.type, nextUndoTx.category)}
                </div>
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>
                    {nextUndoTx.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Ref: TXN-{String(nextUndoTx.id).padStart(6, '0')}
                  </span>
                </div>
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: nextUndoTx.amount < 0 ? 'var(--expense-color)' : 'var(--income-color)' }}>
                {nextUndoTx.amount < 0 ? '-' : '+'} PKR {Math.abs(nextUndoTx.amount).toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            💡 Clicking <strong>Rollback Last</strong> will pop this transaction from the stack, reverse all balance updates, and restore checking/savings balances.
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px 0', textAlignment: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No undoable transactions present in stack.
        </div>
      )}
    </Card>
  );
}
