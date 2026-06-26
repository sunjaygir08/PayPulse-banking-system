import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, PlusCircle, Check, AlertCircle } from 'lucide-react';

export default function BillPay({ user, addToast }) {
  const [bills, setBills] = useState([]);
  const [checkingAccount, setCheckingAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Create Bill Form Fields
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('bills');
  const [dueDate, setDueDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const loadBillData = async () => {
    try {
      // Load accounts to find checking account balance
      const accRes = await fetch('/api/accounts');
      if (accRes.ok) {
        const accs = await accRes.json();
        const chk = accs.find(a => a.account_type === 'checking');
        setCheckingAccount(chk || null);
      }

      // Load bills
      const billsRes = await fetch('/api/bills');
      if (billsRes.ok) {
        const billsData = await billsRes.json();
        setBills(billsData.bills || []);
      }
    } catch (error) {
      addToast('Error loading bills data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillData();
  }, []);

  const handlePayBill = async (billId) => {
    if (!checkingAccount) {
      addToast('No checking account found to pay from.', 'error');
      return;
    }

    const pin = prompt('Enter your 4-digit Security PIN to confirm payment:');
    if (pin === null) return;

    try {
      const response = await fetch('/api/bills/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bill_id: billId,
          account_id: checkingAccount.id,
          security_pin: pin
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to pay bill');
      }

      addToast('Bill paid successfully!', 'success');
      loadBillData();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!payee || !amount || !dueDate) {
      addToast('Please fill in all bill fields', 'info');
      return;
    }

    try {
      const response = await fetch('/api/bills/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payee,
          amount: parseFloat(amount),
          category,
          due_date: dueDate
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create bill');
      }

      addToast('New bill scheduled successfully!', 'success');
      setPayee('');
      setAmount('');
      setDueDate('');
      setShowAddForm(false);
      loadBillData();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Bills & Utilities</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and pay scheduled utility bills from your checking account.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px' }}
        >
          <PlusCircle size={16} /> Schedule Bill
        </button>
      </div>

      {/* Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showAddForm ? '2fr 1fr' : '1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Bill Tracker Panel */}
        <div className="glass-card" style={{ padding: '30px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Upcoming & Paid Invoices</h2>
            {checkingAccount && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Paying from Checking: <strong>PKR {checkingAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bills.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                No scheduled bills found. Click 'Schedule Bill' to add one.
              </div>
            ) : (
              bills.map((bill) => {
                const isPaid = bill.status === 'paid';
                return (
                  <div 
                    key={bill.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '20px',
                      borderRadius: '16px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--card-border)',
                      opacity: isPaid ? 0.75 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        background: isPaid ? 'var(--income-green-glow)' : 'var(--brand-primary-glow)',
                        color: isPaid ? 'var(--income-green)' : 'var(--brand-primary)',
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isPaid ? <Check size={20} /> : <Calendar size={20} />}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{bill.payee}</h4>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span style={{ textTransform: 'uppercase', color: 'var(--brand-secondary)', fontWeight: 600 }}>{bill.category}</span>
                          <span>•</span>
                          <span>Due: {new Date(bill.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          PKR {bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="pill" style={{
                          background: isPaid ? 'var(--income-green-glow)' : 'rgba(239, 68, 68, 0.1)',
                          color: isPaid ? 'var(--income-green)' : 'var(--expense-red)',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          marginTop: '4px',
                          display: 'inline-block'
                        }}>
                          {bill.status.toUpperCase()}
                        </span>
                      </div>

                      {!isPaid && (
                        <button
                          onClick={() => handlePayBill(bill.id)}
                          className="btn-primary"
                          style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem' }}
                        >
                          Pay Bill
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Schedule Bill Side Form */}
        {showAddForm && (
          <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>Schedule New Bill</h3>
            <form onSubmit={handleCreateBill}>
              <div className="form-group">
                <label>Payee Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Netflix, Electricity Corp..."
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount (PKR)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.1"
                  className="form-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="utilities">Utilities</option>
                  <option value="entertainment">Subscriptions</option>
                  <option value="rent">Rent / Housing</option>
                  <option value="insurance">Insurance</option>
                  <option value="general">Other Bills</option>
                </select>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Schedule Bill
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
