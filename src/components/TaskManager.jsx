import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, Clock, AlertTriangle, ListChecks, Sparkles, Filter, ChevronRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TaskManager({ tasks, setTasks }) {
  const [filterCategory, setFilterCategory] = useState('All');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('Urgent');
  const [newDeadline, setNewDeadline] = useState('Today, 17:00');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [tempSubtasks, setTempSubtasks] = useState(['Define scope', 'Execute step 1']);

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    setTempSubtasks(prev => [...prev, subtaskInput.trim()]);
    setSubtaskInput('');
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newPriority,
      deadline: newDeadline,
      completed: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subtasks: tempSubtasks.map(st => ({ id: Math.random().toString(), text: st, done: false }))
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTitle('');
    setTempSubtasks(['Review requirements', 'Execute core plan']);
  };

  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          // Trigger celebration confetti
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 }
            });
          } catch (e) { console.log(e); }
        }
        return { 
          ...t, 
          completed: nextState,
          subtasks: t.subtasks?.map(st => ({ ...st, done: nextState }))
        };
      }
      return t;
    }));
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubs = t.subtasks.map(st => st.id === subtaskId ? { ...st, done: !st.done } : st);
        const allDone = updatedSubs.every(st => st.done);
        return { ...t, subtasks: updatedSubs, completed: allDone };
      }
      return t;
    }));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const filteredTasks = tasks.filter(t => {
    if (filterCategory === 'All') return true;
    if (filterCategory === 'Completed') return t.completed;
    if (filterCategory === 'Active') return !t.completed;
    return t.category === filterCategory;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem' }}>
      {/* Left Column: Add Task Form & Priority Matrix */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="hud-card">
          <div className="hud-title" style={{ marginBottom: '1rem' }}>
            <Plus size={18} />
            <span>CREATE NEW TASK</span>
          </div>

          <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Task Title / Objective
              </label>
              <input 
                type="text" 
                className="hud-input"
                placeholder="e.g., Finalize project architecture report"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Priority Level
                </label>
                <select 
                  className="hud-input" 
                  value={newPriority} 
                  onChange={e => setNewPriority(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Urgent">Urgent & Important</option>
                  <option value="High">High Priority</option>
                  <option value="Routine">Routine Work</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Deadline Target
                </label>
                <input 
                  type="text" 
                  className="hud-input"
                  placeholder="e.g. Today 18:00"
                  value={newDeadline}
                  onChange={e => setNewDeadline(e.target.value)}
                />
              </div>
            </div>

            {/* Sub-steps Breakdown */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                Step-by-Step Breakdown (JARVIS Auto-Assist)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input 
                  type="text" 
                  className="hud-input"
                  placeholder="Add sub-step action..."
                  value={subtaskInput}
                  onChange={e => setSubtaskInput(e.target.value)}
                />
                <button type="button" onClick={addSubtask} className="hud-btn" style={{ padding: '0.5rem 0.8rem' }}>
                  +
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: '100px', overflowY: 'auto' }}>
                {tempSubtasks.map((st, idx) => (
                  <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(5,8,17,0.5)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    <ChevronRight size={12} color="var(--accent-cyan)" /> {st}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="hud-btn hud-btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              <Sparkles size={16} /> ADD TASK TO MATRIX
            </button>
          </form>
        </div>

        {/* Priority Matrix Overview Box */}
        <div className="hud-card" style={{ background: 'rgba(112, 0, 255, 0.05)', borderColor: 'rgba(112, 0, 255, 0.3)' }}>
          <div className="hud-title" style={{ color: 'var(--accent-purple)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
            <ListChecks size={16} /> MATRIX STATS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div>Active Tasks: <strong style={{ color: 'var(--accent-cyan)' }}>{tasks.filter(t => !t.completed).length}</strong></div>
            <div>Completed: <strong style={{ color: 'var(--accent-green)' }}>{tasks.filter(t => t.completed).length}</strong></div>
            <div>Urgent Priority: <strong style={{ color: 'var(--accent-pink)' }}>{tasks.filter(t => t.category === 'Urgent' && !t.completed).length}</strong></div>
            <div>Efficiency: <strong style={{ color: 'var(--accent-cyan)' }}>94%</strong></div>
          </div>
        </div>
      </div>

      {/* Right Column: Task List & Filtering */}
      <div className="hud-card" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header & Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="hud-title">
            <CheckSquare size={20} />
            <span>TASK & GOAL MATRIX</span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(5, 8, 17, 0.7)', padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--border-cyan)' }}>
            {['All', 'Active', 'Urgent', 'High', 'Completed'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                style={{
                  background: filterCategory === cat ? 'var(--accent-cyan)' : 'transparent',
                  color: filterCategory === cat ? '#04060d' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '0.3rem 0.7rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sub)',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Task Cards Stream */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem', overflowY: 'auto' }}>
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
              <ListChecks size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <div>No tasks found under category "{filterCategory}".</div>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div 
                key={task.id}
                style={{
                  background: task.completed ? 'rgba(5, 8, 17, 0.4)' : 'rgba(13, 22, 42, 0.8)',
                  border: task.completed ? '1px solid rgba(100, 116, 139, 0.3)' : '1px solid var(--border-cyan)',
                  borderRadius: '10px',
                  padding: '1rem',
                  transition: 'all 0.2s ease',
                  opacity: task.completed ? 0.7 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <button 
                      onClick={() => toggleTask(task.id)}
                      style={{ background: 'none', border: 'none', color: task.completed ? 'var(--accent-green)' : 'var(--accent-cyan)', cursor: 'pointer', marginTop: '2px' }}
                    >
                      {task.completed ? <CheckCircle2 size={22} /> : <Square size={22} />}
                    </button>
                    <div>
                      <h4 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'var(--text-muted)' : '#fff',
                        marginBottom: '0.3rem'
                      }}>
                        {task.title}
                      </h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <span className={`hud-badge ${
                          task.category === 'Urgent' ? 'hud-badge-red' : 
                          task.category === 'High' ? 'hud-badge-purple' : 'hud-badge-cyan'
                        }`}>
                          {task.category}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} /> {task.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteTask(task.id)} 
                    className="hud-btn hud-btn-danger" 
                    style={{ padding: '0.3rem 0.5rem' }}
                    title="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Sub-steps Checklist */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.6rem', borderTop: '1px dashed rgba(0, 243, 255, 0.15)', paddingLeft: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.4rem', fontFamily: 'var(--font-hud)' }}>
                      SUB-STEP STEPS ({task.subtasks.filter(s => s.done).length}/{task.subtasks.length}):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.4rem' }}>
                      {task.subtasks.map(st => (
                        <div 
                          key={st.id} 
                          onClick={() => toggleSubtask(task.id, st.id)}
                          style={{
                            fontSize: '0.8rem',
                            color: st.done ? 'var(--text-dim)' : 'var(--text-main)',
                            textDecoration: st.done ? 'line-through' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          <span style={{ color: st.done ? 'var(--accent-green)' : 'var(--accent-cyan)' }}>
                            {st.done ? '✓' : '•'}
                          </span>
                          {st.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
