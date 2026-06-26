import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Search, Filter, RefreshCw, Send, DollarSign, BarChart3, ShieldCheck, Heart, UserPlus, Info, Check, X } from 'lucide-react';

export default function Dashboard({ user, addToast, setActiveTab }) {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedAccountIdx, setSelectedAccountIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  // Quick Transfer Widget Fields
  const [quickRecipient, setQuickRecipient] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  
  // Zakat Calculator States
  const [showZakatModal, setShowZakatModal] = useState(false);
  const [zakatCalcData, setZakatCalcData] = useState(null);
  const [calculatingZakat, setCalculatingZakat] = useState(false);
  const [deductingZakat, setDeductingZakat] = useState(false);

  // Beneficiary Form State
  const [showBeneForm, setShowBeneForm] = useState(false);
  const [beneName, setBeneName] = useState('');
  const [beneAccNum, setBeneAccNum] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Accounts
      const accountsRes = await fetch('/api/accounts');
      if (!accountsRes.ok) throw new Error('Failed to load accounts');
      const accountsData = await accountsRes.json();
      setAccounts(accountsData);

      if (accountsData.length > 0) {
        const activeAcc = accountsData[selectedAccountIdx] || accountsData[0];
        
        // 2. Fetch Recent Transactions for active account
        const transRes = await fetch(`/api/accounts/${activeAcc.id}/transactions?sort_by=created_at&order=${sortOrder}`);
        if (transRes.ok) {
          const transData = await transRes.json();
          setTransactions(transData.transactions || []);
        }
      }

      // 3. Fetch Beneficiaries
      const beneRes = await fetch('/api/beneficiaries');
      if (beneRes.ok) {
        const beneData = await beneRes.json();
        setBeneficiaries(beneData || []);
      }

    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedAccountIdx, sortOrder]);

  const handleQuickTransfer = async (e) => {
    e.preventDefault();
    if (!quickRecipient || !quickAmount) {
      addToast('Please fill in all transfer fields.', 'info');
      return;
    }

    const sourceAcc = accounts[selectedAccountIdx];
    if (!sourceAcc) return;

    if (sourceAcc.status === 'frozen') {
      addToast('Source account is frozen. Transactions are disabled.', 'error');
      return;
    }

    const pin = prompt('Enter your 4-digit Security PIN to confirm:');
    if (pin === null) return; // Cancelled

    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_account_id: sourceAcc.id,
          recipient_identifier: quickRecipient.trim(),
          amount: parseFloat(quickAmount),
          category: 'transfer',
          note: 'Quick transfer',
          security_pin: pin,
          is_express: true // Immediate Express transfer
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Transfer failed');
      }

      addToast('Transfer sent successfully!', 'success');
      setQuickRecipient('');
      setQuickAmount('');
      fetchDashboardData();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleAddBeneficiary = async (e) => {
    e.preventDefault();
    if (!beneName || !beneAccNum) return;

    try {
      const response = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: beneName, account_number: beneAccNum })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add beneficiary');

      addToast('Beneficiary added successfully!', 'success');
      setBeneName('');
      setBeneAccNum('');
      setShowBeneForm(false);
      fetchDashboardData();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleToggleZakat = async (accId) => {
    try {
      const response = await fetch('/api/zakat/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to toggle Zakat');
      
      addToast(`Zakat settings updated: ${data.zakat_enabled ? 'Enabled' : 'Disabled'}.`, 'success');
      fetchDashboardData();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleCalculateZakat = async (accNum) => {
    setCalculatingZakat(true);
    try {
      const res = await fetch(`/api/zakat/calculate/${accNum}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Zakat calculation failed');
      setZakatCalcData(data);
      setShowZakatModal(true);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setCalculatingZakat(false);
    }
  };

  const handleDeductZakat = async () => {
    const sourceAcc = accounts[selectedAccountIdx];
    if (!sourceAcc) return;

    setDeductingZakat(true);
    try {
      const response = await fetch('/api/zakat/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_number: sourceAcc.account_number })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Zakat deduction failed');

      addToast(`Zakat deduction of PKR ${data.zakat_paid.toLocaleString()} applied.`, 'success');
      setShowZakatModal(false);
      fetchDashboardData();
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setDeductingZakat(false);
    }
  };

  const getAccountGradient = (type) => {
    switch (type) {
      case 'checking':
        return 'linear-gradient(135deg, #0f5132 0%, #198754 100%)'; // Green theme for PKR context
      case 'savings':
        return 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)';
      case 'credit':
        return 'linear-gradient(135deg, #111827 0%, #1f2937 100%)';
      default:
        return 'linear-gradient(135deg, #212529 0%, #343a40 100%)';
    }
  };

  const activeAccount = accounts[selectedAccountIdx] || null;

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(search.toLowerCase()) || 
                          t.note?.toLowerCase().includes(search.toLowerCase()) ||
                          t.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Calculate spending analytics
  const spendCategories = ['shopping', 'bills', 'food', 'transfer', 'general'];
  const spendByCategory = spendCategories.map(cat => {
    const total = transactions
      .filter(t => t.category?.toLowerCase() === cat && t.amount < 0 && t.is_undone !== 1)
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
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Assalam-o-Alaikum, {user?.full_name?.split(' ')[0]}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Account CNIC: <strong style={{ fontFamily: 'var(--font-mono)' }}>{user?.cnic}</strong> | Mobile: <strong style={{ fontFamily: 'var(--font-mono)' }}>{user?.mobile}</strong></p>
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
        {accounts.map((acc, index) => {
          const isSelected = selectedAccountIdx === index;
          return (
            <div 
              key={acc.id} 
              onClick={() => setSelectedAccountIdx(index)}
              className={`glass-card ${isSelected ? 'active-account-card' : ''}`} 
              style={{
                padding: '24px',
                borderRadius: '20px',
                color: 'white',
                background: getAccountGradient(acc.account_type),
                position: 'relative',
                overflow: 'hidden',
                minHeight: '190px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isSelected ? '0 0 15px var(--brand-primary-glow)' : 'var(--shadow-md)',
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--card-border)',
                transform: isSelected ? 'scale(1.02)' : 'none',
                transition: 'all 0.25s ease'
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none'
              }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                      {acc.account_type} Account
                    </span>
                    {acc.status === 'frozen' && (
                      <span className="pill" style={{ background: 'var(--expense-red)', color: 'white', fontSize: '0.6rem', padding: '1px 6px' }}>FROZEN</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                    PKR {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    Avail: PKR {acc.available_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <CreditCard size={24} style={{ opacity: 0.8 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.7rem', opacity: 0.85 }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.7)' }}>ACCOUNT NUMBER</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '2px' }}>{acc.account_number}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'rgba(255,255,255,0.7)' }}>CUSTOMER ID</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '2px' }}>{acc.customer_id}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1.1fr',
        gap: '24px'
      }}>
        {/* Left Column: Live Ledger & Debit Card Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Debit Card and Actions */}
          <div className="glass-card" style={{
            padding: '30px', borderRadius: '24px',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center'
          }}>
            {/* Debit Card Render */}
            {activeAccount && (
              <div 
                className="card-wrapper" 
                style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  borderRadius: '20px', padding: '24px', color: 'white',
                  position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-lg)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  height: '210px', width: '100%', maxWidth: '360px'
                }}
              >
                {activeAccount.status === 'frozen' && <div className="card-frozen-watermark" style={{ fontSize: '1.5rem', padding: '6px 16px' }}>FROZEN</div>}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '1px', color: 'var(--text-secondary)' }}>PayPulse Gold Debit</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>VISA</span>
                </div>

                <div style={{ width: '40px', height: '30px', background: 'linear-gradient(135deg, #ecc94b 0%, #d69e2e 100%)', borderRadius: '4px' }} />

                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', letterSpacing: '2px', wordSpacing: '4px', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                    {activeAccount.debit_card_number}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block' }}>CARDHOLDER</span>
                    <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{user?.full_name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block' }}>CUSTOMER ID</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{activeAccount.customer_id}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Settings: Zakat & Statuses */}
            {activeAccount && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Account Direct Actions</h3>
                
                {/* Zakat Actions for Savings Accounts */}
                {activeAccount.account_type === 'savings' ? (
                  <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', padding: '16px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Zakat Deduction status</span>
                      <span className={`pill ${activeAccount.zakat_enabled ? 'success' : 'error'}`} style={{
                        background: activeAccount.zakat_enabled ? 'var(--income-green-glow)' : 'rgba(239,68,68,0.1)',
                        color: activeAccount.zakat_enabled ? 'var(--income-green)' : 'var(--expense-red)',
                        fontSize: '0.7rem', padding: '2px 8px', fontWeight: 700
                      }}>
                        {activeAccount.zakat_enabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleToggleZakat(activeAccount.id)}
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', flex: 1 }}
                      >
                        {activeAccount.zakat_enabled ? 'Disable Zakat' : 'Enable Zakat'}
                      </button>
                      <button 
                        onClick={() => handleCalculateZakat(activeAccount.account_number)}
                        className="btn-primary" 
                        disabled={calculatingZakat}
                        style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Heart size={12} /> Zakat Calc
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Info size={18} style={{ color: 'var(--brand-primary)' }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Zakat calculations and automatic deductions are only applicable on savings accounts under Islamic banking regulations.
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setActiveTab('transfer')} className="btn-primary" style={{ flex: 1, fontSize: '0.85rem', padding: '10px' }}>
                    Send Money (PKR)
                  </button>
                  <button onClick={() => setActiveTab('bills')} className="btn-secondary" style={{ flex: 1, fontSize: '0.85rem', padding: '10px' }}>
                    Pay Utility Bills
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Transaction Ledger */}
          <div className="glass-card" style={{ padding: '30px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Transaction History</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ledger records sorted in memory using QuickSort</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)} 
                  className="form-input"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', width: '120px' }}
                >
                  <option value="desc">Latest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search ledger entries..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: '38px', paddingTop: '10px', paddingBottom: '10px' }}
                />
              </div>
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="form-input"
                  style={{ paddingTop: '10px', paddingBottom: '10px', width: '150px' }}
                >
                  <option value="all">All Categories</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="transfer">Transfers</option>
                  <option value="bills">Bills</option>
                  <option value="zakat">Zakat Payments</option>
                </select>
              </div>
            </div>

            {/* Transaction List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  No transaction ledger items found.
                </div>
              ) : (
                filteredTransactions.map((t) => {
                  const isIncome = t.amount > 0;
                  const isUndone = t.is_undone === 1;
                  
                  return (
                    <div 
                      key={t.id} 
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        borderRadius: '16px',
                        background: isUndone ? 'rgba(239,68,68,0.05)' : 'var(--input-bg)',
                        border: '1px solid',
                        borderColor: isUndone ? 'rgba(239, 68, 68, 0.2)' : 'var(--card-border)',
                        opacity: isUndone ? 0.6 : 1
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          background: isUndone ? 'var(--input-bg)' : (isIncome ? 'var(--income-green-glow)' : 'var(--expense-red-glow)'),
                          color: isUndone ? 'var(--text-muted)' : (isIncome ? 'var(--income-green)' : 'var(--expense-red)'),
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{t.title}</h4>
                            {isUndone && (
                              <span className="pill" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--expense-red)', fontSize: '0.55rem', padding: '1px 6px', fontWeight: 700 }}>REVERSED</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ textTransform: 'uppercase', color: 'var(--brand-primary)', fontWeight: 600 }}>{t.category}</span>
                            <span>•</span>
                            <span>{new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {t.note && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>{t.note}</p>}
                        </div>
                      </div>
                      <strong style={{
                        color: isUndone ? 'var(--text-muted)' : (isIncome ? 'var(--income-green)' : 'var(--text-primary)'),
                        fontFamily: 'var(--font-mono)',
                        fontSize: '1rem'
                      }}>
                        {isIncome ? '+' : '-'}${Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Transfer and Beneficiary Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Transfer Widget */}
          {activeAccount && (
            <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} style={{ color: 'var(--brand-primary)' }} /> Express Transfer
              </h3>
              
              <form onSubmit={handleQuickTransfer}>
                <div className="form-group">
                  <label>Recipient Account Number or Email</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Acc Num or Friend's Email" 
                    value={quickRecipient}
                    onChange={(e) => setQuickRecipient(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Amount (PKR)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="1"
                    className="form-input" 
                    placeholder="0.00" 
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }} disabled={activeAccount.status === 'frozen'}>
                  Transfer PKR
                </button>
              </form>
            </div>
          )}

          {/* Beneficiary Management Panel */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={18} style={{ color: 'var(--expense-red)' }} /> Beneficiaries
              </h3>
              <button 
                onClick={() => setShowBeneForm(!showBeneForm)} 
                className="btn-secondary"
                style={{ padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <UserPlus size={12} /> Add
              </button>
            </div>

            {/* Add Beneficiary Sub-form */}
            {showBeneForm && (
              <form onSubmit={handleAddBeneficiary} style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label>Beneficiary Nickname</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Father, Sister, shopkeeper" 
                    value={beneName}
                    onChange={(e) => setBeneName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Account Number</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="100XXXXXXX" 
                    value={beneAccNum}
                    onChange={(e) => setBeneAccNum(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', flex: 1 }}>Save</button>
                  <button type="button" onClick={() => setShowBeneForm(false)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Cancel</button>
                </div>
              </form>
            )}

            {/* List of Beneficiaries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxH: '250px', overflowY: 'auto' }}>
              {beneficiaries.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '16px 0' }}>
                  No saved beneficiaries yet.
                </p>
              ) : (
                beneficiaries.map((b) => (
                  <div 
                    key={b.id}
                    onClick={() => setQuickRecipient(b.account_number)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--card-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    className="beneficiary-item"
                  >
                    <div>
                      <strong style={{ fontSize: '0.85rem', display: 'block' }}>{b.name}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{b.account_number}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: 600 }}>Quick Pay</span>
                  </div>
                ))
              )}
            </div>
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
                      <span style={{ fontFamily: 'var(--font-mono)' }}>PKR {c.amount.toLocaleString()}</span>
                    </div>
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

      {/* Zakat Calculation Modal Dialog */}
      {showZakatModal && zakatCalcData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(8,13,26,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="glass-card" style={{ padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={20} style={{ color: 'var(--expense-red)' }} /> Zakat Deduction details
              </h3>
              <button 
                onClick={() => setShowZakatModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Account Balance</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>PKR {zakatCalcData.balance?.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Nisab Threshold (Silver context)</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>PKR {zakatCalcData.nisab?.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px', color: 'var(--income-green)' }}>
                <span>Zakat Due Amount (2.5%)</span>
                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem' }}>PKR {zakatCalcData.zakat_due?.toLocaleString()}</strong>
              </div>
              
              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', padding: '12px', borderRadius: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '10px' }}>
                <Info size={16} style={{ color: 'var(--brand-primary)', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Calculated according to Islamic rules (2.5% of total value above Nisab). Confirming will deduct this amount immediately from your Savings account balance.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={handleDeductZakat}
                disabled={deductingZakat || zakatCalcData.zakat_due <= 0}
                className="btn-primary" 
                style={{ flex: 1, padding: '12px' }}
              >
                {deductingZakat ? 'Processing...' : 'Confirm and Pay Zakat'}
              </button>
              <button 
                onClick={() => setShowZakatModal(false)}
                className="btn-secondary" 
                style={{ flex: 1, padding: '12px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS adjustments to handle responsive columns */}
      <style>{`
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns: 2fr 1.1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
