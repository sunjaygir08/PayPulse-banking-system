import React, { useState } from 'react';
import { PlusCircle, Landmark, Receipt } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

export default function AddBillForm({ 
  onSubmit, 
  loading = false 
}) {
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('utilities');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!payee || !amount || !dueDate) return;
    
    onSubmit({
      payee,
      amount: parseFloat(amount),
      due_date: dueDate,
      category
    }, () => {
      // Reset form
      setPayee('');
      setAmount('');
      setDueDate('');
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Input
        label="Utility Provider / Payee Name"
        placeholder="e.g. K-Electric Corp"
        value={payee}
        onChange={(e) => setPayee(e.target.value)}
        required
      />

      <div className="form-row">
        <Input
          label="Billing Amount (PKR)"
          placeholder="0.00"
          type="number"
          step="0.01"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label className="form-label">Billing Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-input"
        >
          <option value="utilities">Utilities (Electricity/Gas/Water)</option>
          <option value="entertainment">Subscribed Services (Netflix/Spotify)</option>
          <option value="insurance">Insurance Premiums</option>
          <option value="other">Miscellaneous</option>
        </select>
      </div>

      <Button type="submit" variant="primary" loading={loading} style={{ width: '100%' }}>
        <PlusCircle size={16} /> Schedule Invoice
      </Button>
    </form>
  );
}
