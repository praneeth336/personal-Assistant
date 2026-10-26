import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Key, Check, X, Eye, EyeOff, AlertTriangle, ExternalLink } from 'lucide-react';
import { verifySecurityPassword, getMasterPassword } from '../services/appLauncherService';

export default function SecurityAuthModal({ isOpen, app, onClose, onAuthorized }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMsg('');
      setShowPassword(false);
      setIsVerifying(false);
    }
  }, [isOpen, app]);

  if (!isOpen || !app) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Please enter your authorization password.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const isValid = verifySecurityPassword(password);
      if (isValid) {
        setErrorMsg('');
        setIsVerifying(false);
        onAuthorized(app);
      } else {
        setIsVerifying(false);
        setErrorMsg('Security Authentication Failed. Incorrect authorization password.');
      }
    }, 400);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 6, 15, 0.88)',
      backdropFilter: 'blur(10px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="hud-card" style={{
        width: '100%',
        maxWidth: '480px',
        background: '#090f20',
        border: '1px solid #ff0055',
        boxShadow: '0 0 30px rgba(255, 0, 85, 0.35)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          borderBottom: '1px solid rgba(255, 0, 85, 0.3)',
          paddingBottom: '0.75rem'
        }}>
          <div className="hud-title" style={{ fontSize: '1.05rem', color: '#ff4d79' }}>
            <Lock size={20} />
            <span>SECURITY ACCESS AUTHORIZATION</span>
          </div>
          <button 
            onClick={onClose} 
            className="hud-btn" 
            style={{ padding: '0.3rem 0.5rem', background: 'transparent', borderColor: 'rgba(255, 255, 255, 0.2)' }}
            title="Cancel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Target App Info Box */}
        <div style={{
          background: 'rgba(255, 0, 85, 0.08)',
          border: '1px solid rgba(255, 0, 85, 0.25)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(255, 0, 85, 0.25), rgba(112, 0, 255, 0.3))',
            border: '1px solid #ff0055',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ff4d79'
          }}>
            <ShieldAlert size={26} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff' }}>
              {app.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Category: <strong style={{ color: 'var(--accent-cyan)' }}>{app.category}</strong>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#ff4d79', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={10} /> Protected under User Security Credentials
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '1rem', lineHeight: '1.45' }}>
          JARVIS protocol requires Operator permission to access this secured application. Enter your master security password to confirm authorization:
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              User Authorization Password / Security PIN
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                className="hud-input"
                placeholder="Enter authorization password..."
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                autoFocus
                style={{
                  paddingRight: '2.5rem',
                  borderColor: errorMsg ? '#ff0055' : 'var(--border-cyan)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
              Default password: <code style={{ color: 'var(--accent-cyan)', background: 'rgba(0,243,255,0.1)', padding: '1px 5px', borderRadius: '3px' }}>jarvis123</code> (configurable in App Launcher & Security Vault)
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{
              background: 'rgba(255, 0, 85, 0.15)',
              border: '1px solid #ff0055',
              borderRadius: '6px',
              padding: '0.6rem 0.8rem',
              color: '#ff4d79',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <AlertTriangle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="hud-btn"
              style={{ flex: 1, borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-muted)' }}
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              disabled={isVerifying || !password}
              className="hud-btn hud-btn-primary" 
              style={{
                flex: 1.5,
                background: 'linear-gradient(135deg, #00f3ff, #00ff9d)',
                color: '#04060d'
              }}
            >
              {isVerifying ? (
                <>AUTHENTICATING...</>
              ) : (
                <>
                  <Key size={14} /> AUTHORIZE & OPEN
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security badge footer */}
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(0, 243, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontSize: '0.7rem',
          color: 'var(--text-dim)'
        }}>
          <ShieldCheck size={12} color="var(--accent-green)" /> End-to-End Local Credential Authentication
        </div>
      </div>
    </div>
  );
}
