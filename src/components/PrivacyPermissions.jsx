import React from 'react';
import { ShieldCheck, Lock, Eye, CheckCircle, AlertTriangle, Key, ShieldAlert, Cpu, Activity } from 'lucide-react';

export default function PrivacyPermissions({ permissions, setPermissions, auditLogs }) {
  const togglePermission = (key) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Left Column: Granular Permission Controls */}
      <div className="hud-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="hud-title" style={{ marginBottom: '0.5rem' }}>
          <Key size={20} />
          <span>SYSTEM & PERSONAL PERMISSIONS VAULT</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          JARVIS strictly asks for permission before accessing system information or personal context. Toggle permissions below to grant or revoke access anytime.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Permission Item 1: System Calendar */}
          <div style={{ 
            background: 'rgba(5, 8, 17, 0.7)', 
            padding: '1rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border-cyan)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                System Calendar & Schedules
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Allows JARVIS to cross-check deadlines and suggest optimal focus blocks.
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={permissions.calendar} 
              onChange={() => togglePermission('calendar')}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>

          {/* Permission Item 2: Local Notes & Project Specs */}
          <div style={{ 
            background: 'rgba(5, 8, 17, 0.7)', 
            padding: '1rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border-cyan)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Work Files & Project Notes Access
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Required for the AI Work Analyzer to parse draft documents and offer code fixes.
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={permissions.workFiles} 
              onChange={() => togglePermission('workFiles')}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>

          {/* Permission Item 3: Personal Profile Context */}
          <div style={{ 
            background: 'rgba(5, 8, 17, 0.7)', 
            padding: '1rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border-cyan)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Personal Work Style & Preferences
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Enables JARVIS Brain to remember your working hours and task velocity.
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={permissions.personalInfo} 
              onChange={() => togglePermission('personalInfo')}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>

          {/* Permission Item 4: Voice Speech Synthesis */}
          <div style={{ 
            background: 'rgba(5, 8, 17, 0.7)', 
            padding: '1rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border-cyan)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Web Speech Audio Hardware
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Grants permission to use browser audio speech synthesis & microphone.
              </div>
            </div>
            <input 
              type="checkbox" 
              checked={permissions.voiceAudio} 
              onChange={() => togglePermission('voiceAudio')}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Confidentiality Certificate Card */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <div className="hud-badge hud-badge-green" style={{ width: '100%', justifyContent: 'center', padding: '0.6rem' }}>
            <ShieldCheck size={16} /> ABSOLUTE PRIVACY GUARANTEE: ZERO CLOUD DATA EXPORT
          </div>
        </div>
      </div>

      {/* Right Column: Privacy Audit Stream & Logs */}
      <div className="hud-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="hud-title" style={{ marginBottom: '0.5rem' }}>
          <Activity size={20} />
          <span>REAL-TIME PRIVACY AUDIT TRAIL</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Transparent record of all local data reads, writes, and privacy sandbox verifications.
        </p>

        <div style={{ 
          flex: 1, 
          background: 'rgba(5, 8, 17, 0.9)', 
          border: '1px solid var(--border-cyan)', 
          borderRadius: '8px', 
          padding: '0.85rem', 
          fontFamily: 'var(--font-code)', 
          fontSize: '0.8rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}>
          {auditLogs.map(log => (
            <div key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', borderBottom: '1px solid rgba(0,243,255,0.08)', paddingBottom: '0.4rem' }}>
              <span style={{ color: 'var(--accent-cyan)', whiteSpace: 'nowrap' }}>[{log.timestamp}]</span>
              <span style={{ color: log.type === 'grant' ? 'var(--accent-green)' : log.type === 'deny' ? '#ff0055' : 'var(--text-main)' }}>
                {log.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
