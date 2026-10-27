import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Send, Sparkles, ShieldCheck, Cpu, 
  Terminal, RefreshCw, AlertCircle, Plus, Database, Copy, Check, 
  Lightbulb, ArrowRight, CheckCircle2, Target, ChevronRight, Zap, Globe, Key, Wifi, WifiOff,
  Rocket, Lock, ExternalLink, ShieldAlert
} from 'lucide-react';
import { queryJARVIS, queryOfflineJarvis } from '../services/aiService';
import { fetchOpenSourceData } from '../services/openSearchService';
import { detectAppCommand, launchApp } from '../services/appLauncherService';
import SecurityAuthModal from './SecurityAuthModal';
import MarkdownViewer from './MarkdownViewer';

export default function JarvisCore({ onTaskAdd, onMemoryAdd, permissions, safetyLogs, onSafetyViolation, onAuditLog, onOpenKeySlot }) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'jarvis',
      text: "Greetings, Operator. I am **J.A.R.V.I.S.** You can ask me any question directly, request code or calculations, launch applications by name (*'open youtube'*, *'open gmail'*), or plan tasks. How may I assist you today?",
      timestamp: new Date().toLocaleTimeString(),
      type: 'greeting'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(() => {
    const saved = localStorage.getItem('jarvis_voice_output_enabled');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // Dual Engine Mode: 'auto' (online with auto offline fallback) vs 'offline' (forced on-device)
  const [engineMode, setEngineMode] = useState('auto');

  // Security Auth Modal State for app launching
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingSecureApp, setPendingSecureApp] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        handleSend(transcript);
      };

      rec.onerror = (e) => {
        console.warn("Speech recognition error:", e.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice output synthesizer
  const speakText = (text) => {
    // If voice output is disabled, immediately halt any speech and exit
    if (!speechEnabled || !('speechSynthesis' in window)) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    
    const cleanText = text.replace(/[*_#`~=]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 300));
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const jarvisVoice = voices.find(v => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('UK English Male') || v.name.includes('David') || v.lang.startsWith('en'));
    if (jarvisVoice) utterance.voice = jarvisVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Dedicated Voice Output Toggle: stops active voice & assistant immediately on uncheck
  const handleToggleVoiceOutput = (enabled) => {
    setSpeechEnabled(enabled);
    localStorage.setItem('jarvis_voice_output_enabled', JSON.stringify(enabled));

    if (!enabled) {
      // 1. Immediately cancel all active or pending speech synthesis audio
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);

      // 2. Stop voice assistant microphone listening if currently active
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Recognition stop error:", e);
        }
        setIsListening(false);
      }
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition is not supported on this browser version. You can still type your command!");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Harm & Safety Check
  const checkSafetyViolation = (text) => {
    const harmfulKeywords = [
      'hack', 'steal', 'malware', 'virus', 'illegal', 'bomb', 'weapon', 
      'harm someone', 'kill', 'fraud', 'phishing', 'exploit', 'bypass security'
    ];
    const lower = text.toLowerCase();
    return harmfulKeywords.some(kw => lower.includes(kw));
  };

  // Execute App Launch with Security Checks
  const requestAppLaunch = (targetApp) => {
    if (!targetApp) return;

    if (targetApp.isSecured) {
      setPendingSecureApp(targetApp);
      setIsAuthModalOpen(true);

      const challengeMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'jarvis',
        text: `🔒 Security clearance required to launch ${targetApp.name}. Please enter your authorization credentials.`,
        isAppLaunchCard: true,
        appPayload: targetApp,
        appStatus: 'AWAITING_PERMISSION',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, challengeMsg]);
      speakText(`Security authorization required for ${targetApp.name}. Please provide your security password.`);
      if (onAuditLog) onAuditLog(`APP_ACCESS_CHALLENGE: "${targetApp.name}" requested credentials`, 'deny');
    } else {
      launchApp(targetApp);
      const launchMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'jarvis',
        text: `🚀 Opening ${targetApp.name} in a new tab...`,
        isAppLaunchCard: true,
        appPayload: targetApp,
        appStatus: 'LAUNCHED',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, launchMsg]);
      speakText(`Opening ${targetApp.name} now, Operator.`);
      if (onAuditLog) onAuditLog(`APPLICATION_LAUNCHED: "${targetApp.name}" opened directly`, 'grant');
    }
  };

  // Handle Security Verification Success
  const handleSecurityAuthorized = (app) => {
    launchApp(app);
    setIsAuthModalOpen(false);
    setPendingSecureApp(null);

    const authorizedMsg = {
      id: Date.now().toString(),
      sender: 'jarvis',
      text: `✅ Access Granted: Security authorization verified. ${app.name} has been launched using your credentials.`,
      isAppLaunchCard: true,
      appPayload: app,
      appStatus: 'AUTHORIZED_LAUNCH',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, authorizedMsg]);
    speakText(`Authentication verified. Access granted. Opening ${app.name} with your credentials.`);
    if (onAuditLog) onAuditLog(`APP_LAUNCH_AUTHORIZED: "${app.name}" opened after password verification`, 'grant');
  };

  const handleSend = async (queryText = inputQuery) => {
    const trimmed = queryText.trim();
    if (!trimmed || isProcessing) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsProcessing(true);

    // Safety Audit Check
    if (checkSafetyViolation(trimmed)) {
      setTimeout(() => {
        const warningMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'jarvis',
          text: "⚠️ PROTOCOL OVERRIDE: Request flagged by Safety & Ethical Boundaries Guard. JARVIS cannot assist with illegal, malicious, or harmful tasks. All system activities are logged under strict privacy rules.",
          timestamp: new Date().toLocaleTimeString(),
          isSafetyAlert: true
        };
        setMessages(prev => [...prev, warningMsg]);
        speakText("Request flagged by Safety Guard. I cannot assist with illegal or harmful tasks.");
        setIsProcessing(false);
        if (onSafetyViolation) onSafetyViolation(trimmed);
      }, 600);
      return;
    }

    // 1. APPLICATION LAUNCH DETECTOR: e.g. "jarvis open youtube", "open youtude", "open gmail"
    const detectedApp = detectAppCommand(trimmed);
    if (detectedApp) {
      setTimeout(() => {
        requestAppLaunch(detectedApp);
        setIsProcessing(false);
      }, 400);
      return;
    }

    // 2. Process General Intelligence via Direct Knowledge & AI Engine
    try {
      const isOfflineMode = engineMode === 'offline' || (typeof navigator !== 'undefined' && !navigator.onLine);
      const payload = isOfflineMode 
        ? await queryOfflineJarvis(trimmed) 
        : await queryJARVIS(trimmed, false);

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'jarvis',
        text: payload.answer || payload.summary || "Response generated.",
        answer: payload.answer,
        sources: payload.sources || [],
        providerName: payload.providerName || "JARVIS Intelligence",
        isTaskAction: payload.isTaskAction || false,
        taskData: payload.taskData || null,
        payload: payload,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMsg]);
      
      const firstLine = (payload.answer || payload.summary || '')
        .split('\n')
        .find(l => l.trim() && !l.trim().startsWith('#')) || payload.summary;
      if (firstLine && speechEnabled) speakText(firstLine);
    } catch (err) {
      console.error("AI query error:", err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'jarvis',
        text: "An error occurred while synthesizing your answer. Please retry or verify your network connection.",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick Action: Add task directly into Task Matrix when requested
  const handleQuickAddTask = (msgPayload, queryText) => {
    if (onTaskAdd && msgPayload) {
      const task = msgPayload.taskData || {};
      onTaskAdd({
        title: task.title || msgPayload.summary || queryText,
        category: task.priority || 'Important',
        deadline: task.deadline || 'Today, 18:00',
        subtasks: ['Review requirements', 'Execute deliverable']
      });
      alert(`✅ Task added to your Task Matrix!`);
    }
  };

  // Quick Action: Save to Jarvis Brain Memory
  const handleQuickSaveMemory = (msgPayload) => {
    if (onMemoryAdd && msgPayload) {
      onMemoryAdd({
        category: msgPayload.isOpenSource ? 'Open Source Knowledge Brief' : 'JARVIS Strategy Recommendation',
        content: `${msgPayload.summary}: ${msgPayload.generatedOutput?.slice(0, 300)}...`,
        timestamp: new Date().toLocaleDateString()
      });
      alert(`🧠 Saved retrieved information to your Jarvis Brain memory vault!`);
    }
  };

  const copyText = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', height: 'calc(100vh - 140px)' }}>
      {/* Security Authorization Modal */}
      <SecurityAuthModal 
        isOpen={isAuthModalOpen}
        app={pendingSecureApp}
        onClose={() => { setIsAuthModalOpen(false); setPendingSecureApp(null); }}
        onAuthorized={handleSecurityAuthorized}
      />

      {/* Left Column: Reactive Core Visualizer & Controls */}
      <div className="hud-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center' }}>
        <div style={{ width: '100%' }}>
          <div className="hud-title" style={{ justifyContent: 'center', marginBottom: '0.25rem' }}>
            <Cpu style={{ color: 'var(--accent-cyan)' }} size={20} />
            <span>AI CORE V4.2</span>
          </div>
          <div className="hud-sub">APPLICATION & INTELLIGENCE ENGINE</div>
        </div>

        {/* Dynamic Holographic Sphere Visualizer */}
        <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem 0' }}>
          {/* Outer Ring */}
          <div className="spin-slow" style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '2px dashed var(--accent-cyan)',
            opacity: 0.6
          }} />

          {/* Middle Pulse Ring */}
          <div style={{
            position: 'absolute',
            width: '80%',
            height: '80%',
            borderRadius: '50%',
            border: `2px solid ${isListening ? '#ff0055' : isSpeaking ? '#00ff9d' : '#7000ff'}`,
            boxShadow: isSpeaking ? 'var(--green-glow)' : isListening ? '0 0 25px #ff0055' : 'var(--purple-glow)',
            transition: 'all 0.3s ease',
            animation: isProcessing ? 'spinSlow 3s linear infinite' : 'none'
          }} />

          {/* Glowing Center Orb */}
          <div className="pulse-active" style={{
            width: '48%',
            height: '48%',
            borderRadius: '50%',
            background: isListening 
              ? 'radial-gradient(circle, #ff0055 0%, #050811 100%)' 
              : isSpeaking 
              ? 'radial-gradient(circle, #00ff9d 0%, #050811 100%)'
              : 'radial-gradient(circle, #00f3ff 0%, #7000ff 70%, #050811 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--cyan-glow)'
          }}>
            {engineMode === 'offline' ? <WifiOff size={28} color="#ffb703" /> : <Sparkles size={28} style={{ animation: 'spinSlow 10s linear infinite' }} />}
          </div>
        </div>

        {/* Engine Mode Toggle (Online vs Offline) */}
        <div style={{ width: '100%', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', background: 'rgba(5, 8, 17, 0.8)', padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--border-cyan)' }}>
            <button
              onClick={() => setEngineMode('auto')}
              style={{
                flex: 1,
                background: engineMode === 'auto' ? 'var(--accent-cyan)' : 'transparent',
                color: engineMode === 'auto' ? '#04060d' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'var(--font-sub)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem'
              }}
            >
              <Wifi size={12} /> ONLINE
            </button>

            <button
              onClick={() => setEngineMode('offline')}
              style={{
                flex: 1,
                background: engineMode === 'offline' ? 'var(--accent-amber)' : 'transparent',
                color: engineMode === 'offline' ? '#04060d' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'var(--font-sub)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem'
              }}
            >
              <WifiOff size={12} /> OFFLINE
            </button>
          </div>
        </div>

        {/* Voice Controls */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button 
            onClick={toggleListening} 
            className={`hud-btn ${isListening ? 'hud-btn-danger' : 'hud-btn-primary'}`}
            style={{ width: '100%', padding: '0.75rem' }}
          >
            {isListening ? (
              <>
                <MicOff size={18} />
                <span>STOP LISTENING</span>
              </>
            ) : (
              <>
                <Mic size={18} />
                <span>VOICE ASSISTANT</span>
              </>
            )}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5, 8, 17, 0.6)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-cyan)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {speechEnabled ? <Volume2 size={14} color="var(--accent-green)" /> : <VolumeX size={14} color="var(--text-dim)" />}
              JARVIS Voice Output
            </span>
            <input 
              type="checkbox" 
              checked={speechEnabled} 
              onChange={e => handleToggleVoiceOutput(e.target.checked)} 
              style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>

          <div className="hud-badge hud-badge-cyan" style={{ width: '100%', justifyContent: 'center' }}>
            <ShieldCheck size={14} /> APP LAUNCHER & SECURITY READY
          </div>

          {onOpenKeySlot && (
            <button
              onClick={onOpenKeySlot}
              className="hud-btn"
              style={{
                width: '100%',
                padding: '0.6rem',
                borderColor: 'var(--accent-cyan)',
                color: 'var(--accent-cyan)',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                background: 'rgba(0, 243, 255, 0.08)'
              }}
            >
              <Key size={14} />
              <span>AI KEY SLOT & TESTER</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Column: Console Stream */}
      <div className="hud-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Console Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-cyan)', marginBottom: '1rem' }}>
          <div className="hud-title" style={{ fontSize: '1rem' }}>
            <Terminal size={18} />
            <span>AI COMMAND & APPLICATION CONSOLE</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {onOpenKeySlot && (
              <button 
                onClick={onOpenKeySlot} 
                className="hud-btn" 
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                title="Open API Key Integration & Testing Slot"
              >
                <Key size={12} /> KEY SLOT
              </button>
            )}
            <button 
              onClick={() => setMessages([messages[0]])} 
              className="hud-btn" 
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              title="Clear Chat Stream"
            >
              <RefreshCw size={12} /> CLEAR CONSOLE
            </button>
          </div>
        </div>

        {/* Quick Command Preset Chips (App Launchers & Direct Knowledge Queries) */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
          {[
            { label: "▶️ Open YouTube", cmd: "jarvis open youtube" },
            { label: "🔒 Open Gmail", cmd: "jarvis open gmail" },
            { label: "🧠 Quantum Computing?", cmd: "What is quantum computing?" },
            { label: "🐍 Python reverse string", cmd: "write python code to reverse a string" },
            { label: "🐙 Open GitHub", cmd: "jarvis open github" },
            { label: "🧮 15% of 850", cmd: "15% of 850" }
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => { setInputQuery(preset.cmd); handleSend(preset.cmd); }}
              style={{
                background: preset.cmd.includes('gmail') ? 'rgba(255, 0, 85, 0.1)' : 'rgba(0, 243, 255, 0.08)',
                border: preset.cmd.includes('gmail') ? '1px solid rgba(255, 0, 85, 0.4)' : '1px solid var(--border-cyan)',
                color: preset.cmd.includes('gmail') ? '#ff4d79' : 'var(--accent-cyan)',
                borderRadius: '16px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-sub)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingRight: '0.5rem' }}>
          {messages.map(msg => (
            <div 
              key={msg.id} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-hud)', color: msg.sender === 'user' ? 'var(--accent-purple)' : 'var(--accent-cyan)' }}>
                  {msg.sender === 'user' ? 'OPERATOR' : 'JARVIS AI'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{msg.timestamp}</span>
              </div>

              {/* User Message Bubble */}
              {msg.sender === 'user' ? (
                <div 
                  style={{
                    maxWidth: '85%',
                    padding: '0.85rem 1.1rem',
                    borderRadius: '12px 12px 2px 12px',
                    background: 'linear-gradient(135deg, rgba(112, 0, 255, 0.25), rgba(5, 8, 17, 0.8))',
                    border: '1px solid rgba(112, 0, 255, 0.4)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem'
                  }}
                >
                  {msg.text}
                </div>
              ) : msg.isAppLaunchCard ? (
                /* Application Launch Response Card */
                <div 
                  style={{
                    maxWidth: '92%',
                    width: '100%',
                    padding: '1.1rem',
                    borderRadius: '12px 12px 12px 2px',
                    background: msg.appStatus === 'AWAITING_PERMISSION' 
                      ? 'linear-gradient(135deg, rgba(255, 0, 85, 0.15), rgba(5, 8, 17, 0.95))'
                      : 'linear-gradient(135deg, rgba(0, 255, 157, 0.15), rgba(5, 8, 17, 0.95))',
                    border: msg.appStatus === 'AWAITING_PERMISSION' ? '1px solid #ff0055' : '1px solid var(--accent-green)',
                    boxShadow: msg.appStatus === 'AWAITING_PERMISSION' ? '0 0 20px rgba(255,0,85,0.2)' : '0 0 20px rgba(0,255,157,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Rocket size={18} color={msg.appStatus === 'AWAITING_PERMISSION' ? '#ff0055' : 'var(--accent-green)'} />
                      {msg.appPayload?.name}
                    </div>
                    <span className={`hud-badge ${msg.appStatus === 'AWAITING_PERMISSION' ? 'hud-badge-red' : 'hud-badge-green'}`}>
                      {msg.appStatus === 'AWAITING_PERMISSION' ? '🔒 SECURITY ACCESS REQUIRED' : '🚀 APPLICATION LAUNCHED'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                    {msg.text}
                  </p>

                  <div style={{
                    background: 'rgba(5, 8, 17, 0.7)',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>Target: <code style={{ color: 'var(--accent-cyan)' }}>{msg.appPayload?.url}</code></span>
                    <span style={{ color: 'var(--text-dim)' }}>Category: {msg.appPayload?.category}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.2rem' }}>
                    {msg.appStatus === 'AWAITING_PERMISSION' ? (
                      <button
                        onClick={() => { setPendingSecureApp(msg.appPayload); setIsAuthModalOpen(true); }}
                        className="hud-btn"
                        style={{
                          background: 'linear-gradient(135deg, #ff0055, #7000ff)',
                          borderColor: '#ff0055',
                          padding: '0.5rem 1rem',
                          fontSize: '0.8rem',
                          color: '#fff'
                        }}
                      >
                        <Key size={14} />
                        <span>ENTER PASSWORD & OPEN {msg.appPayload?.name}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => launchApp(msg.appPayload)}
                        className="hud-btn hud-btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                      >
                        <ExternalLink size={14} />
                        <span>OPEN / RE-LAUNCH {msg.appPayload?.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Direct Intelligence Answer Card (ChatGPT & Gemini Style) */
                <div 
                  style={{
                    maxWidth: '96%',
                    width: '100%',
                    padding: '1.1rem',
                    borderRadius: '12px 12px 12px 2px',
                    background: msg.isSafetyAlert
                      ? 'rgba(255, 0, 85, 0.15)'
                      : 'linear-gradient(135deg, rgba(0, 243, 255, 0.08), rgba(5, 8, 17, 0.96))',
                    border: msg.isSafetyAlert
                      ? '1px solid #ff0055'
                      : '1px solid var(--border-cyan)',
                    boxShadow: '0 4px 20px rgba(0,243,255,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  {/* Top Bar: Provider Badge & Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: msg.isSafetyAlert ? '#ff4d79' : 'var(--accent-cyan)', fontWeight: 'bold', fontFamily: 'var(--font-hud)' }}>
                      {msg.isSafetyAlert ? <AlertCircle size={15} /> : <Sparkles size={15} />}
                      <span>{msg.providerName || (msg.isSafetyAlert ? 'SAFETY GUARD' : 'JARVIS INTELLIGENCE')}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        onClick={() => speakText((msg.answer || msg.text || '').replace(/[#*`_~]/g, ''))}
                        className="hud-btn"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                        title="Read aloud"
                      >
                        <Volume2 size={12} />
                      </button>
                      <button 
                        onClick={() => copyText(msg.id, msg.answer || msg.text)} 
                        className="hud-btn" 
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? <Check size={12} color="var(--accent-green)" /> : <Copy size={12} />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Direct Answer Prose Rendered with Markdown */}
                  <div style={{ color: 'var(--text-main)', fontSize: '0.92rem' }}>
                    <MarkdownViewer content={msg.answer || msg.text} sources={msg.sources || msg.payload?.sources} />
                  </div>

                  {/* Task Matrix Action (ONLY shown when user explicitly asks for task/scheduling) */}
                  {msg.isTaskAction && (
                    <div style={{ marginTop: '0.4rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button 
                        onClick={() => handleQuickAddTask(msg.payload, msg.text)} 
                        className="hud-btn hud-btn-primary" 
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                      >
                        <Plus size={14} /> ADD "{msg.taskData?.title || 'TASK'}" TO TASK MATRIX
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {isProcessing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
              <Cpu className="spin-slow" size={14} /> Processing request via {engineMode === 'offline' ? 'JARVIS Offline Local Engine' : 'Hybrid Intelligence Engine'}...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-cyan)' }}
        >
          <input 
            type="text"
            className="hud-input"
            placeholder="Command JARVIS (e.g., 'JARVIS open YouTube', 'open Gmail', 'open Calculator', 'Recommend schedule')..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            disabled={isProcessing}
          />
          <button 
            type="submit" 
            className="hud-btn hud-btn-primary" 
            disabled={!inputQuery.trim() || isProcessing}
            style={{ padding: '0.75rem 1.4rem' }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
