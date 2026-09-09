import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, XCircle, Terminal, Lock, Sparkles, RefreshCw } from 'lucide-react';

export default function SafetyFilter({ safetyLogs }) {
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState(null);

  const runSafetyTest = (e) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    const harmfulKeywords = [
      'hack', 'steal', 'malware', 'virus', 'illegal', 'bomb', 'weapon', 
      'harm someone', 'kill', 'fraud', 'phishing', 'exploit', 'bypass security'
    ];
    const isHarmful = harmfulKeywords.some(kw => testQuery.toLowerCase().includes(kw));

    setTestResult({
      query: testQuery,
      status: isHarmful ? 'BLOCKED' : 'PASSED',
      reason: isHarmful 
        ? 'Flagged: Prompts containing malicious, illegal, or security bypass terms are rejected per Safety Protocol Directive 1.0.' 
        : 'Approved: Prompt is safe, constructive, and compliant with task management guidelines.',
      testedAt: new Date().toLocaleTimeString()
    });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Left Column: Safety Boundaries & Ethical Directives */}
      <div className="hud-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="hud-title" style={{ color: '#ff4d79', marginBottom: '0.5rem' }}>
          <ShieldAlert size={20} />
          <span>SAFETY & ETHICS GUARDRAILS</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          JARVIS operates under strict ethical guidelines. Requests causing direct or indirect harm, illegal acts, or privacy breaches are automatically blocked.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(255, 0, 85, 0.08)', border: '1px solid rgba(255, 0, 85, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
            <div style={{ color: '#ff4d79', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
              DIRECTIVE 1: Zero Illegal Assistance
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Rejects any request to generate exploit code, commit fraud, or engage in unauthorized access.
            </div>
          </div>

          <div style={{ background: 'rgba(255, 0, 85, 0.08)', border: '1px solid rgba(255, 0, 85, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
            <div style={{ color: '#ff4d79', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
              DIRECTIVE 2: Harm Prevention
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Refuses tasks involving physical harm, weapons, hazardous material creation, or malware deployment.
            </div>
          </div>

          <div style={{ background: 'rgba(0, 255, 157, 0.08)', border: '1px solid rgba(0, 255, 157, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
            <div style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
              DIRECTIVE 3: Confidentiality Enforcement
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              User data is never transmitted to untrusted external parties or stored outside local sandbox boundaries.
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Safety Test Bench & Flagged Incident Log */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Test Bench */}
        <div className="hud-card">
          <div className="hud-title" style={{ marginBottom: '0.75rem' }}>
            <Terminal size={18} />
            <span>SAFETY FILTER TEST BENCH</span>
          </div>

          <form onSubmit={runSafetyTest} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              className="hud-input" 
              placeholder="Test a command (e.g., 'Draft project timeline' vs 'How to hack website')..."
              value={testQuery}
              onChange={e => setTestQuery(e.target.value)}
            />
            <button type="submit" className="hud-btn hud-btn-primary" style={{ whiteSpace: 'nowrap' }}>
              TEST FILTER
            </button>
          </form>

          {testResult && (
            <div style={{ 
              background: testResult.status === 'BLOCKED' ? 'rgba(255, 0, 85, 0.15)' : 'rgba(0, 255, 157, 0.15)',
              border: testResult.status === 'BLOCKED' ? '1px solid #ff0055' : '1px solid var(--accent-green)',
              borderRadius: '8px',
              padding: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: testResult.status === 'BLOCKED' ? '#ff4d79' : 'var(--accent-green)', marginBottom: '0.3rem' }}>
                {testResult.status === 'BLOCKED' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                STATUS: {testResult.status}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                {testResult.reason}
              </p>
            </div>
          )}
        </div>

        {/* Flagged Incidents Stream */}
        <div className="hud-card" style={{ flex: 1 }}>
          <div className="hud-title" style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            <Lock size={16} /> FLAGGED INCIDENTS LOG ({safetyLogs.length})
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px' }}>
            {safetyLogs.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', padding: '1rem 0' }}>
                Zero safety violations recorded. System integrity is 100% clean.
              </div>
            ) : (
              safetyLogs.map(log => (
                <div key={log.id} style={{ fontSize: '0.8rem', color: '#ffb3c1', background: 'rgba(255, 0, 85, 0.08)', padding: '0.4rem 0.7rem', borderRadius: '4px', borderLeft: '2px solid #ff0055' }}>
                  <strong>[{log.timestamp}] Flagged query:</strong> "{log.query}"
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
