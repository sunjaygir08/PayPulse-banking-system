import React, { useState, useEffect } from 'react';
import AdminStats from '../admin/AdminStats';
import QueueManager from '../admin/QueueManager';
import UndoStack from '../admin/UndoStack';
import UserDirectory from '../admin/UserDirectory';
import SystemLogs from '../admin/SystemLogs';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export default function AdminPanel({ user, addToast }) {
  const [users, setUsers] = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stackSize, setStackSize] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [freezingId, setFreezingId] = useState(null);

  const fetchAdminData = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      // 1. Fetch Users & Accounts
      const usersRes = await fetch('/api/admin/users');
      if (!usersRes.ok) throw new Error('Failed to fetch system users directory.');
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);

      // 2. Fetch Pending Queue
      const queueRes = await fetch('/api/admin/queue');
      if (!queueRes.ok) throw new Error('Failed to load pending queue.');
      const queueData = await queueRes.json();
      setPendingQueue(queueData.queue || []);

      // 3. Fetch System Logs & Stack size
      const logsRes = await fetch('/api/admin/logs');
      if (!logsRes.ok) throw new Error('Failed to load audit logs.');
      const logsData = await logsRes.json();
      setLogs(logsData.logs || []);
      setStackSize(logsData.stack_size || 0);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleProcessQueueItem = async () => {
    if (pendingQueue.length === 0) return;
    const nextTx = pendingQueue[0];
    
    const confirmProc = window.confirm(`Authorize FIFO Transaction request ID ${nextTx.id}?\nTransfer PKR ${nextTx.amount.toLocaleString()} from ${nextTx.sender_account_number} to ${nextTx.recipient_account_number}.`);
    if (!confirmProc) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/queue/process', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process transaction');

      addToast(`Transaction ID ${data.processed_id} processed successfully.`, 'success');
      fetchAdminData(true);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectQueueItem = async (reqId) => {
    const confirmRej = window.confirm(`Cancel and reject pending transaction ID ${reqId}?\nAvailable balance of sender will be restored.`);
    if (!confirmRej) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/queue/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reqId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject transaction');

      addToast(`Transaction request ID ${reqId} rejected.`, 'info');
      fetchAdminData(true);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUndoLastTransaction = async () => {
    if (stackSize === 0) return;

    const confirmUndo = window.confirm(`Roll back the last completed transaction (LIFO stack pop)?\nAll balance changes will be reverted.`);
    if (!confirmUndo) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/undo', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rollback failed');

      addToast(`Reversed transaction ID ${data.reversed_tx_id} successfully (LIFO).`, 'success');
      fetchAdminData(true);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFreezeToggle = async (accountNumber, targetStatus) => {
    const confirmFreeze = window.confirm(`Change lock status of account ${accountNumber} to ${targetStatus}?`);
    if (!confirmFreeze) return;

    setFreezingId(accountNumber);
    try {
      const res = await fetch('/api/admin/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_number: accountNumber, status: targetStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change freeze status');

      addToast(`Account status updated to ${targetStatus}.`, 'success');
      fetchAdminData(true);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setFreezingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={28} style={{ color: 'var(--brand-primary)' }} /> Administrative Command Terminal
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Process FIFO transaction pipelines, execute LIFO reversals, and manage customer account locks.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchAdminData()} 
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '34px' }}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} /> Refresh Ledger
        </Button>
      </div>

      {/* Grid of Statistical Cards */}
      <AdminStats
        users={users}
        pendingQueue={pendingQueue}
        logs={logs}
      />

      {/* FIFO Queue & LIFO Stack controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
        <QueueManager
          queue={pendingQueue}
          onProcess={handleProcessQueueItem}
          onReject={handleRejectQueueItem}
          processing={actionLoading}
          refreshing={refreshing}
          onRefresh={() => fetchAdminData(true)}
        />

        <UndoStack
          logs={logs}
          stackSize={stackSize}
          onUndo={handleUndoLastTransaction}
          undoing={actionLoading}
        />
      </div>

      {/* User Directory grid */}
      <UserDirectory
        users={users}
        onFreezeToggle={handleFreezeToggle}
        freezingId={freezingId}
      />

      {/* Full Audit Logs */}
      <SystemLogs
        logs={logs}
      />

    </div>
  );
}
