import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Search, Filter, RefreshCw, Send, DollarSign, BarChart3 } from 'lucide-react';

export default function Dashboard({ user, addToast, setActiveTab }) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Quick Transfer Widget Fields
  const [quickRecipient, setQuickRecipient] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickAccount, setQuickAccount] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch accounts
      const accountsRes = await fetch('/api/accounts');
      if (!accountsRes.ok) throw new Error('Failed to load accounts');
      const accountsData = await accountsRes.ok ? await accountsRes.json() : [];
      setAccounts(accountsData);

      if (accountsData.length > 0) {
        // Set default account for quick transfer
        setQuickAccount(accountsData[0].id);
        
        // Fetch recent transactions of first account (or all)
        const transRes = await fetch(`/api/accounts/${accountsData[0].id}/transactions`);
        if (transRes.ok) {
          const transData = await transRes.json();
          setTransactions(transData.transactions || []);
        }
      }
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickTransfer = async (e) => {
    e.preventDefault();
    if (!quickRecipient || !quickAmount) {
      addToast('Please fill in all quick transfer fields.', 'info');
      return;
    }

    try {
      const pin = prompt('Enter your 4-digit Security PIN to confirm:');
      if (pin === null) return; // Cancelled

      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_account_id: parseInt(quickAccount),
          recipient_identifier: quickRecipient,
          amount: parseFloat(quickAmount),
          category: 'transfer',
          note: 'Quick transfer',
          security_pin: pin
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Transfer failed');
      }

      addToast('Transfer sent successfully!', 'success');
      setQuickRecipient('');
      setQuickAmount('');
      fetchDashboardData(); // Refresh balances and ledger
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const getAccountGradient = (type) => {
    switch (type) {
      case 'checking':
        return 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
      case 'savings':
        return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
      case 'credit':
        return 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)';
      default:
        return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
    }
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(search.toLowerCase()) || 
                          t.note?.toLowerCase().includes(search.toLowerCase()) ||
                          t.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Calculate spending analytics
  const categories = ['shopping', 'bills', 'food', 'transfer', 'general'];
  const spendByCategory = categories.map(cat => {
    const total = transactions
      .filter(t => t.category?.toLowerCase() === cat && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { name: cat, amount: total };
  });
  const maxSpend = Math.max(...spendByCategory.map(c => c.amount), 1);

  if (loading && accounts.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Welcome back, {user?.full_name.split(' ')[0]}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here is your financial status today.</p>
        </div>
        <button 
          onClick={fetchDashboardData} 
          className="btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px' }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Grid of Accounts (Checking, Savings, Credit Card) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {accounts.map((acc) => (
          <div 
            key={acc.id} 
            className="glass-card" 
            style={{
              padding: '24px',
              borderRadius: '20px',
              color: 'white',
              background: getAccountGradient(acc.account_type),
              position: 'relative',
              overflow: 'hidden',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            {/* Glossy Overlay */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)',
              pointerEvents: 'none'
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                  {acc.account_type} Account
                </p>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <CreditCard size={24} style={{ opacity: 0.8 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.75rem', opacity: 0.85 }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>ACCOUNT NUMBER</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginTop: '2px' }}>{acc.account_number}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>ROUTING</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginTop: '2px' }}>{acc.routing_number}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px'
      }}>
        {/* Left Column: Live Ledger */}
        <div className="glass-card" style={{ padding: '30px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Transaction History</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Recent payments and deposits</p>
            </div>
            
            {/* Quick Navigation Trigger */}
            <button onClick={() => setActiveTab('transfer')} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem' }}>
              Send Money <Send size={14} />
            </button>
          </div>

          {/* Search and Filter */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search description, category..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '38px', paddingTop: '10px', paddingBottom: '10px' }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Filter size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px', paddingTop: '10px', paddingBottom: '10px', width: '150px' }}
              >
                <option value="all">All Categories</option>
                <option value="salary">Salary</option>
                <option value="shopping">Shopping</option>
                <option value="bills">Bills</option>
                <option value="food">Food</option>
                <option value="transfer">Transfers</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          {/* Transaction List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                No transactions match search criteria.
              </div>
            ) : (
              filteredTransactions.map((t) => {
                const isIncome = t.amount > 0;
                return (
                  <div 
                    key={t.id} 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      borderRadius: '16px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--card-border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        background: isIncome ? 'var(--income-green-glow)' : 'var(--expense-red-glow)',
                        color: isIncome ? 'var(--income-green)' : 'var(--expense-red)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isIncome ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.title}</h4>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span style={{ textTransform: 'uppercase', color: 'var(--brand-primary)', fontWeight: 600 }}>{t.category}</span>
                          <span>•</span>
                          <span>{new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {t.note && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>{t.note}</p>}
                      </div>
                    </div>
                    <strong style={{
                      color: isIncome ? 'var(--income-green)' : 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1rem'
                    }}>
                      {isIncome ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                    </strong>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Quick Transfer and Spending analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Transfer Widget */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={18} style={{ color: 'var(--brand-primary)' }} /> Quick Transfer
            </h3>
            <form onSubmit={handleQuickTransfer}>
              <div className="form-group">
                <label>Select Source Account</label>
                <select 
                  className="form-input" 
                  value={quickAccount}
                  onChange={(e) => setQuickAccount(e.target.value)}
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_type.toUpperCase()} (${acc.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Recipient Email or Account No.</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="friend@email.com or Payee Account" 
                  value={quickRecipient}
                  onChange={(e) => setQuickRecipient(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.1"
                  className="form-input" 
                  placeholder="0.00" 
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                Transfer Now
              </button>
            </form>
          </div>

          {/* Spending Analytics */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} style={{ color: 'var(--brand-secondary)' }} /> Spending Analytics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {spendByCategory.map((c) => {
                const percentage = (c.amount / maxSpend) * 100;
                return (
                  <div key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{c.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>${c.amount.toFixed(2)}</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div style={{ background: 'var(--input-bg)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary))',
                        width: `${percentage}%`,
                        height: '100%',
                        borderRadius: '3px'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CSS adjustments to handle responsive columns */}
      <style>{`
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
