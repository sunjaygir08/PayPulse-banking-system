import React, { useState } from 'react';
import { Search, HelpCircle, ArrowUpRight, ArrowDownLeft, Receipt, Landmark } from 'lucide-react';
import Card from '../common/Card';
import Table from '../common/Table';
import Input from '../common/Input';
import Badge from '../common/Badge';
import Pagination from '../common/Pagination';

export default function SystemLogs({ logs = [] }) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter logs
  const filteredLogs = logs.filter(l => 
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.note?.toLowerCase().includes(search.toLowerCase()) ||
    `TXN-${String(l.id).padStart(6, '0')}`.includes(search) ||
    l.sender_email?.toLowerCase().includes(search.toLowerCase()) ||
    l.sender_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentRows = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getTransactionIcon = (type, category) => {
    if (type === 'deposit') {
      return <ArrowDownLeft size={14} style={{ color: 'var(--income-color)' }} />;
    }
    switch (category?.toLowerCase()) {
      case 'utilities': return <Receipt size={14} style={{ color: 'var(--warning-color)' }} />;
      case 'transfer': return <ArrowUpRight size={14} style={{ color: 'var(--brand-secondary)' }} />;
      case 'zakat': return <Landmark size={14} style={{ color: 'var(--brand-accent)' }} />;
      default: return <HelpCircle size={14} />;
    }
  };

  return (
    <Card title="System Audit Logs">
      <div style={{ marginBottom: '16px', maxWidth: '400px' }}>
        <Input
          placeholder="Search by ref, title, customer name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          icon={Search}
          style={{ marginBottom: 0 }}
        />
      </div>

      <Table
        headers={['Reference ID', 'Transaction Details', 'Authorized Customer', 'Status', 'Amount']}
        rows={currentRows}
        emptyMessage="No transaction logs match this filter."
        renderRow={(log) => {
          const refNumber = `TXN-${String(log.id).padStart(6, '0')}`;
          
          const dateObj = new Date(log.created_at);
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
          const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

          const isDebit = log.amount < 0;
          const isUndo = log.type === 'undo';

          return (
            <>
              <td>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem' }}>{refNumber}</span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getTransactionIcon(log.type, log.category)}
                  <div>
                    <span style={{ fontWeight: 600, display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {log.title}
                    </span>
                    {log.note && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.note}</span>}
                  </div>
                </div>
              </td>
              <td>
                {log.sender_name ? (
                  <div>
                    <span style={{ fontSize: '0.82rem', display: 'block', fontWeight: 500 }}>{log.sender_name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{log.sender_email}</span>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>System Process</span>
                )}
              </td>
              <td>
                <div>
                  <Badge status={log.is_undone ? 'frozen' : log.status}>
                    {log.is_undone ? 'reversed' : log.status}
                  </Badge>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {formattedDate} {formattedTime}
                  </span>
                </div>
              </td>
              <td style={{ textAlign: 'right' }}>
                <span 
                  style={{ 
                    fontWeight: 700, 
                    fontSize: '0.9rem',
                    color: isUndo ? 'var(--text-secondary)' : isDebit ? 'var(--expense-color)' : 'var(--income-color)'
                  }}
                >
                  {isUndo ? '—' : isDebit ? '-' : '+'} PKR {Math.abs(log.amount).toLocaleString()}
                </span>
              </td>
            </>
          );
        }}
        pagination={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        }
      />
    </Card>
  );
}
