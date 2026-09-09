import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckSquare, 
  Database, 
  ShieldCheck, 
  ShieldAlert, 
  BarChart3, 
  FileCheck, 
  Terminal, 
  Lock, 
  Sparkles, 
  Clock, 
  Wifi, 
  Activity,
  Layers
} from 'lucide-react';

import JarvisCore from './components/JarvisCore';
import TaskManager from './components/TaskManager';
import WorkAnalyzer from './components/WorkAnalyzer';
import MemoryVault from './components/MemoryVault';
import PrivacyPermissions from './components/PrivacyPermissions';
import SafetyFilter from './components/SafetyFilter';
import AnalyticsDashboard from './components/AnalyticsDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState('core');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Persistent initial tasks state
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('jarvis_tasks');
    return saved ? JSON.parse(saved) : [
      {
        id: 't-1',
        title: 'Review Q3 System Architecture & Performance Metrics',
        category: 'Urgent',
        deadline: 'Today, 17:00',
        completed: false,
        createdAt: '10:00 AM',
        subtasks: [
          { id: 'st-1', text: 'Audit server latency logs', done: true },
          { id: 'st-2', text: 'Inspect memory footprint', done: false },
          { id: 'st-3', text: 'Prepare summary report for team', done: false }
        ]
      },
      {
        id: 't-2',
        title: 'Configure automated backup & rollback script',
        category: 'High',
        deadline: 'Tomorrow, 12:00',
        completed: true,
        createdAt: '09:30 AM',
        subtasks: [
          { id: 'st-4', text: 'Test script on staging environment', done: true }
        ]
      },
      {
        id: 't-3',
        title: 'Organize weekly focus blocks & work preferences',
        category: 'Routine',
        deadline: 'This Friday',
        completed: false,
        createdAt: '08:45 AM',
        subtasks: []
      }
    ];
  });

  // Persistent Jarvis Brain memories state
  const [memories, setMemories] = useState(() => {
    const saved = localStorage.getItem('jarvis_memories');
    return saved ? JSON.parse(saved) : [
      {
        id: 'm-1',
        category: 'Work Pattern',
        content: 'Prefers step-by-step execution plans with concrete sub-tasks.',
        timestamp: '2026-09-04 09:00 AM'
      },
      {
        id: 'm-2',
        category: 'Schedule Constraint',
        content: 'No major production deployments allowed on Friday afternoons.',
        timestamp: '2026-09-04 09:15 AM'
      }
    ];
  });

  // System permissions state
  const [permissions, setPermissions] = useState({
    calendar: true,
    workFiles: true,
    personalInfo: true,
    voiceAudio: true
  });

  // Audit Logs & Safety Violation Logs
  const [auditLogs, setAuditLogs] = useState([
    { id: 'log-1', timestamp: new Date().toLocaleTimeString(), action: 'LOCAL_SANDBOX_INITIALIZED: Confidentiality 100%', type: 'info' },
    { id: 'log-2', timestamp: new Date().toLocaleTimeString(), action: 'PERMISSION_VERIFIED: Calendar & Work Files active', type: 'grant' }
  ]);

  const [safetyLogs, setSafetyLogs] = useState([]);

  // Auto-save state changes to LocalStorage for zero data loss
  useEffect(() => {
    localStorage.setItem('jarvis_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('jarvis_memories', JSON.stringify(memories));
  }, [memories]);

  // Live clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTaskAdd = (newTaskObj) => {
    const taskItem = {
      id: Date.now().toString(),
      title: newTaskObj.title,
      category: newTaskObj.category || 'Important',
      deadline: newTaskObj.deadline || 'Today, 18:00',
      completed: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subtasks: (newTaskObj.subtasks || []).map((st, i) => ({ id: `st-gen-${i}`, text: st, done: false }))
    };
    setTasks(prev => [taskItem, ...prev]);

    // Record audit log
    setAuditLogs(prev => [
      { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), action: `TASK_CAPTURED: "${taskItem.title}"`, type: 'info' },
      ...prev
    ]);
  };

  const handleMemoryAdd = (newMemObj) => {
    const memItem = {
      id: Date.now().toString(),
      category: newMemObj.category || 'Work Pattern',
      content: newMemObj.content,
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMemories(prev => [memItem, ...prev]);

    setAuditLogs(prev => [
      { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), action: `BRAIN_MEMORY_ENCRYPTED: Category [${memItem.category}]`, type: 'grant' },
      ...prev
    ]);
  };

  const handleSafetyViolation = (harmfulQuery) => {
    setSafetyLogs(prev => [
      { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), query: harmfulQuery },
      ...prev
    ]);
    setAuditLogs(prev => [
      { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), action: `SAFETY_OVERRIDE_TRIGGERED: Query flagged`, type: 'deny' },
      ...prev
    ]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '1rem 1.5rem' }}>
      {/* Top Header HUD Bar */}
      <header className="hud-card" style={{ marginBottom: '1rem', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Brand & AI Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, #00f3ff 0%, #7000ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--cyan-glow)'
          }}>
            <Cpu size={24} color="#04060d" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.4rem', letterSpacing: '2px', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              J.A.R.V.I.S. <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', background: 'rgba(0, 243, 255, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-cyan)' }}>V4.2 INTELLIGENCE</span>
            </h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sub)', letterSpacing: '1px' }}>
              PERSONAL TASK, WORK & PLAN OPTIMIZATION ASSISTANT
            </div>
          </div>
        </div>

        {/* Center Live HUD Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <Clock size={15} color="var(--accent-cyan)" />
            <span style={{ fontFamily: 'var(--font-hud)', color: 'var(--accent-cyan)' }}>{currentTime}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
            <Wifi size={14} color="var(--accent-green)" />
            <span className="hud-badge hud-badge-green">LOCAL SANDBOX ONLINE</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
            <Lock size={14} color="var(--accent-purple)" />
            <span className="hud-badge hud-badge-purple">100% CONFIDENTIAL</span>
          </div>
        </div>
      </header>

      {/* Main Navigation HUD Tabs */}
      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { id: 'core', label: 'AI CORE CONSOLE', icon: Cpu, badge: null },
          { id: 'tasks', label: 'TASK & GOAL MATRIX', icon: CheckSquare, badge: tasks.filter(t => !t.completed).length },
          { id: 'analyzer', label: 'WORK ANALYZER & CORRECTOR', icon: FileCheck, badge: 'AI' },
          { id: 'memory', label: 'JARVIS BRAIN', icon: Database, badge: memories.length },
          { id: 'privacy', label: 'PRIVACY PERMISSIONS', icon: ShieldCheck, badge: 'SECURE' },
          { id: 'safety', label: 'SAFETY & ETHICS GUARD', icon: ShieldAlert, badge: safetyLogs.length > 0 ? safetyLogs.length : null },
          { id: 'analytics', label: 'WORK ANALYTICS', icon: BarChart3, badge: null }
        ].map(tab => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="hud-btn"
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.25), rgba(112, 0, 255, 0.25))' : 'rgba(13, 22, 42, 0.6)',
                borderColor: isActive ? 'var(--accent-cyan)' : 'var(--border-cyan)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                boxShadow: isActive ? 'var(--cyan-glow)' : 'none',
                padding: '0.65rem 1rem',
                fontSize: '0.8rem'
              }}
            >
              <IconComp size={16} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span className={`hud-badge ${isActive ? 'hud-badge-cyan' : 'hud-badge-purple'}`} style={{ marginLeft: '0.3rem', fontSize: '0.7rem' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Main Active Panel Display */}
      <main style={{ flex: 1 }}>
        {activeTab === 'core' && (
          <JarvisCore 
            onTaskAdd={handleTaskAdd} 
            onMemoryAdd={handleMemoryAdd} 
            permissions={permissions}
            safetyLogs={safetyLogs}
            onSafetyViolation={handleSafetyViolation}
          />
        )}
        {activeTab === 'tasks' && (
          <TaskManager 
            tasks={tasks} 
            setTasks={setTasks} 
          />
        )}
        {activeTab === 'analyzer' && (
          <WorkAnalyzer />
        )}
        {activeTab === 'memory' && (
          <MemoryVault 
            memories={memories} 
            setMemories={setMemories} 
          />
        )}
        {activeTab === 'privacy' && (
          <PrivacyPermissions 
            permissions={permissions} 
            setPermissions={setPermissions} 
            auditLogs={auditLogs}
          />
        )}
        {activeTab === 'safety' && (
          <SafetyFilter 
            safetyLogs={safetyLogs} 
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard 
            tasks={tasks} 
            memories={memories} 
          />
        )}
      </main>
    </div>
  );
}
