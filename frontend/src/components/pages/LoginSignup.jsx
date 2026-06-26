import React, { useState } from 'react';
import { Mail, Lock, User, Key, Eye, EyeOff, CreditCard, Phone, ArrowLeft } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';
import Logo from '../common/Logo';

export default function LoginSignup({ 
  initialMode = 'login', 
  onAuthSuccess, 
  onBackToLanding, 
  addToast 
}) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration specific fields
  const [fullName, setFullName] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [cnic, setCnic] = useState('');
  const [mobile, setMobile] = useState('');

  // Show password toggle
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Clean CNIC format mask: #####-#######-#
  const handleCnicChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // numbers only
    if (value.length > 13) value = value.substr(0, 13);
    
    // Insert dashes
    let masked = '';
    for (let i = 0; i < value.length; i++) {
      if (i === 5) masked += '-';
      if (i === 12) masked += '-';
      masked += value[i];
    }
    setCnic(masked);
  };

  // Clean Mobile format mask: 03XX-XXXXXXX or similar
  const handleMobileChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // numbers only
    if (value.length > 11) value = value.substr(0, 11);

    let masked = '';
    for (let i = 0; i < value.length; i++) {
      if (i === 4) masked += '-';
      masked += value[i];
    }
    setMobile(masked);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email address is required.';
    if (!password) newErrors.password = 'Password is required.';

    if (mode === 'signup') {
      if (!fullName) newErrors.fullName = 'Full Name is required.';
      if (!securityPin || securityPin.length !== 4 || !/^\d+$/.test(securityPin)) {
        newErrors.securityPin = 'PIN must be a 4-digit number.';
      }
      if (!cnic || !/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
        newErrors.cnic = 'Invalid format. Expected: XXXXX-XXXXXXX-X';
      }
      if (!mobile || !/^03\d{2}-?\d{7}$/.test(mobile)) {
        newErrors.mobile = 'Invalid format. Expected: 03XX-XXXXXXX';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const bodyPayload = mode === 'login' 
      ? { email, password }
      : { email, password, full_name: fullName, security_pin: securityPin, cnic, mobile };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      addToast(mode === 'login' ? 'Signed in successfully.' : 'Account created successfully!', 'success');
      onAuthSuccess(data.user);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="bg-orb orb-one"></div>
      <div className="bg-orb orb-two"></div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px' }}>
        {/* Back Link */}
        <button
          onClick={onBackToLanding}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            cursor: 'pointer',
            marginBottom: '20px',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} /> Back to Portal
        </button>

        <Card 
          style={{ 
            padding: '40px',
            boxShadow: 'var(--card-shadow-hover)',
            borderRadius: '16px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Logo showText={true} size={36} className="justify-center" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '16px', color: 'var(--text-primary)' }}>
              {mode === 'login' ? 'Client Access Terminal' : 'Join PayPulse Banking'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {mode === 'login' ? 'Please enter your corporate credentials.' : 'Set up your secure deposit lines.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <Input
                  label="Full Name (As printed on CNIC)"
                  placeholder="e.g. Ali Ahmed"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={User}
                  error={errors.fullName}
                  required
                />
                
                <div className="form-row">
                  <Input
                    label="CNIC Number"
                    placeholder="42101-1234567-1"
                    value={cnic}
                    onChange={handleCnicChange}
                    icon={CreditCard}
                    error={errors.cnic}
                    required
                  />
                  <Input
                    label="Mobile Number"
                    placeholder="0300-1234567"
                    value={mobile}
                    onChange={handleMobileChange}
                    icon={Phone}
                    error={errors.mobile}
                    required
                  />
                </div>

                <Input
                  label="4-Digit Secure PIN (For transfers)"
                  placeholder="••••"
                  type="password"
                  maxLength={4}
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  icon={Key}
                  error={errors.securityPin}
                  required
                />
              </>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              error={errors.email}
              required
            />

            <div style={{ position: 'relative' }}>
              <Input
                label="Login Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                error={errors.password}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '38px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              loading={loading}
              style={{ width: '100%', padding: '12px 0', marginTop: '16px', fontWeight: 700 }}
            >
              {mode === 'login' ? 'Authenticate Account' : 'Initialize Account'}
            </Button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {mode === 'login' ? "Don't have an account?" : "Already registered?"}
            </span>{' '}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setErrors({});
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--brand-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {mode === 'login' ? 'Open Account' : 'Sign In Now'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
