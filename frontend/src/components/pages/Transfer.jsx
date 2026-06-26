import React, { useState, useEffect } from 'react';
import TransferForm from '../transfer/TransferForm';
import BeneficiaryManager from '../transfer/BeneficiaryManager';
import TransferSuccessScreen from '../transfer/TransferSuccessScreen';
import Loader from '../common/Loader';

export default function Transfer({ user, addToast }) {
  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [addingBene, setAddingBene] = useState(false);

  // Form Fields
  const [selectedAccId, setSelectedAccId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('transfer');
  const [note, setNote] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [isExpress, setIsExpress] = useState(true);

  // Success state receipt
  const [receiptData, setReceiptData] = useState(null);

  const fetchTransferData = async () => {
    try {
      const accRes = await fetch('/api/accounts');
      if (accRes.ok) {
        const accData = await accRes.json();
        setAccounts(accData);
        if (accData.length > 0) {
          setSelectedAccId(accData[0].id);
        }
      }

      const beneRes = await fetch('/api/beneficiaries');
      if (beneRes.ok) {
        const beneData = await beneRes.json();
        setBeneficiaries(beneData || []);
      }
    } catch (e) {
      addToast('Error loading accounts data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransferData();
  }, []);

  const handleAddBeneficiary = async (name, account_number, callback) => {
    setAddingBene(true);
    try {
      const response = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, account_number })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add contact');

      addToast('Beneficiary contact saved.', 'success');
      if (callback) callback();
      
      // reload
      const beneRes = await fetch('/api/beneficiaries');
      if (beneRes.ok) {
        const beneData = await beneRes.json();
        setBeneficiaries(beneData || []);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setAddingBene(false);
    }
  };

  const handleTransferSubmit = async () => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_account_id: parseInt(selectedAccId),
          recipient_identifier: recipient.trim(),
          amount: parseFloat(amount),
          category,
          note,
          security_pin: securityPin,
          is_express: isExpress
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Transfer dispatch failed');

      // Success
      setReceiptData({
        amount: parseFloat(amount),
        recipient: recipient.trim(),
        category,
        status: data.status // 'success' (express) or 'queued' (standard)
      });
      
      addToast(isExpress ? 'Transfer executed.' : 'Standard transfer request queued.', 'success');
      
      // Clear fields
      setRecipient('');
      setAmount('');
      setNote('');
      setSecurityPin('');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetReceipt = () => {
    setReceiptData(null);
    fetchTransferData();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader size="lg" />
      </div>
    );
  }

  if (receiptData) {
    return (
      <TransferSuccessScreen
        receipt={receiptData}
        onReset={handleResetReceipt}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          P2P Funds Transfer Portal
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          Dispatch secure transfers locally or register new contact identifiers.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '30px' }}>
        
        {/* Left: Transfer form panel */}
        <TransferForm
          accounts={accounts}
          selectedAccId={selectedAccId}
          setSelectedAccId={setSelectedAccId}
          recipient={recipient}
          setRecipient={setRecipient}
          amount={amount}
          setAmount={setAmount}
          category={category}
          setCategory={setCategory}
          note={note}
          setNote={setNote}
          securityPin={securityPin}
          setSecurityPin={setSecurityPin}
          isExpress={isExpress}
          setIsExpress={setIsExpress}
          onSubmit={handleTransferSubmit}
          loading={actionLoading}
        />

        {/* Right: Beneficiary management list */}
        <BeneficiaryManager
          beneficiaries={beneficiaries}
          onAddBeneficiary={handleAddBeneficiary}
          onSelectBeneficiary={(accNum) => {
            setRecipient(accNum);
            addToast(`Beneficiary account ${accNum} selected.`, 'info');
          }}
          adding={addingBene}
        />

      </div>
    </div>
  );
}
