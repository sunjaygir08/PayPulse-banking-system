import React, { useState } from 'react';
import { Search, Lock, Unlock, Key, RefreshCw, UserPlus } from 'lucide-react';
import Card from '../common/Card';
import Table from '../common/Table';
import Input from '../common/Input';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function UserDirectory({ 
  users = [], 
  onFreezeToggle, 
  freezingId = null 
}) {
  const [search, setSearch] = useState('');

  // Filter users
  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.cnic?.includes(search) ||
    u.mobile?.includes(search)
  );

  return (
    <Card title="Registered Customer Accounts Directory">
      <div style={{ marginBottom: '16px', maxWidth: '400px' }}>
        <Input
          placeholder="Search by name, email, CNIC or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
          style={{ marginBottom: 0 }}
        />
      </div>

      <Table
        headers={['Customer Info', 'Identity / Mobile', 'Accounts Ledger Overview', 'Freeze Status']}
        rows={filteredUsers}
        emptyMessage="No customers found matching this query."
        renderRow={(customer) => {
          return (
            <>
              <td>
                <div>
                  <span style={{ fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>
                    {customer.full_name}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {customer.email}
                  </span>
                </div>
              </td>
              <td>
                <div>
                  <span style={{ display: 'block', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                    CNIC: {customer.cnic || 'N/A'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Mob: {customer.mobile || 'N/A'}
                  </span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {customer.accounts && customer.accounts.length > 0 ? (
                    customer.accounts.map((acc) => (
                      <div 
                        key={acc.id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          gap: '12px',
                          fontSize: '0.78rem',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(0,0,0,0.01)'
                        }}
                      >
                        <span style={{ fontWeight: 500, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                          {acc.account_type} ({acc.account_number.substr(-4)})
                        </span>
                        <span style={{ fontWeight: 600, color: acc.balance < 0 ? 'var(--expense-color)' : 'var(--text-primary)' }}>
                          PKR {acc.balance.toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No accounts linked.</span>
                  )}
                </div>
              </td>
              <td>
                {customer.accounts && customer.accounts.length > 0 ? (
                  // Use checking account status as general toggle
                  customer.accounts.map((acc) => {
                    if (acc.account_type === 'checking') {
                      const isFrozen = acc.status === 'frozen';
                      const isWorking = freezingId === acc.account_number;
                      return (
                        <Button
                          key={acc.id}
                          onClick={() => onFreezeToggle(acc.account_number, isFrozen ? 'active' : 'frozen')}
                          variant={isFrozen ? 'primary' : 'outline'}
                          size="sm"
                          disabled={isWorking}
                          style={{ 
                            padding: '4px 10px', 
                            height: '28px', 
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isWorking ? (
                            <RefreshCw size={12} className="spin" />
                          ) : isFrozen ? (
                            <>
                              <Unlock size={12} /> Unlock
                            </>
                          ) : (
                            <>
                              <Lock size={12} style={{ color: 'var(--expense-color)' }} /> Lock Acc
                            </>
                          )}
                        </Button>
                      );
                    }
                    return null;
                  })
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
                )}
              </td>
            </>
          );
        }}
      />
    </Card>
  );
}
