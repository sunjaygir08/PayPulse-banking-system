import React, { useState } from 'react';
import { Lock, Key, ShieldCheck } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

export default function SecurityForm({ 
  onChangePassword, 
  onChangePin,
  changingPassword = false,
  changingPin = false 
}) {
  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');

  // PIN state
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPwdError('');

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('Password must be at least 6 characters.');
      return;
    }

    onChangePassword(oldPassword, newPassword, () => {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    });
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    setPinError('');

    if (newPin !== confirmPin) {
      setPinError('New PIN codes do not match.');
      return;
    }
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setPinError('PIN must be a 4-digit numeric code.');
      return;
    }

    onChangePin(oldPin, newPin, () => {
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
      
      {/* Change Password Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
          Change Account Password
        </h4>
        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            icon={Lock}
            required
          />
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={Key}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={Key}
            error={pwdError}
            required
          />
          <Button 
            type="submit" 
            variant="primary" 
            size="sm" 
            loading={changingPassword}
            style={{ alignSelf: 'flex-start', marginTop: '10px' }}
          >
            Update Password
          </Button>
        </form>
      </div>

      {/* Change Transaction PIN Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
          Change Transaction PIN
        </h4>
        <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Input
            label="Current 4-Digit PIN"
            type="password"
            placeholder="••••"
            maxLength={4}
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value)}
            icon={Lock}
            required
          />
          <Input
            label="New 4-Digit PIN"
            type="password"
            placeholder="••••"
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            icon={Key}
            required
          />
          <Input
            label="Confirm New PIN"
            type="password"
            placeholder="••••"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            icon={Key}
            error={pinError}
            required
          />
          <Button 
            type="submit" 
            variant="primary" 
            size="sm" 
            loading={changingPin}
            style={{ alignSelf: 'flex-start', marginTop: '10px' }}
          >
            Update PIN
          </Button>
        </form>
      </div>

    </div>
  );
}
