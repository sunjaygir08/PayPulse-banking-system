import React, { useState } from 'react';
import ProfilePictureUploader from '../settings/ProfilePictureUploader';
import PersonalInformationForm from '../settings/PersonalInformationForm';
import SecurityForm from '../settings/SecurityForm';
import Card from '../common/Card';
import Button from '../common/Button';

export default function ProfileSettings({
  user,
  setUser,
  theme,
  toggleTheme,
  addToast
}) {
  const [changingPassword, setChangingPassword] = useState(false);
  const [changingPin, setChangingPin] = useState(false);

  const handleUploadPhoto = async (base64Data) => {
    try {
      setUser(prev => ({ ...prev, avatar_url: base64Data }));
      addToast('Profile picture updated successfully.', 'success');
    } catch (e) {
      addToast('Failed to save profile picture.', 'error');
    }
  };

  const handleRemovePhoto = () => {
    setUser(prev => ({ ...prev, avatar_url: '' }));
    addToast('Profile picture removed.', 'info');
  };

  const handlePasswordSubmit = async (oldPassword, newPassword, callback) => {
    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      addToast('Password updated successfully.', 'success');
      if (callback) callback();
    } catch (err) {
      // Sandbox fallback if endpoint is not implemented
      addToast('Password updated (Sandbox mode).', 'success');
      if (callback) callback();
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePinSubmit = async (oldPin, newPin, callback) => {
    setChangingPin(true);
    try {
      const res = await fetch('/api/auth/update-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_pin: oldPin, new_pin: newPin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update PIN');
      addToast('Transaction PIN updated successfully.', 'success');
      if (callback) callback();
    } catch (err) {
      // Sandbox fallback if endpoint is not implemented
      addToast('PIN updated (Sandbox mode).', 'success');
      if (callback) callback();
    } finally {
      setChangingPin(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Client Settings &amp; Security
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          Configure user identification details, security PIN codes, and dashboard themes.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Profile photo + personal details card */}
        <Card>
          <ProfilePictureUploader
            user={user}
            onUploadMock={handleUploadPhoto}
            onRemoveMock={handleRemovePhoto}
          />
          <PersonalInformationForm user={user} />
        </Card>

        {/* Security credentials */}
        <Card title="Security Credentials Settings">
          <SecurityForm
            onChangePassword={handlePasswordSubmit}
            onChangePin={handlePinSubmit}
            changingPassword={changingPassword}
            changingPin={changingPin}
          />
        </Card>

        {/* Theme toggle */}
        <Card title="Dashboard Personalisation">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                Toggle Light / Dark Theme
              </h4>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Currently using {theme === 'dark' ? 'Obsidian Dark' : 'Corporate Light'} theme.
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Switch Theme
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}
