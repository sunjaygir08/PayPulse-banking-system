import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import Card from '../common/Card';

const COLORS = ['#0f5132', '#d4af37', '#0a2540', '#ef4444', '#06b6d4', '#8b5cf6'];

export default function SpendAnalytics({ transactions = [] }) {
  // 1. Process data for Spending Categories (Pie Chart)
  // Get all expenses (negative amounts)
  const expenses = transactions.filter(t => t.amount < 0 && t.type !== 'undo');
  
  const categoryTotals = expenses.reduce((acc, t) => {
    const cat = t.category || 'other';
    const amt = Math.abs(t.amount);
    acc[cat] = (acc[cat] || 0) + amt;
    return acc;
  }, {});

  const pieData = Object.keys(categoryTotals).map(cat => ({
    name: cat.toUpperCase(),
    value: Math.round(categoryTotals[cat])
  }));

  // 2. Process data for Monthly Spending (Bar Chart)
  // Group by date (e.g., YYYY-MM-DD or Month name)
  const dailyTotals = expenses.reduce((acc, t) => {
    // Extract date e.g. "2026-06-25" from "2026-06-25T10:15:39"
    const dateStr = t.created_at.split('T')[0];
    const amt = Math.abs(t.amount);
    acc[dateStr] = (acc[dateStr] || 0) + amt;
    return acc;
  }, {});

  // Sort dates and get last 7 active days of transactions for clean visualization
  const barData = Object.keys(dailyTotals)
    .sort()
    .slice(-7)
    .map(date => {
      // Format date label e.g., "Jun 25"
      const dateObj = new Date(date);
      const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      return {
        date: label,
        amount: Math.round(dailyTotals[date])
      };
    });

  const hasExpenses = pieData.length > 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '20px' }}>
      {/* Monthly/Daily Expenses Bar Chart */}
      <Card title="Recent Outgoing Spending Trends">
        {!hasExpenses ? (
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No transaction analytics available.
          </div>
        ) : (
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="amount" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} name="Spent (PKR)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Spending Categories Pie Chart */}
      <Card title="Spending Categories Distribution">
        {!hasExpenses ? (
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No category distribution available.
          </div>
        ) : (
          <div style={{ width: '100%', height: '240px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `PKR ${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-secondary)', 
                    borderColor: 'var(--card-border)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)'
                  }} 
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconSize={10} 
                  wrapperStyle={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
