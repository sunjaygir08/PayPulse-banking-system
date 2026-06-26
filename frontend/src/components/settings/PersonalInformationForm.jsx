import React from 'react';
import { User, CreditCard, Phone, Mail } from 'lucide-react';
import Input from '../common/Input';

export default function PersonalInformationForm({ user }) {
  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
        Customer Verification Record
      </h3>
      
      <div className="form-row">
        <Input
          label="Full Name"
          value={user.full_name || ''}
          icon={User}
          disabled
          title="Account name modifications require physical branch visits."
        />
        <Input
          label="Registered Email Address"
          value={user.email || ''}
          icon={Mail}
          disabled
          title="Contact details must be updated via client support."
        />
      </div>

      <div className="form-row">
        <Input
          label="Pakistani CNIC Number"
          value={user.cnic || 'N/A'}
          icon={CreditCard}
          disabled
          title="CNIC records are locked for security validation."
        />
        <Input
          label="Mobile Phone Number"
          value={user.mobile || 'N/A'}
          icon={Phone}
          disabled
          title="Mobile numbers are locked for OTP validations."
        />
      </div>
      
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
        🔐 These details are cryptographically locked for security compliance. If you need to make corrections, please contact our support desk.
      </span>
    </div>
  );
}
