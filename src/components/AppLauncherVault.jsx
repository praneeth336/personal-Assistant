import React, { useState } from 'react';
import { 
  Rocket, 
  Lock, 
  Unlock, 
  ExternalLink, 
  Plus, 
  ShieldCheck, 
  Key, 
  Trash2, 
  PlaySquare, 
  Mail, 
  Github, 
  MessageSquare, 
  HardDrive, 
  CreditCard, 
  Music, 
  Calculator, 
  Calendar, 
  Bot, 
  Briefcase, 
  Share2, 
  Globe, 
  Check, 
  Search,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { 
  getRegisteredApps, 
  saveRegisteredApps, 
  getMasterPassword, 
  setMasterPassword, 
  launchApp 
} from '../services/appLauncherService';

export default function AppLauncherVault({ onRequestAppLaunch, auditLogs }) {
  const [apps, setApps] = useState(() => getRegisteredApps());
  const [searchFilter, setSearchFilter] = useState('');
  
  // Custom App Form State
  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppCategory, setNewAppCategory] = useState('Productivity');
  const [newAppSecured, setNewAppSecured] = useState(false);
  const [formMsg, setFormMsg] = useState('');

  // Password Change State
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [passChangeMsg, setPassChangeMsg] = useState({ text: '', isError: false });

  // Toggle Security on any application
  const handleToggleSecurity = (appId) => {
    const updated = apps.map(app => {
      if (app.id === appId) {
        return { ...app, isSecured: !app.isSecured };
      }
      return app;
    });
    setApps(updated);
    saveRegisteredApps(updated);
  };

  // Add Custom App
  const handleAddApp = (e) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppUrl.trim()) return;

    let formattedUrl = newAppUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const newApp = {
      id: `custom-${Date.now()}`,
      name: newAppName.trim(),
      aliases: [newAppName.trim().toLowerCase()],
      url: formattedUrl,
      category: newAppCategory,
      icon: 'Globe',
      isSecured: newAppSecured,
      description: `User-defined application: ${newAppName.trim()}`
    };

    const updated = [newApp, ...apps];
    setApps(updated);
    saveRegisteredApps(updated);

    setNewAppName('');
    setNewAppUrl('');
    setNewAppSecured(false);
    setFormMsg('Application registered successfully!');
    setTimeout(() => setFormMsg(''), 2500);
  };

  // Delete App
  const handleDeleteApp = (appId) => {
    const updated = apps.filter(a => a.id !== appId);
    setApps(updated);
    saveRegisteredApps(updated);
  };

  // Change Master Password
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    const actualCurrent = getMasterPassword();
    if (currentPassInput.trim() !== actualCurrent.trim()) {
      setPassChangeMsg({ text: 'Current password incorrect.', isError: true });
      return;
    }
    if (newPassInput.trim().length < 4) {
      setPassChangeMsg({ text: 'New password must be at least 4 characters.', isError: true });
      return;
    }

    const success = setMasterPassword(newPassInput.trim());
    if (success) {
      setPassChangeMsg({ text: 'Master authorization password updated successfully!', isError: false });
      setCurrentPassInput('');
      setNewPassInput('');
      setTimeout(() => setPassChangeMsg({ text: '', isError: false }), 3000);
    }
  };

  // Filter apps
  const filteredApps = apps.filter(a => 
    a.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    a.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Icon Resolver
  const renderAppIcon = (iconName, category) => {
    const props = { size: 20 };
    switch (iconName) {
      case 'PlaySquare': return <PlaySquare {...props} color="#ff0055" />;
      case 'Mail': return <Mail {...props} color="#00f3ff" />;
      case 'Github': return <Github {...props} color="#fff" />;
      case 'MessageSquare': return <MessageSquare {...props} color="#00ff9d" />;
      case 'HardDrive': return <HardDrive {...props} color="#ffb703" />;
      case 'CreditCard': return <CreditCard {...props} color="#ff0055" />;
      case 'Music': return <Music {...props} color="#00ff9d" />;
      case 'Calculator': return <Calculator {...props} color="#00f3ff" />;
      case 'Calendar': return <Calendar {...props} color="#8b5cf6" />;
      case 'Bot': return <Bot {...props} color="#00f3ff" />;
      case 'Briefcase': return <Briefcase {...props} color="#00f3ff" />;
      case 'Share2': return <Share2 {...props} color="#fff" />;
      default: return <Globe {...props} color="var(--accent-cyan)" />;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', height: 'calc(100vh - 140px)' }}>
      {/* Left Column: Application Registry Grid */}
      <div className="hud-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header & Search */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-cyan)',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div>
            <div className="hud-title" style={{ fontSize: '1.1rem' }}>
              <Rocket size={20} />
              <span>APPLICATION LAUNCHER & SECURITY VAULT</span>
            </div>
            <div className="hud-sub" style={{ fontSize: '0.8rem' }}>
              Voice command: "JARVIS open YouTube", "open Gmail", etc. Secured apps require authorization.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative', width: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="text"
                className="hud-input"
                placeholder="Search apps..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{ paddingLeft: '2rem', paddingRight: '0.5rem', fontSize: '0.8rem', paddingBlock: '0.4rem' }}
              />
            </div>
          </div>
        </div>

        {/* Quick Voice Instructions Banner */}
        <div style={{
          background: 'rgba(0, 243, 255, 0.06)',
          border: '1px dashed var(--border-cyan)',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem'
        }}>
          <div>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>🎙️ Voice / Command syntax:</span>{" "}
            Say <code style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>jarvis open youtube</code> or{" "}
            <code style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>open gmail</code>
          </div>
          <span className="hud-badge hud-badge-cyan">
            {apps.filter(a => a.isSecured).length} SECURED / {apps.length} TOTAL
          </span>
        </div>

        {/* Apps Grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '0.85rem',
          paddingRight: '0.5rem'
        }}>
          {filteredApps.map(app => (
            <div 
              key={app.id}
              style={{
                background: 'rgba(13, 22, 42, 0.85)',
                border: app.isSecured ? '1px solid rgba(255, 0, 85, 0.35)' : '1px solid var(--border-cyan)',
                borderRadius: '10px',
                padding: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow: app.isSecured ? '0 0 10px rgba(255,0,85,0.08)' : 'none'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(5, 8, 17, 0.9)',
                      border: '1px solid var(--border-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {renderAppIcon(app.icon, app.category)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#fff' }}>
                        {app.name}
                      </h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {app.category}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleToggleSecurity(app.id)}
                    className="hud-btn"
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.7rem',
                      background: app.isSecured ? 'rgba(255, 0, 85, 0.2)' : 'rgba(0, 255, 157, 0.1)',
                      borderColor: app.isSecured ? '#ff0055' : 'var(--accent-green)',
                      color: app.isSecured ? '#ff4d79' : 'var(--accent-green)'
                    }}
                    title={app.isSecured ? "Click to make Open" : "Click to require Password"}
                  >
                    {app.isSecured ? <Lock size={12} /> : <Unlock size={12} />}
                    <span>{app.isSecured ? 'LOCKED' : 'OPEN'}</span>
                  </button>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem', lineHeight: '1.3' }}>
                  {app.description || app.url}
                </p>
              </div>

              {/* Bottom Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <span style={{ fontSize: '0.68rem', color: app.isSecured ? '#ff4d79' : 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {app.isSecured ? <Lock size={10} /> : <Unlock size={10} />}
                  {app.isSecured ? 'Requires Password' : 'Direct Launch'}
                </span>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {app.id.startsWith('custom-') && (
                    <button
                      onClick={() => handleDeleteApp(app.id)}
                      className="hud-btn hud-btn-danger"
                      style={{ padding: '0.25rem 0.5rem' }}
                      title="Remove App"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}

                  <button 
                    onClick={() => onRequestAppLaunch(app)}
                    className="hud-btn hud-btn-primary"
                    style={{
                      padding: '0.35rem 0.8rem',
                      fontSize: '0.75rem',
                      background: app.isSecured ? 'linear-gradient(135deg, #ff0055, #7000ff)' : 'linear-gradient(135deg, #00f3ff, #00ff9d)'
                    }}
                  >
                    <ExternalLink size={12} />
                    <span>LAUNCH</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Add Custom App & Security Password Manager */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
        {/* Register New Application Form */}
        <div className="hud-card">
          <div className="hud-title" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
            <Plus size={16} />
            <span>REGISTER CUSTOM APP</span>
          </div>

          <form onSubmit={handleAddApp} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                Application Name
              </label>
              <input 
                type="text"
                className="hud-input"
                placeholder="e.g. Netflix, Figma, Jira..."
                value={newAppName}
                onChange={e => setNewAppName(e.target.value)}
                required
                style={{ paddingBlock: '0.5rem', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                App URL or URI Protocol
              </label>
              <input 
                type="text"
                className="hud-input"
                placeholder="e.g. https://netflix.com"
                value={newAppUrl}
                onChange={e => setNewAppUrl(e.target.value)}
                required
                style={{ paddingBlock: '0.5rem', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                Category
              </label>
              <select 
                className="hud-input"
                value={newAppCategory}
                onChange={e => setNewAppCategory(e.target.value)}
                style={{ paddingBlock: '0.5rem', fontSize: '0.85rem' }}
              >
                <option value="Productivity">Productivity & Tools</option>
                <option value="Entertainment">Entertainment & Media</option>
                <option value="Developer">Developer & Engineering</option>
                <option value="Communication">Private Communication</option>
                <option value="Financial">Financial & Banking</option>
              </select>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(5, 8, 17, 0.7)',
              padding: '0.6rem 0.8rem',
              borderRadius: '6px',
              border: '1px solid var(--border-cyan)'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>Require Password</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Must verify credentials to open</div>
              </div>
              <input 
                type="checkbox"
                checked={newAppSecured}
                onChange={e => setNewAppSecured(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#ff0055', cursor: 'pointer' }}
              />
            </div>

            {formMsg && (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', textAlign: 'center' }}>
                {formMsg}
              </div>
            )}

            <button type="submit" className="hud-btn hud-btn-primary" style={{ width: '100%', padding: '0.6rem' }}>
              <Plus size={14} /> ADD APPLICATION
            </button>
          </form>
        </div>

        {/* Master Security Password Settings */}
        <div className="hud-card" style={{ borderColor: 'rgba(255, 0, 85, 0.3)' }}>
          <div className="hud-title" style={{ fontSize: '0.95rem', color: '#ff4d79', marginBottom: '0.75rem' }}>
            <Key size={16} />
            <span>SECURITY CREDENTIALS VAULT</span>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
            Set or update your master password required to open secured applications (like Gmail, Banking, Drive).
          </p>

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                Current Password (Default: jarvis123)
              </label>
              <input 
                type="password"
                className="hud-input"
                placeholder="Enter current password..."
                value={currentPassInput}
                onChange={e => setCurrentPassInput(e.target.value)}
                required
                style={{ paddingBlock: '0.45rem', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                New Security Password
              </label>
              <input 
                type="password"
                className="hud-input"
                placeholder="Enter new master password..."
                value={newPassInput}
                onChange={e => setNewPassInput(e.target.value)}
                required
                style={{ paddingBlock: '0.45rem', fontSize: '0.85rem' }}
              />
            </div>

            {passChangeMsg.text && (
              <div style={{
                fontSize: '0.75rem',
                color: passChangeMsg.isError ? '#ff4d79' : 'var(--accent-green)',
                padding: '0.3rem',
                borderRadius: '4px'
              }}>
                {passChangeMsg.text}
              </div>
            )}

            <button type="submit" className="hud-btn" style={{ width: '100%', padding: '0.55rem', fontSize: '0.75rem' }}>
              <Key size={14} /> UPDATE SECURITY PASSWORD
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
