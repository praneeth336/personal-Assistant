import React, { useState } from 'react';
import { Database, Plus, Search, Trash2, Shield, Lock, Cpu, Sparkles, Clock, Tag } from 'lucide-react';

export default function MemoryVault({ memories, setMemories }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newCategory, setNewCategory] = useState('Work Pattern');
  const [newContent, setNewContent] = useState('');

  const handleAddMemory = (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const newMem = {
      id: Date.now().toString(),
      category: newCategory,
      content: newContent.trim(),
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMemories(prev => [newMem, ...prev]);
    setNewContent('');
  };

  const deleteMemory = (id) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const clearAllMemories = () => {
    if (window.confirm("Are you sure you want to wipe all stored memories in your local Jarvis Brain?")) {
      setMemories([]);
    }
  };

  const filteredMemories = memories.filter(m => 
    m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' }}>
      {/* Left Column: Add Memory Form & Security Specs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="hud-card">
          <div className="hud-title" style={{ marginBottom: '1rem' }}>
            <Plus size={18} />
            <span>RECORD NEW MEMORY</span>
          </div>

          <form onSubmit={handleAddMemory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Memory Category
              </label>
              <select 
                className="hud-input" 
                value={newCategory} 
                onChange={e => setNewCategory(e.target.value)}
              >
                <option value="Work Pattern">Work Pattern & Style</option>
                <option value="Personal Preference">Personal Preference</option>
                <option value="Project Context">Project & Code Context</option>
                <option value="Schedule Constraint">Schedule & Deadline Constraint</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Information / Constraint to Remember
              </label>
              <textarea 
                className="hud-input"
                rows={4}
                placeholder="e.g. Prefer 25-minute focus sprints. Never schedule major meetings on Friday afternoons."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="hud-btn hud-btn-primary" style={{ width: '100%' }}>
              <Sparkles size={16} /> ENCRYPT & SAVE TO BRAIN
            </button>
          </form>
        </div>

        {/* Security & Confidentiality Box */}
        <div className="hud-card" style={{ background: 'rgba(0, 243, 255, 0.05)', borderColor: 'rgba(0, 243, 255, 0.3)' }}>
          <div className="hud-title" style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            <Shield size={16} color="var(--accent-cyan)" /> BRAIN PRIVACY PROTOCOL
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Memories in your Jarvis Brain are stored inside your browser's private local storage. No external servers or third parties ever receive or parse your personal habits.
          </p>
        </div>
      </div>

      {/* Right Column: Stored Memory Stream */}
      <div className="hud-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="hud-title">
            <Database size={20} />
            <span>JARVIS BRAIN MEMORY STORE ({memories.length})</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input 
                type="text" 
                className="hud-input" 
                placeholder="Search brain..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
              />
            </div>

            {memories.length > 0 && (
              <button onClick={clearAllMemories} className="hud-btn hud-btn-danger" style={{ padding: '0.4rem 0.7rem', fontSize: '0.75rem' }}>
                <Trash2 size={12} /> WIPE BRAIN
              </button>
            )}
          </div>
        </div>

        {/* Memory Items Stream */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem', overflowY: 'auto' }}>
          {filteredMemories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
              <Lock size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <div>No brain records match your search criteria.</div>
            </div>
          ) : (
            filteredMemories.map(mem => (
              <div 
                key={mem.id}
                style={{
                  background: 'rgba(13, 22, 42, 0.8)',
                  border: '1px solid var(--border-cyan)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  justifyConstraints: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span className="hud-badge hud-badge-cyan">
                      <Tag size={10} /> {mem.category}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={10} /> {mem.timestamp}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {mem.content}
                  </p>
                </div>

                <button 
                  onClick={() => deleteMemory(mem.id)} 
                  className="hud-btn hud-btn-danger" 
                  style={{ padding: '0.3rem 0.5rem' }}
                  title="Forget memory"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
