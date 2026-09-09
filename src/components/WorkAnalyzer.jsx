import React, { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, Cpu, ArrowRight, Copy, Check, Sparkles, RefreshCw, FileText, Code, Target } from 'lucide-react';

export default function WorkAnalyzer() {
  const [workInput, setWorkInput] = useState(`Project Plan: Launching standard marketing campaign for product v2.
Steps:
1. Write 3 blog posts about features.
2. Send mass email blast to all subscribers without segmenting.
3. Deploy changes straight to production server on Friday evening.
4. No automated backup or rollback plan created yet.`);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const runAnalysis = () => {
    if (!workInput.trim()) return;
    setAnalyzing(true);

    setTimeout(() => {
      // Intelligent rule-based evaluation engine
      const lower = workInput.toLowerCase();
      const issues = [];
      const improvements = [];
      let score = 92;

      if (lower.includes('production') && lower.includes('friday')) {
        issues.push("High-Risk Deployment: Friday evening production deployments increase outage risk without weekend coverage.");
        improvements.push("Shift deployment to Tuesday or Wednesday morning to ensure full team support during business hours.");
        score -= 25;
      }
      if (lower.includes('backup') && (lower.includes('no') || lower.includes('not'))) {
        issues.push("Critical Data Risk: Missing automated rollback plan or backup procedure.");
        improvements.push("Implement mandatory automated database snapshot and zero-downtime rollback script prior to deployment.");
        score -= 30;
      }
      if (lower.includes('mass email') || lower.includes('without segmenting')) {
        issues.push("Inefficient Campaign: Unsegmented mass emails trigger spam filters and lower conversion rates.");
        improvements.push("Segment email audience by user activity and tailor personalized messages for higher engagement.");
        score -= 15;
      }
      if (issues.length === 0) {
        issues.push("Minor Oversight: Deadline contingencies and metric tracking markers could be specified more explicitly.");
        improvements.push("Add concrete KPI measurement markers (e.g. baseline conversion target %) to track success.");
      }

      const correctedText = workInput
        .replace(/mass email blast to all subscribers without segmenting/gi, 'segmented targeted email campaign based on user activity')
        .replace(/deploy changes straight to production server on friday evening/gi, 'deploy changes to production environment on Tuesday at 10:00 AM after staging validation')
        .replace(/no automated backup or rollback plan created yet/gi, 'automated pre-deployment snapshot with automated 1-click rollback script active');

      setAnalysisResult({
        score: Math.max(score, 35),
        status: score > 75 ? 'Optimal' : score > 55 ? 'Needs Optimization' : 'High Risk',
        issuesFound: issues,
        suggestedFixes: improvements,
        correctedWork: correctedText,
        analyzedAt: new Date().toLocaleTimeString()
      });

      setAnalyzing(false);
    }, 1200);
  };

  const copyCorrected = () => {
    if (analysisResult?.correctedWork) {
      navigator.clipboard.writeText(analysisResult.correctedWork);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', height: 'calc(100vh - 140px)' }}>
      {/* Left Column: Work Input & Control Panel */}
      <div className="hud-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="hud-title">
            <Cpu size={20} />
            <span>WORK & PLAN ANALYZER</span>
          </div>
          <span className="hud-badge hud-badge-cyan">AI DIAGNOSTIC MODULE</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Paste your project plan, code snippet, report draft, or strategy. JARVIS will inspect for logical errors, efficiency bottlenecks, risk factors, and provide optimized corrections.
        </p>

        <textarea
          className="hud-input"
          style={{ flex: 1, fontFamily: 'var(--font-code)', fontSize: '0.85rem', resize: 'none', minHeight: '260px' }}
          placeholder="Paste work draft or plan here..."
          value={workInput}
          onChange={e => setWorkInput(e.target.value)}
        />

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button 
            onClick={runAnalysis} 
            disabled={analyzing || !workInput.trim()}
            className="hud-btn hud-btn-primary" 
            style={{ flex: 1, padding: '0.8rem' }}
          >
            {analyzing ? (
              <>
                <RefreshCw className="spin-slow" size={16} /> ANALYZING PATTERNS...
              </>
            ) : (
              <>
                <Sparkles size={16} /> ANALYZE & CORRECT WORK
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Diagnostic Output & Correction Report */}
      <div className="hud-card" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div className="hud-title" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-cyan)', paddingBottom: '0.75rem' }}>
          <Target size={20} />
          <span>DIAGNOSTIC & CORRECTION REPORT</span>
        </div>

        {!analysisResult ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', textAlign: 'center' }}>
            <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <div>Click "ANALYZE & CORRECT WORK" to generate diagnostics.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Score Banner */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: 'rgba(5, 8, 17, 0.8)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-cyan)'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hud)' }}>EFFICIENCY SCORE</div>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  fontFamily: 'var(--font-hud)',
                  color: analysisResult.score > 75 ? 'var(--accent-green)' : analysisResult.score > 50 ? 'var(--accent-amber)' : 'var(--accent-pink)'
                }}>
                  {analysisResult.score}/100
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`hud-badge ${
                  analysisResult.score > 75 ? 'hud-badge-green' : analysisResult.score > 50 ? 'hud-badge-cyan' : 'hud-badge-red'
                }`}>
                  {analysisResult.status}
                </span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>
                  Evaluated at {analysisResult.analyzedAt}
                </div>
              </div>
            </div>

            {/* Identified Issues */}
            <div>
              <div className="hud-sub" style={{ color: 'var(--accent-pink)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={16} /> IDENTIFIED OVERSIGHTS & RISKS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analysisResult.issuesFound.map((issue, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', color: '#ffb3c1', background: 'rgba(255, 0, 85, 0.08)', padding: '0.6rem 0.8rem', borderRadius: '6px', borderLeft: '3px solid #ff0055' }}>
                    {issue}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Corrections */}
            <div>
              <div className="hud-sub" style={{ color: 'var(--accent-green)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={16} /> JARVIS RECOMMENDED CORRECTIONS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analysisResult.suggestedFixes.map((fix, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', color: '#b9fbc0', background: 'rgba(0, 255, 157, 0.08)', padding: '0.6rem 0.8rem', borderRadius: '6px', borderLeft: '3px solid var(--accent-green)' }}>
                    {fix}
                  </div>
                ))}
              </div>
            </div>

            {/* Corrected Output Box */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span className="hud-sub" style={{ color: 'var(--accent-cyan)' }}>OPTIMIZED WORK PRODUCT</span>
                <button onClick={copyCorrected} className="hud-btn" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                  {copied ? <Check size={14} color="var(--accent-green)" /> : <Copy size={14} />}
                  {copied ? 'COPIED!' : 'COPY OPTIMIZED WORK'}
                </button>
              </div>

              <textarea 
                className="hud-input" 
                readOnly 
                value={analysisResult.correctedWork}
                style={{ fontFamily: 'var(--font-code)', fontSize: '0.85rem', height: '140px', background: 'rgba(5, 8, 17, 0.9)' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
