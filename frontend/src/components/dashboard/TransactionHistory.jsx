import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Receipt, Landmark, HelpCircle, Download, FileSpreadsheet } from 'lucide-react';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Input from '../common/Input';
import Pagination from '../common/Pagination';
import Dropdown from '../common/Dropdown';
import Button from '../common/Button';

export default function TransactionHistory({ transactions = [] }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter transactions
  const filteredTx = transactions.filter(t => {
    const searchMatch = (
      t.note?.toLowerCase().includes(search.toLowerCase()) || 
      t.title?.toLowerCase().includes(search.toLowerCase()) || 
      `TXN-${String(t.id).padStart(6, '0')}`.includes(search)
    );
    const categoryMatch = categoryFilter === 'all' || t.category?.toLowerCase() === categoryFilter.toLowerCase();
    return searchMatch && categoryMatch;
  });

  // Paginate transactions
  const totalPages = Math.ceil(filteredTx.length / itemsPerPage);
  const currentRows = filteredTx.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getTransactionIcon = (type, category) => {
    if (type === 'deposit') {
      return (
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(25, 135, 84, 0.08)', color: 'var(--income-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowDownLeft size={16} />
        </div>
      );
    }
    switch (category?.toLowerCase()) {
      case 'utilities':
        return (
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255, 193, 7, 0.08)', color: 'var(--warning-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt size={16} />
          </div>
        );
      case 'transfer':
        return (
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(10, 37, 64, 0.08)', color: 'var(--brand-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpRight size={16} />
          </div>
        );
      case 'zakat':
        return (
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.08)', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Landmark size={16} />
          </div>
        );
      default:
        return (
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.03)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HelpCircle size={16} />
          </div>
        );
    }
  };

  const handleExportCSV = () => {
    if (filteredTx.length === 0) return;
    
    // Create CSV header
    const headers = ['Reference', 'Title', 'Category', 'Type', 'Amount (PKR)', 'Date & Time', 'Status', 'Note'];
    const csvRows = [headers.join(',')];
    
    // Add row details
    filteredTx.forEach(t => {
      const ref = `TXN-${String(t.id).padStart(6, '0')}`;
      const title = `"${t.title || ''}"`;
      const category = `"${t.category || ''}"`;
      const type = `"${t.type || ''}"`;
      const amount = t.amount;
      const date = `"${t.created_at || ''}"`;
      const status = `"${t.is_undone ? 'reversed' : t.status || 'completed'}"`;
      const note = `"${t.note || ''}"`;
      
      csvRows.push([ref, title, category, type, amount, date, status, note].join(','));
    });
    
    // Download trigger
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PayPulse_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = ['all', 'transfer', 'utilities', 'deposit', 'zakat'];

  return (
    <div style={{ marginTop: '20px' }}>
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '16px',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexGrow: 1, maxWidth: '480px' }}>
          <Input
            placeholder="Search reference, title or note..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            icon={Search}
            style={{ marginBottom: 0, flexGrow: 1 }}
          />
          <Dropdown
            trigger={
              <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '42px' }}>
                <Filter size={16} /> Filter
              </Button>
            }
            items={categories.map(c => ({
              label: c.toUpperCase(),
              onClick: () => { setCategoryFilter(c); setCurrentPage(1); }
            }))}
          />
        </div>

        <Button 
          variant="outline" 
          onClick={handleExportCSV} 
          disabled={filteredTx.length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '42px' }}
        >
          <FileSpreadsheet size={16} /> Export CSV
        </Button>
      </div>

      <Table
        headers={['Transaction', 'Category', 'Ref No.', 'Date & Time', 'Status', 'Amount']}
        rows={currentRows}
        emptyMessage="No transaction history matches your search or filters."
        renderRow={(t) => {
          const refNumber = `TXN-${String(t.id).padStart(6, '0')}`;
          
          // Format date and time cleanly
          // Input format: "2026-06-26T10:15:39"
          const dateObj = new Date(t.created_at);
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
          const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

          const isDebit = t.amount < 0;
          const amtFormatted = Math.abs(t.amount).toLocaleString('en-PK', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

          return (
            <>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getTransactionIcon(t.type, t.category)}
                  <div>
                    <span style={{ fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>{t.title || 'Transaction'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.note || ''}</span>
                  </div>
                </div>
              </td>
              <td>
                <span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{t.category || t.type}</span>
              </td>
              <td>
                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{refNumber}</span>
              </td>
              <td>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{formattedDate}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formattedTime}</span>
              </td>
              <td>
                <Badge status={t.is_undone ? 'frozen' : t.status}>
                  {t.is_undone ? 'reversed' : t.status}
                </Badge>
              </td>
              <td style={{ textAlign: 'right' }}>
                <span 
                  style={{ 
                    fontWeight: 700, 
                    color: isDebit ? 'var(--expense-color)' : 'var(--income-color)' 
                  }}
                >
                  {isDebit ? '-' : '+'} PKR {amtFormatted}
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
    </div>
  );
}
