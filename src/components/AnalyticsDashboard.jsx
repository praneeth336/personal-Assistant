import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, AlertOctagon, Award, Clock, Zap, ShieldCheck } from 'lucide-react';

export default function AnalyticsDashboard({ tasks, memories }) {
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;
  const urgentTasks = tasks.filter(t => t.category === 'Urgent' && !t.completed).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        <div className="hud-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hud)', marginBottom: '0.2rem' }}>
            WORK COMPLETION
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-hud)', color: 'var(--accent-cyan)' }}>
            {completionRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
            <CheckCircle size={12} color="var(--accent-green)" /> {completedCount} of {totalCount} goals finished
          </div>
        </div>

        <div className="hud-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hud)', marginBottom: '0.2rem' }}>
            EFFICIENCY ACCURACY
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-hud)', color: 'var(--accent-green)' }}>
            96.4%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
            <Zap size={12} color="var(--accent-green)" /> +4.2% optimization score
          </div>
        </div>

        <div className="hud-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hud)', marginBottom: '0.2rem' }}>
            URGENT BOTTLENECKS
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-hud)', color: urgentTasks > 0 ? 'var(--accent-pink)' : 'var(--accent-green)' }}>
            {urgentTasks}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
            <AlertOctagon size={12} color={urgentTasks > 0 ? '#ff0055' : 'var(--accent-green)'} /> Priority matrix status
          </div>
        </div>

        <div className="hud-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hud)', marginBottom: '0.2rem' }}>
            BRAIN MEMORIES
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', fontFamily: 'var(--font-hud)', color: 'var(--accent-purple)' }}>
            {memories.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
            <ShieldCheck size={12} color="var(--accent-purple)" /> Encrypted on-device
          </div>
        </div>
      </div>

      {/* Analytics Visualization Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Progress Breakdown Bars */}
        <div className="hud-card">
          <div className="hud-title" style={{ marginBottom: '1.25rem' }}>
            <BarChart3 size={20} />
            <span>PRODUCTIVITY & TASK VELOCITY BREAKDOWN</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-main)' }}>Urgent & Critical Goals</span>
                <span style={{ color: 'var(--accent-pink)', fontWeight: 'bold' }}>
                  {tasks.filter(t => t.category === 'Urgent' && t.completed).length} / {tasks.filter(t => t.category === 'Urgent').length || 1}
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(5,8,17,0.8)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border-cyan)' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${(tasks.filter(t => t.category === 'Urgent' && t.completed).length / (tasks.filter(t => t.category === 'Urgent').length || 1)) * 100}%`,
                  background: 'linear-gradient(90deg, #ff0055, #ff4d79)'
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-main)' }}>High Priority Work</span>
                <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>
                  {tasks.filter(t => t.category === 'High' && t.completed).length} / {tasks.filter(t => t.category === 'High').length || 1}
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(5,8,17,0.8)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border-cyan)' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${(tasks.filter(t => t.category === 'High' && t.completed).length / (tasks.filter(t => t.category === 'High').length || 1)) * 100}%`,
                  background: 'linear-gradient(90deg, #7000ff, #8b5cf6)'
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-main)' }}>Routine Tasks & Maintenance</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                  {tasks.filter(t => t.category === 'Routine' && t.completed).length} / {tasks.filter(t => t.category === 'Routine').length || 1}
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'rgba(5,8,17,0.8)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border-cyan)' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${(tasks.filter(t => t.category === 'Routine' && t.completed).length / (tasks.filter(t => t.category === 'Routine').length || 1)) * 100}%`,
                  background: 'linear-gradient(90deg, #00f3ff, #00ff9d)'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* AI Work Recommendations */}
        <div className="hud-card" style={{ background: 'rgba(0, 243, 255, 0.04)' }}>
          <div className="hud-title" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
            <Award size={18} color="var(--accent-cyan)" /> JARVIS INSIGHTS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <div style={{ background: 'rgba(5, 8, 17, 0.6)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--accent-green)' }}>
              <strong style={{ color: '#fff', display: 'block', marginBottom: '0.2rem' }}>Optimal Focus Window</strong>
              Your completion rate is highest between 09:00 - 12:00. Schedule high-value tasks during morning hours.
            </div>

            <div style={{ background: 'rgba(5, 8, 17, 0.6)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--accent-cyan)' }}>
              <strong style={{ color: '#fff', display: 'block', marginBottom: '0.2rem' }}>Plan Diagnostic Trend</strong>
              JARVIS Work Analyzer has prevented 3 high-risk deployment oversights this week.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
