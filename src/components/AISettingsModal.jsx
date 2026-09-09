import React, { useState, useEffect } from 'react';
import { Settings, Key, Cpu, ShieldCheck, Check, Sparkles, X, RefreshCw } from 'lucide-react';
import { AI_PROVIDERS, getStoredAISettings, saveAISettings } from '../services/aiService';

export default function AISettingsModal({ isOpen, onClose }) {
  const [provider, setProvider] = useState(AI_PROVIDERS.LOCAL);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [testStatus, setTestStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getStoredAISettings();
      setProvider(current.provider);
      setApiKey(current.apiKey);
      setModel(current.model);
      setTestStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveAISettings(provider, apiKey.trim(), model);
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);

    if (provider === AI_PROVIDERS.LOCAL) {
      setTimeout(() => {
        setTestStatus({ success: true, message: "Local JARVIS Neural Engine is active and ready." });
        setIsTesting(false);
      }, 500);
      return;
    }

    if (!apiKey.trim()) {
      setTestStatus({ success: false, message: "Please enter an API Key first." });
      setIsTesting(false);
      return;
    }

    try {
      if (provider === AI_PROVIDERS.GEMINI) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey.trim()}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello, reply with OK" }] }]
          })
        });
        if (res.ok) {
          setTestStatus({ success: true, message: `Connected successfully to Google Gemini (${model})!` });
        } else {
          const err = await res.json();
          setTestStatus({ success: false, message: err.error?.message || "Gemini connection failed." });
        }
      } else if (provider === AI_PROVIDERS.OPENAI) {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`
          },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'hi' }]
          })
        });
        if (res.ok) {
          setTestStatus({ success: true, message: `Connected successfully to OpenAI ChatGPT (${model})!` });
        } else {
          const err = await res.json();
          setTestStatus({ success: false, message: err.error?.message || "OpenAI connection failed." });
        }
      }
    } catch (e) {
      setTestStatus({ success: false, message: e.message || "Network request failed." });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(4, 6, 13, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="hud-card" style={{ width: '100%', maxWidth: '520px', background: '#0a0f1d', border: '1px solid var(--border-cyan)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-cyan)', paddingBottom: '0.75rem' }}>
          <div className="hud-title" style={{ fontSize: '1.1rem' }}>
            <Key size={20} />
            <span>AI MODEL & API CONFIGURATION</span>
          </div>
          <button onClick={onClose} className="hud-btn" style={{ padding: '0.3rem 0.5rem' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Provider Selection */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Select AI Engine Provider
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[
                { id: AI_PROVIDERS.LOCAL, label: 'Local Engine', sub: 'Offline / Free' },
                { id: AI_PROVIDERS.GEMINI, label: 'Google Gemini', sub: 'Gemini 1.5 Flash' },
                { id: AI_PROVIDERS.OPENAI, label: 'OpenAI ChatGPT', sub: 'GPT-4o Mini' }
              ].map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  style={{
                    background: provider === p.id ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.25), rgba(112, 0, 255, 0.25))' : 'rgba(5, 8, 17, 0.6)',
                    border: provider === p.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-cyan)',
                    borderRadius: '8px',
                    padding: '0.6rem',
                    color: provider === p.id ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontFamily: 'var(--font-sub)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{p.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Model & Key Inputs (Only shown if external API selected) */}
          {provider !== AI_PROVIDERS.LOCAL && (
            <>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Model Target
                </label>
                <select 
                  className="hud-input" 
                  value={model} 
                  onChange={e => setModel(e.target.value)}
                >
                  {provider === AI_PROVIDERS.GEMINI ? (
                    <>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Accurate)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Reasoning)</option>
                      <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp (Experimental)</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4o-mini">gpt-4o-mini (Fast & Intelligent)</option>
                      <option value="gpt-4o">gpt-4o (Flagship Performance)</option>
                      <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  {provider === AI_PROVIDERS.GEMINI ? 'Google Gemini API Key' : 'OpenAI API Key'}
                </label>
                <input 
                  type="password" 
                  className="hud-input" 
                  placeholder={provider === AI_PROVIDERS.GEMINI ? 'AIzaSy...' : 'sk-proj-...'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Security Banner */}
          <div className="hud-badge hud-badge-cyan" style={{ fontSize: '0.75rem', justifyContent: 'center' }}>
            <ShieldCheck size={14} /> API Keys stay strictly in your local browser sandbox
          </div>

          {/* Test Status Banner */}
          {testStatus && (
            <div style={{
              background: testStatus.success ? 'rgba(0, 255, 157, 0.15)' : 'rgba(255, 0, 85, 0.15)',
              border: testStatus.success ? '1px solid var(--accent-green)' : '1px solid #ff0055',
              color: testStatus.success ? 'var(--accent-green)' : '#ff4d79',
              padding: '0.6rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.8rem'
            }}>
              {testStatus.message}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button 
              type="button" 
              onClick={handleTestConnection} 
              disabled={isTesting}
              className="hud-btn" 
              style={{ flex: 1 }}
            >
              {isTesting ? <RefreshCw className="spin-slow" size={14} /> : <Sparkles size={14} />}
              TEST API KEY
            </button>

            <button type="submit" className="hud-btn hud-btn-primary" style={{ flex: 1 }}>
              <Check size={16} /> SAVE CONFIG
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
