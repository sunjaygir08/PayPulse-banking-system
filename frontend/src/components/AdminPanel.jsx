import React, { useState, useEffect } from 'react';
import { ShieldCheck, Play, Trash2, RotateCcw, AlertTriangle, Search, Lock, Unlock, Eye, RefreshCw, Layers, ListCollapse } from 'lucide-react';

export default function AdminPanel({ user, addToast }) {
  const [users, setUsers] = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stackSize, setStackSize] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminData = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch Users & Accounts
      const usersRes = await fetch('/api/admin/users');
      if (!usersRes.ok) throw new Error('Failed to fetch system users');
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);

      // 2. Fetch Pending Queue
      const queueRes = await fetch('/api/admin/queue');
      if (!queueRes.ok) throw new Error('Failed to fetch pending queue');
      const queueData = await queueRes.json();
      setPendingQueue(queueData.queue || []);

      // 3. Fetch Transaction Logs
      const logsRes = await fetch('/api/admin/logs');
      if (!logsRes.ok) throw new Error('Failed to fetch transaction logs');
      const logsData = await logsRes.json();
      setLogs(logsData.logs || []);
      setStackSize(logsData.stack_size || 0);

    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleProcessQueue = async () => {
    if (pendingQueue.length === 0) {
      addToast('No transaction requests pending in Queue.', 'info');
      return;
    }
    
    const nextTx = pendingQueue[0];
    const confirmProc = window.confirm(`Process FIFO Queue Transaction ID ${nextTx.id}?\nTransfer PKR ${nextTx.amount.toLocaleString()} from Acc ${nextTx.sender_account_number} to Acc ${nextTx.recipient_account_number}.`);
    if (!confirmProc) return;

    try {
      const res = await fetch('/api/admin/queue/process', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process queue item');
      
      addToast(`Processed transaction request ID ${data.processed_id} successfully (FIFO).`, 'success');
      fetchAdminData();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleRejectQueueItem = async (reqId) => {
    const confirmReject = window.confirm(`Reject and cancel pending transaction request ID ${reqId}? Available balance of sender will be restored.`);
    if (!confirmReject) return;

    try {
      const res = await fetch('/api/admin/queue/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reqId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject queue item');
      
      addToast(`Rejected transaction request ID ${reqId}.`, 'info');
      fetchAdminData();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleUndoTransaction = async () => {
    if (stackSize === 0) {
      addToast('Transaction Stack is empty. No operations to revert.', 'info');
      return;
    }

    const confirmUndo = window.confirm(`Revert the last completed transaction (LIFO Stack Reversal)?\nThis will pop the latest valid action from the stack and reverse its balance effects.`);
    if (!confirmUndo) return;

    try {
      const res = await fetch('/api/admin/undo', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to undo transaction');
      
      addToast(`Undone/Reversed Transaction ID ${data.reversed_tx_id} successfully (LIFO Pop).`, 'success');
      fetchAdminData();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleFreezeToggle = async (accountNumber, currentStatus) => {
    const nextStatus = currentStatus === 'frozen' ? 'active' : 'frozen';
    const msg = `Are you sure you want to ${nextStatus === 'frozen' ? 'freeze' : 'unfreeze'} account ${accountNumber}?`;
    if (!window.confirm(msg)) return;

    try {
      const res = await fetch('/api/admin/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_number: accountNumber, status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update freeze state');
      
      addToast(`Account ${accountNumber} has been ${nextStatus === 'frozen' ? 'FROZEN' : 'ACTIVATED'}.`, 'success');
      fetchAdminData();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    return u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
           u.email?.toLowerCase().includes(search.toLowerCase()) ||
           u.cnic?.includes(search) ||
           u.mobile?.includes(search);
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={32} style={{ color: 'var(--brand-primary)' }} /> Admin Control Panel
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Algorithmic DSA queue processor, undo rollback stack, and user freeze directories.</p>
        </div>
        <button 
          onClick={fetchAdminData} 
          className="btn-secondary" 
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px' }}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Admin stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--brand-primary-glow)', color: 'var(--brand-primary)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Queue size (FIFO)</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{pendingQueue.length} pending</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--brand-secondary-glow)', color: 'var(--brand-secondary)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RotateCcw size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Undo stack (LIFO)</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{stackSize} history</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--income-green-glow)', color: 'var(--income-green)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCog size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>System Customers</span>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{users.length} active</h3>
          </div>
        </div>
      </div>

      {/* Grid: FIFO Queue and LIFO Stack */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* FIFO Pending Approvals */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Pending Approvals (FIFO Queue)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Process first-in-first-out transactions</p>
            </div>
            {pendingQueue.length > 0 && (
              <button 
                onClick={handleProcessQueue}
                className="btn-primary" 
                style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem' }}
              >
                <Play size={14} /> Process Next
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
            {pendingQueue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Queue is empty. No transaction clearing requested.
              </div>
            ) : (
              pendingQueue.map((item, idx) => (
                <div 
                  key={item.id} 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--card-border)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="pill" style={{ background: 'var(--brand-primary-glow)', color: 'var(--brand-primary)', fontSize: '0.65rem', fontWeight: 700 }}>
                        Pos #{idx + 1}
                      </span>
                      <strong style={{ fontSize: '0.9rem' }}>PKR {item.amount.toLocaleString()}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>From: {item.sender_account_number}</span> • <span>To: {item.recipient_account_number}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRejectQueueItem(item.id)}
                    className="btn-secondary" 
                    style={{ padding: '6px', borderRadius: '6px', color: 'var(--expense-red)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* LIFO Operations Rollback */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Rollback Actions (LIFO Stack)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Undo recently committed ledger items</p>
            </div>
            {stackSize > 0 && (
              <button 
                onClick={handleUndoTransaction}
                className="btn-secondary" 
                style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--brand-secondary)', borderColor: 'var(--brand-secondary-glow)' }}
              >
                <RotateCcw size={14} /> Undo Last Action
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
            {logs.filter(l => l.is_undone === 0).slice(0, 5).map((l, idx) => (
              <div 
                key={l.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--card-border)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {idx === 0 && (
                      <span className="pill" style={{ background: 'var(--brand-secondary-glow)', color: 'var(--brand-secondary)', fontSize: '0.65rem', fontWeight: 700 }}>
                        Top of Stack
                      </span>
                    )}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{l.title}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Type: <span style={{ textTransform: 'uppercase' }}>{l.type}</span> • Amount: PKR {Math.abs(l.amount).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            {logs.filter(l => l.is_undone === 0).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No active actions on stack.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Directory */}
      <div className="glass-card" style={{ padding: '30px', borderRadius: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Account Directory (Dictionary Lookup)</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Search and configure customer statuses</p>
          </div>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search Name, CNIC, email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '38px', paddingTop: '10px', paddingBottom: '10px' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px' }}>Customer Name</th>
                <th style={{ padding: '12px' }}>CNIC / Mobile</th>
                <th style={{ padding: '12px' }}>Accounts (Type / Number / Balance)</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                    No matching customers found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '16px 12px' }}>
                      <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{u.full_name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{u.cnic}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.mobile}</span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {u.accounts?.map((acc) => (
                          <div 
                            key={acc.id} 
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              background: 'var(--input-bg)', 
                              padding: '6px 12px', 
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              border: '1px solid var(--card-border)',
                              minWidth: '280px'
                            }}
                          >
                            <div>
                              <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--brand-primary)' }}>{acc.account_type}</span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{acc.account_number}</span>
                            </div>
                            <div>
                              <strong style={{ fontFamily: 'var(--font-mono)' }}>PKR {acc.balance.toLocaleString()}</strong>
                              <span style={{
                                color: acc.status === 'frozen' ? 'var(--expense-red)' : 'var(--income-green)',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                marginLeft: '8px'
                              }}>{acc.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {u.accounts?.map((acc) => (
                          <button
                            key={acc.id}
                            onClick={() => handleFreezeToggle(acc.account_number, acc.status)}
                            className="btn-secondary"
                            style={{ 
                              padding: '6px 12px', 
                              borderRadius: '8px', 
                              fontSize: '0.7rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              borderColor: acc.status === 'frozen' ? 'var(--income-green)' : 'rgba(239, 68, 68, 0.2)',
                              color: acc.status === 'frozen' ? 'var(--income-green)' : 'var(--expense-red)'
                            }}
                          >
                            {acc.status === 'frozen' ? <Unlock size={12} /> : <Lock size={12} />}
                            {acc.status === 'frozen' ? `Unfreeze ${acc.account_type.charAt(0).toUpperCase()}` : `Freeze ${acc.account_type.charAt(0).toUpperCase()}`}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Logs */}
      <div className="glass-card" style={{ padding: '30px', borderRadius: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Global Transaction Logs (Stack History)</h2>
        <div style={{ overflowY: 'auto', maxHeight: '350px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {logs.map((log) => {
            const isReversal = log.type === 'undo';
            const isUndone = log.is_undone === 1;
            
            return (
              <div 
                key={log.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  borderRadius: '12px',
                  background: isUndone ? 'rgba(239, 68, 68, 0.05)' : 'var(--input-bg)',
                  border: '1px solid',
                  borderColor: isUndone ? 'rgba(239, 68, 68, 0.2)' : 'var(--card-border)',
                  opacity: isUndone ? 0.6 : 1
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{log.title}</strong>
                    {isUndone && (
                      <span className="pill" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--expense-red)', fontSize: '0.6rem', fontWeight: 700 }}>
                        REVERSED (UNDONE)
                      </span>
                    )}
                    {isReversal && (
                      <span className="pill" style={{ background: 'var(--brand-secondary-glow)', color: 'var(--brand-secondary)', fontSize: '0.6rem', fontWeight: 700 }}>
                        SYSTEM ROLLBACK
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>Account ID: {log.sender_account_id}</span> • <span>Category: {log.category}</span> • <span>Date: {new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  {log.note && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>Note: {log.note}</p>}
                </div>
                <strong style={{ 
                  color: isUndone ? 'var(--text-muted)' : (log.amount > 0 ? 'var(--income-green)' : 'var(--text-primary)'),
                  fontFamily: 'var(--font-mono)'
                }}>
                  {log.amount > 0 ? '+' : ''}PKR {log.amount.toLocaleString()}
                </strong>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
