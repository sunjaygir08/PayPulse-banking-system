import React, { useState } from 'react';
import { Camera, Trash2, User } from 'lucide-react';
import Button from '../common/Button';

export default function ProfilePictureUploader({ user, onUploadMock, onRemoveMock }) {
  const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || '');

  const getInitials = () => {
    if (!user?.full_name) return 'PB';
    const parts = user.full_name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.full_name.substr(0, 2).toUpperCase();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        if (onUploadMock) onUploadMock(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    if (onRemoveMock) onRemoveMock();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--card-border)', marginBottom: '24px' }}>
      <div style={{ position: 'relative' }}>
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Avatar" 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '2px solid var(--card-border)' 
            }} 
          />
        ) : (
          <div 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--brand-secondary)', 
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 800,
              letterSpacing: '1px',
              border: '2px solid var(--card-border)'
            }}
          >
            {getInitials()}
          </div>
        )}
        <label 
          htmlFor="avatar-upload" 
          style={{ 
            position: 'absolute', 
            bottom: '-4px', 
            right: '-4px', 
            width: '28px', 
            height: '28px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--brand-primary)', 
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            border: '2px solid var(--bg-secondary)'
          }}
          title="Upload Picture"
        >
          <Camera size={14} />
          <input 
            type="file" 
            id="avatar-upload" 
            accept="image/*" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
        </label>
      </div>

      <div>
        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          Profile Identification Photo
        </h4>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
          JPG or PNG formats under 2MB. This image is displayed across internal transaction receipts.
        </p>
        {previewUrl && (
          <Button 
            onClick={handleRemove} 
            variant="outline" 
            size="sm"
            style={{ 
              padding: '4px 8px', 
              height: '26px', 
              fontSize: '0.75rem', 
              color: 'var(--expense-color)', 
              borderColor: 'rgba(220, 53, 69, 0.15)' 
            }}
          >
            <Trash2 size={12} /> Remove Photo
          </Button>
        )}
      </div>
    </div>
  );
}
