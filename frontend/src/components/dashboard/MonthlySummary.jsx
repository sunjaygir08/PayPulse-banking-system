import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import Card from '../common/Card';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function MonthlySummary({ transactions = [] }) {
  // Calculate total income and expense
  const totals = transactions.reduce((acc, t) => {
    if (t.type === 'undo') return acc;
    if (t.amount > 0) {
      acc.income += t.amount;
    } else {
      acc.expense += Math.abs(t.amount);
    }
    return acc;
  }, { income: 0, expense: 0 });

  // Process timeline data for AreaChart (daily credits vs debits)
  const timelineTotals = transactions.reduce((acc, t) => {
    if (t.type === 'undo') return acc;
    const dateStr = t.created_at.split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, income: 0, expense: 0 };
    }
    if (t.amount > 0) {
      acc[dateStr].income += t.amount;
    } else {
      acc[dateStr].expense += Math.abs(t.amount);
    }
    return acc;
  }, {});

  const chartData = Object.keys(timelineTotals)
    .sort()
    .slice(-7) // last 7 days of activity
    .map(date => {
      const dateObj = new Date(date);
      const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      return {
        date: label,
        income: Math.round(timelineTotals[date].income),
        expense: Math.round(timelineTotals[date].expense)
      };
    });

  const hasData = chartData.length > 0;

  return (
    <Card title="Monthly Cash Flow Overview">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Income card summary */}
        <div 
          style={{ 
            padding: '16px', 
            borderRadius: '12px', 
            backgroundColor: 'rgba(25, 135, 84, 0.04)',
            border: '1px solid rgba(25, 135, 84, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div 
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '10px', 
              backgroundColor: 'rgba(25, 135, 84, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--income-color)'
            }}
          >
            <ArrowDownLeft size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Total Inflow</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              PKR {totals.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Expense card summary */}
        <div 
          style={{ 
            padding: '16px', 
            borderRadius: '12px', 
            backgroundColor: 'rgba(220, 53, 69, 0.04)',
            border: '1px solid rgba(220, 53, 69, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div 
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '10px', 
              backgroundColor: 'rgba(220, 53, 69, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--expense-color)'
            }}
          >
            <ArrowUpRight size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Total Outflow</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              PKR {totals.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No flow logs detected.
        </div>
      ) : (
        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--income-color)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--income-color)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--expense-color)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--expense-color)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} stroke="var(--card-border)" />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} stroke="var(--card-border)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--card-border)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)'
                }} 
              />
              <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: '0.75rem' }} />
              <Area type="monotone" dataKey="income" stroke="var(--income-color)" fillOpacity={1} fill="url(#colorIncome)" name="Inflow (PKR)" />
              <Area type="monotone" dataKey="expense" stroke="var(--expense-color)" fillOpacity={1} fill="url(#colorExpense)" name="Outflow (PKR)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
