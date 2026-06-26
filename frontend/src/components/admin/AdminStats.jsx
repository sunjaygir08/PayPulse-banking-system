import React from 'react';
import { Users, Shield, ShieldAlert, Layers, ListCollapse } from 'lucide-react';
import Card from '../common/Card';

export default function AdminStats({ users = [], pendingQueue = [], logs = [] }) {
  // Count statistics
  const totalUsers = users.length;
  
  let activeAccounts = 0;
  let frozenAccounts = 0;
  
  users.forEach(u => {
    if (u.accounts) {
      u.accounts.forEach(acc => {
        if (acc.status === 'frozen') {
          frozenAccounts++;
        } else {
          activeAccounts++;
        }
      });
    }
  });

  const pendingSize = pendingQueue.length;
  
  // Filter today's transaction logs
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactionsCount = logs.filter(l => l.created_at.startsWith(todayStr)).length;

  const statItems = [
    { title: 'Total Customers', value: totalUsers, icon: Users, color: 'var(--brand-secondary)', bg: 'rgba(10, 37, 64, 0.04)' },
    { title: 'Active Accounts', value: activeAccounts, icon: Shield, color: 'var(--income-color)', bg: 'rgba(25, 135, 84, 0.04)' },
    { title: 'Frozen Accounts', value: frozenAccounts, icon: ShieldAlert, color: 'var(--expense-color)', bg: 'rgba(220, 53, 69, 0.04)' },
    { title: 'Pending Queue', value: pendingSize, icon: Layers, color: 'var(--warning-color)', bg: 'rgba(255, 193, 7, 0.04)' },
    { title: 'Today\'s Actions', value: todayTransactionsCount, icon: ListCollapse, color: 'var(--brand-primary)', bg: 'rgba(25, 135, 84, 0.04)' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card 
            key={idx}
            style={{ 
              padding: '18px', 
              borderRadius: '12px',
              backgroundColor: 'var(--card-bg)',
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--card-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}
          >
            <div 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '8px', 
                backgroundColor: item.bg,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                {item.title}
              </span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {item.value}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
