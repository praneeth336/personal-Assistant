import React, { useState, useEffect } from 'react';
import { 
  Key, Sparkles, CheckCircle2, AlertTriangle, XCircle, RefreshCw, 
  Send, Eye, EyeOff, ShieldCheck, Zap, Trash2, Check, Globe, Cpu, ArrowRight 
} from 'lucide-react';
import { 
  AI_PROVIDERS, 
  getStoredAISettings, 
  saveAISettings, 
  testApiKeyConnection,
  getSavedKeySlots,
  saveKeySlots,
  queryJARVIS
} from '../services/aiService';

export default function APIKeySlotPanel({ onKeyActivated, onClose }) {
  const [activeSettings, setActiveSettings] = useState(getStoredAISettings());
  const [keySlots, setKeySlots] = useState(getSavedKeySlots());
  
  // Input Slot Form State
  const [slotLabel, setSlotLabel] = useState('');
  const [provider, setProvider] = useState(activeSettings.provider);
  const [apiKey, setApiKey] = useState(activeSettings.apiKey || '');
  const [model, setModel] = useState(activeSettings.model);
  const [showKey, setShowKey] = useState(false);

  // Testing & Diagnostics State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [activationFeedback, setActivationFeedback] = useState('');

  // Sample Query Tester State
  const [testPrompt, setTestPrompt] = useState('Explain what makes quantum computers fast in 2 sentences.');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState('');

  useEffect(() => {
    const current = getStoredAISettings();
    setActiveSettings(current);
  }, []);

  // Auto-detect provider based on pasted key prefix
  const handleKeyChange = (val) => {
    setApiKey(val);
    const trimmed = val.trim();
    if (trimmed.startsWith('sk-') && !trimmed.startsWith('gsk_')) {
      setProvider(AI_PROVIDERS.OPENAI);
      setModel('gpt-4o-mini');
    } else if (trimmed.startsWith('AIzaSy')) {
      setProvider(AI_PROVIDERS.GEMINI);
      setModel('gemini-1.5-flash');
    } else if (trimmed.startsWith('gsk_')) {
      setProvider(AI_PROVIDERS.GROQ);
      setModel('llama-3.3-70b-versatile');
    }
  };

  // Test the current slot key connection live
  const handleTestKey = async (prov = provider, key = apiKey, mdl = model) => {
    setIsTesting(true);
    setTestResult(null);

    const result = await testApiKeyConnection(prov, key, mdl);
    setTestResult(result);
    setIsTesting(false);
  };

  // Activate the current key into JARVIS
  const handleActivateKey = (prov = provider, key = apiKey, mdl = model, label = slotLabel) => {
    saveAISettings(prov, key.trim(), mdl);
    const updated = { provider: prov, apiKey: key.trim(), model: mdl };
    setActiveSettings(updated);

    // Update slots active flag
    const updatedSlots = keySlots.map(s => ({
      ...s,
      isActive: (s.provider === prov && s.apiKey === key.trim())
    }));
    setKeySlots(updatedSlots);
    saveKeySlots(updatedSlots);

    setActivationFeedback(`✅ Activated! JARVIS is now using ${prov.toUpperCase()} (${mdl}) for all queries.`);
    setTimeout(() => setActivationFeedback(''), 4000);

    if (onKeyActivated) onKeyActivated(updated);
  };

  // Save as a permanent slot
  const handleSaveSlot = () => {
    if (!apiKey.trim() && provider !== AI_PROVIDERS.LOCAL) {
      alert("Please provide an API Key before saving a slot.");
      return;
    }

    const newSlot = {
      id: 'slot-' + Date.now(),
      label: slotLabel.trim() || `${provider.toUpperCase()} Slot`,
      provider,
      apiKey: apiKey.trim(),
      model,
      isActive: false,
      lastTested: new Date().toLocaleTimeString(),
      testStatus: testResult
    };

    const newSlots = [...keySlots, newSlot];
    setKeySlots(newSlots);
    saveKeySlots(newSlots);
    setSlotLabel('');
    alert(`Slot "${newSlot.label}" saved! You can now test or activate it anytime.`);
  };

  // Delete a saved slot
  const handleDeleteSlot = (id) => {
    const filtered = keySlots.filter(s => s.id !== id);
    setKeySlots(filtered);
    saveKeySlots(filtered);
  };

  // Run a quick query to test the active key output live
  const handleRunTestQuery = async () => {
    if (!testPrompt.trim() || isQuerying) return;
    setIsQuerying(true);
    setQueryResult('');

    try {
      const response = await queryJARVIS(testPrompt, false);
      setQueryResult(response.answer || response.summary || 'No answer returned.');
    } catch (e) {
      setQueryResult(`Error: ${e.message}`);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Active Engine Summary Banner */}
      <div className="hud-card" style={{ 
        background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.1), rgba(112, 0, 255, 0.15))', 
        borderColor: 'var(--accent-cyan)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1rem 1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, #00f3ff, #7000ff)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: 'var(--cyan-glow)'
          }}>
            <Key size={20} color="#04060d" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hud)', letterSpacing: '1px' }}>
              CURRENTLY ACTIVE INTELLIGENCE ENGINE
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{activeSettings.provider.toUpperCase()}</span>
              <span className="hud-badge hud-badge-cyan" style={{ fontSize: '0.75rem' }}>
                {activeSettings.model}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
                {activeSettings.apiKey ? `(Key: ${activeSettings.apiKey.slice(0, 7)}••••${activeSettings.apiKey.slice(-4)})` : '(Free Web Engine)'}
              </span>
            </div>
          </div>
        </div>

        {activationFeedback && (
          <div style={{ background: 'rgba(0, 255, 157, 0.15)', border: '1px solid var(--accent-green)', padding: '0.4rem 0.8rem', borderRadius: '6px', color: 'var(--accent-green)', fontSize: '0.85rem' }}>
            {activationFeedback}
          </div>
        )}
      </div>

      {/* Main Two-Column Layout: Key Integration Slot + Saved Slots Bench */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.25rem' }}>
        
        {/* Left Column: API Key Integration & Testing Slot */}
        <div className="hud-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="hud-title" style={{ fontSize: '1.05rem', color: 'var(--accent-cyan)' }}>
            <Zap size={18} />
            <span>INTEGRATE & TEST API KEY SLOT</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Paste any API key below. You can test it live against the provider to check latency, validity, and quotas before activating it.
          </p>

          {/* Provider Selection Buttons */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontFamily: 'var(--font-hud)' }}>
              1. SELECT PROVIDER
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
              {[
                { id: AI_PROVIDERS.OPENAI, label: 'OpenAI', icon: '🤖' },
                { id: AI_PROVIDERS.GEMINI, label: 'Gemini', icon: '✨' },
                { id: AI_PROVIDERS.GROQ, label: 'Groq', icon: '⚡' },
                { id: AI_PROVIDERS.LOCAL, label: 'Free Web', icon: '🌐' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProvider(p.id);
                    if (p.id === AI_PROVIDERS.OPENAI) setModel('gpt-4o-mini');
                    if (p.id === AI_PROVIDERS.GEMINI) setModel('gemini-1.5-flash');
                    if (p.id === AI_PROVIDERS.GROQ) setModel('llama-3.3-70b-versatile');
                  }}
                  style={{
                    background: provider === p.id ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.25), rgba(112, 0, 255, 0.25))' : 'rgba(5, 8, 17, 0.7)',
                    borderColor: provider === p.id ? 'var(--accent-cyan)' : 'var(--border-cyan)',
                    color: provider === p.id ? '#fff' : 'var(--text-muted)',
                    borderRadius: '8px',
                    padding: '0.5rem 0.2rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: provider === p.id ? 'bold' : 'normal',
                    fontFamily: 'var(--font-sub)',
                    border: '1px solid',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div>{p.icon} {p.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Key Input Slot */}
          {provider !== AI_PROVIDERS.LOCAL && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hud)' }}>
                  2. PASTE API KEY IN THIS SLOT
                </label>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                  {apiKey.startsWith('sk-') ? 'Detected: OpenAI' : apiKey.startsWith('AIzaSy') ? 'Detected: Gemini' : apiKey.startsWith('gsk_') ? 'Detected: Groq' : ''}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  className="hud-input"
                  placeholder={provider === AI_PROVIDERS.OPENAI ? 'sk-...' : provider === AI_PROVIDERS.GEMINI ? 'AIzaSy...' : 'gsk_...'}
                  value={apiKey}
                  onChange={e => handleKeyChange(e.target.value)}
                  style={{ paddingRight: '2.5rem', fontFamily: 'var(--font-code)', fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
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
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Model Selector */}
          {provider !== AI_PROVIDERS.LOCAL && (
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontFamily: 'var(--font-hud)' }}>
                3. SELECT MODEL TARGET
              </label>
              <select
                className="hud-input"
                value={model}
                onChange={e => setModel(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              >
                {provider === AI_PROVIDERS.OPENAI && (
                  <>
                    <option value="gpt-4o-mini">gpt-4o-mini (Fastest, Smart & Economical)</option>
                    <option value="gpt-4o">gpt-4o (Flagship Omni Performance)</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                  </>
                )}
                {provider === AI_PROVIDERS.GEMINI && (
                  <>
                    <option value="gemini-1.5-flash">gemini-1.5-flash (High Speed & Accurate)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Multimodal Reasoning)</option>
                    <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp (Next-Gen)</option>
                  </>
                )}
                {provider === AI_PROVIDERS.GROQ && (
                  <>
                    <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Ultra Fast 70B)</option>
                    <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Sub-100ms Latency)</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Optional Slot Label */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontFamily: 'var(--font-hud)' }}>
              OPTIONAL: SLOT NAME / ALIAS
            </label>
            <input
              type="text"
              className="hud-input"
              placeholder="e.g. My Personal OpenAI Key, Work Key..."
              value={slotLabel}
              onChange={e => setSlotLabel(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          {/* Live Diagnostic Testing Result Card */}
          {testResult && (
            <div style={{
              background: testResult.success ? 'rgba(0, 255, 157, 0.12)' : 'rgba(255, 0, 85, 0.15)',
              border: `1px solid ${testResult.success ? 'var(--accent-green)' : '#ff0055'}`,
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: '0.85rem', 
                  color: testResult.success ? 'var(--accent-green)' : '#ff4d79',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  {testResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {testResult.success ? 'CONNECTION VALID & OPERATIONAL' : 'CONNECTION DIAGNOSTIC FAILED'}
                </span>
                {testResult.latency > 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
                    Latency: {testResult.latency}ms
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: 0, lineHeight: '1.4' }}>
                {testResult.message}
              </p>
            </div>
          )}

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleTestKey()}
              disabled={isTesting}
              className="hud-btn"
              style={{
                flex: 1,
                borderColor: 'var(--accent-cyan)',
                color: 'var(--accent-cyan)',
                padding: '0.6rem 1rem',
                fontSize: '0.85rem'
              }}
            >
              {isTesting ? <RefreshCw className="spin-slow" size={15} /> : <Zap size={15} />}
              <span>{isTesting ? 'TESTING CONNECTION...' : '🧪 TEST KEY CONNECTION'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleActivateKey()}
              className="hud-btn hud-btn-primary"
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                fontSize: '0.85rem'
              }}
            >
              <Check size={15} />
              <span>ACTIVATE & BIND KEY</span>
            </button>

            <button
              type="button"
              onClick={handleSaveSlot}
              className="hud-btn"
              style={{
                borderColor: 'var(--accent-purple)',
                color: 'var(--accent-purple)',
                padding: '0.6rem 0.85rem',
                fontSize: '0.8rem'
              }}
              title="Save to multiple slots bench"
            >
              + SAVE AS SLOT
            </button>
          </div>
        </div>

        {/* Right Column: Multi-Key Slots Bench & Live Prompt Sandbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Saved Slots Bench */}
          <div className="hud-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="hud-title" style={{ fontSize: '1rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={16} color="var(--accent-purple)" />
                <span>SAVED KEY SLOTS BENCH ({keySlots.length})</span>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Compare your saved keys side-by-side. Click <strong>TEST</strong> to verify each one, or <strong>ACTIVATE</strong> to switch on the fly.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto' }}>
              {keySlots.map((slot) => {
                const isActive = activeSettings.provider === slot.provider && 
                  (slot.provider === AI_PROVIDERS.LOCAL || activeSettings.apiKey === slot.apiKey);

                return (
                  <div
                    key={slot.id}
                    style={{
                      background: isActive ? 'rgba(0, 243, 255, 0.08)' : 'rgba(5, 8, 17, 0.7)',
                      border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-cyan)'}`,
                      borderRadius: '8px',
                      padding: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{slot.label}</span>
                        {isActive && (
                          <span className="hud-badge hud-badge-green" style={{ fontSize: '0.65rem' }}>
                            ● ACTIVE ENGINE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-code)' }}>
                        Provider: <strong style={{ color: 'var(--accent-cyan)' }}>{slot.provider.toUpperCase()}</strong> | Model: {slot.model}
                      </div>
                      {slot.apiKey && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
                          Key: {slot.apiKey.slice(0, 7)}••••••••{slot.apiKey.slice(-4)}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <button
                        onClick={() => handleTestKey(slot.provider, slot.apiKey, slot.model)}
                        className="hud-btn"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        title="Test this key connection"
                      >
                        TEST
                      </button>

                      {!isActive && (
                        <button
                          onClick={() => handleActivateKey(slot.provider, slot.apiKey, slot.model, slot.label)}
                          className="hud-btn hud-btn-primary"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          title="Activate this key"
                        >
                          ACTIVATE
                        </button>
                      )}

                      {slot.id !== 'slot-default-openai' && slot.id !== 'slot-free-knowledge' && (
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Delete slot"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Prompt Output Sandbox */}
          <div className="hud-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div className="hud-title" style={{ fontSize: '0.95rem', color: 'var(--accent-green)' }}>
              <Cpu size={16} />
              <span>TEST QUERY SANDBOX (Verify Output Quality)</span>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Send a test query using your currently active engine to verify response quality and format.
            </p>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                className="hud-input"
                value={testPrompt}
                onChange={e => setTestPrompt(e.target.value)}
                placeholder="Ask any test prompt..."
                style={{ fontSize: '0.85rem' }}
              />
              <button
                type="button"
                onClick={handleRunTestQuery}
                disabled={isQuerying}
                className="hud-btn hud-btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              >
                {isQuerying ? <RefreshCw className="spin-slow" size={14} /> : <Send size={14} />}
                <span>{isQuerying ? 'RUNNING...' : 'RUN'}</span>
              </button>
            </div>

            {queryResult && (
              <div style={{
                background: 'rgba(5, 8, 17, 0.95)',
                border: '1px solid var(--border-cyan)',
                borderRadius: '8px',
                padding: '0.75rem',
                maxHeight: '140px',
                overflowY: 'auto',
                fontSize: '0.85rem',
                color: '#e2e8f0',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}>
                {queryResult}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
