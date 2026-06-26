import React, { useState } from 'react';
import { UserPlus, Search, Contact, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Table from '../common/Table';

export default function BeneficiaryManager({ 
  beneficiaries = [], 
  onAddBeneficiary, 
  onSelectBeneficiary,
  adding = false 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [accNum, setAccNum] = useState('');
  const [search, setSearch] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name || !accNum) return;
    onAddBeneficiary(name, accNum, () => {
      setName('');
      setAccNum('');
      setShowAddForm(false);
    });
  };

  const filteredBene = beneficiaries.filter(b => 
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.account_number?.includes(search)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Transfer Limits Reference Block */}
      <Card title="Transactional Guardrails">
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px' }}>
            <span>Single Transfer Limit:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>PKR 250,000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px' }}>
            <span>Daily Cumulative Limit:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>PKR 1,000,000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Secure Verification Channel:</span>
            <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>4-Digit PIN Encrypted</span>
          </div>
        </div>
      </Card>

      {/* Saved Beneficiaries Directory */}
      <Card 
        title="Saved Beneficiaries"
        headerAction={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ padding: '4px 8px', height: '28px', fontSize: '0.78rem' }}
          >
            {showAddForm ? 'Close Form' : 'Add New'}
          </Button>
        }
      >
        {showAddForm && (
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--card-border)' }}>
            <Input
              label="Beneficiary Nickname"
              placeholder="e.g. Ali Ahmed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Account Number"
              placeholder="Enter 10-digit account number"
              value={accNum}
              onChange={(e) => setAccNum(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" size="sm" loading={adding}>
              <UserPlus size={14} /> Add to List
            </Button>
          </form>
        )}

        <div style={{ marginBottom: '12px' }}>
          <Input
            placeholder="Search saved list..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            style={{ marginBottom: 0 }}
          />
        </div>

        <Table
          headers={['Nickname', 'Account No.', 'Action']}
          rows={filteredBene}
          emptyMessage="No saved contacts found."
          renderRow={(b) => (
            <>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Contact size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{b.name}</span>
                </div>
              </td>
              <td>
                <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{b.account_number}</span>
              </td>
              <td>
                <button
                  onClick={() => onSelectBeneficiary(b.account_number)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Select <ArrowRight size={12} />
                </button>
              </td>
            </>
          )}
        />
      </Card>
    </div>
  );
}
