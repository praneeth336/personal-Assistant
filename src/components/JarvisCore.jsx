import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Send, Sparkles, ShieldCheck, Cpu, 
  Terminal, RefreshCw, AlertCircle, Plus, Database, Copy, Check, 
  Lightbulb, ArrowRight, CheckCircle2, Target, ChevronRight, Zap, Globe, Key, Wifi, WifiOff
} from 'lucide-react';
import { queryJARVIS, queryOfflineJarvis } from '../services/aiService';
import { fetchOpenSourceData } from '../services/openSearchService';

export default function JarvisCore({ onTaskAdd, onMemoryAdd, permissions, safetyLogs, onSafetyViolation }) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'jarvis',
      text: "Greetings. I am JARVIS. I support both Online (Google Gemini AI) and 100% On-Device Offline mode so you can organize your tasks and work seamlessly anywhere.",
      timestamp: new Date().toLocaleTimeString(),
      type: 'greeting'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  
  // Dual Engine Mode: 'auto' (online with auto offline fallback) vs 'offline' (forced on-device)
  const [engineMode, setEngineMode] = useState('auto');

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
    if (!speechEnabled || !('speechSynthesis' in window)) return;
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

    // Process Response via Engine (Online API or On-Device Offline Engine)
    try {
      let payload;
      const isOfflineMode = engineMode === 'offline' || (typeof navigator !== 'undefined' && !navigator.onLine);

      if (isOfflineMode) {
        payload = queryOfflineJarvis(trimmed);
      } else {
        const lower = trimmed.toLowerCase();
        if (lower.startsWith('add task') || lower.startsWith('remind me') || lower.startsWith('remember that')) {
          payload = await queryJARVIS(trimmed, false);
        } else {
          payload = await fetchOpenSourceData(trimmed);
        }
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'jarvis',
        text: payload.summary,
        payload: payload,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMsg]);
      speakText(`${payload.summary}. Output compiled successfully.`);
    } catch (err) {
      console.error("AI query error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick Action: Add generated steps directly into Task Matrix
  const handleQuickAddTask = (msgPayload, queryText) => {
    if (onTaskAdd && msgPayload) {
      onTaskAdd({
        title: msgPayload.summary || queryText,
        category: msgPayload.suggestedPriority || 'Urgent',
        deadline: msgPayload.suggestedDeadline || 'Today, 18:00',
        subtasks: msgPayload.steps || ['Execute step 1', 'Execute step 2']
      });
      alert(`✅ Task & generated sub-steps added to your Task Matrix!`);
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
      {/* Left Column: Reactive Core Visualizer & Controls */}
      <div className="hud-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center' }}>
        <div style={{ width: '100%' }}>
          <div className="hud-title" style={{ justifyContent: 'center', marginBottom: '0.25rem' }}>
            <Cpu style={{ color: 'var(--accent-cyan)' }} size={20} />
            <span>AI CORE V4.2</span>
          </div>
          <div className="hud-sub">HYBRID ONLINE / OFFLINE ENGINE</div>
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
              onChange={e => setSpeechEnabled(e.target.checked)} 
              style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>

          <div className={`hud-badge ${engineMode === 'offline' ? 'hud-badge-purple' : 'hud-badge-cyan'}`} style={{ width: '100%', justifyContent: 'center' }}>
            <ShieldCheck size={14} /> {engineMode === 'offline' ? '100% ON-DEVICE OFFLINE MODE' : 'HYBRID AI ENGINE ACTIVE'}
          </div>
        </div>
      </div>

      {/* Right Column: Console Stream */}
      <div className="hud-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Console Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-cyan)', marginBottom: '1rem' }}>
          <div className="hud-title" style={{ fontSize: '1rem' }}>
            <Terminal size={18} />
            <span>AI COMMAND & KNOWLEDGE CONSOLE</span>
          </div>
          <button 
            onClick={() => setMessages([messages[0]])} 
            className="hud-btn" 
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
            title="Clear Chat Stream"
          >
            <RefreshCw size={12} /> CLEAR CONSOLE
          </button>
        </div>

        {/* Quick Recommendation Preset Chips */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
          {[
            "⚡ Recommend schedule optimizations",
            "🚀 Break down project execution steps",
            "📊 Recommend workload priorities",
            "✍️ Generate email action plan"
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => { setInputQuery(preset); handleSend(preset); }}
              style={{
                background: 'rgba(0, 243, 255, 0.08)',
                border: '1px solid var(--border-cyan)',
                color: 'var(--accent-cyan)',
                borderRadius: '16px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-sub)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {preset}
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
              ) : (
                /* JARVIS Response Card with Complete Output */
                <div 
                  style={{
                    maxWidth: '96%',
                    width: '100%',
                    padding: '1.1rem',
                    borderRadius: '12px 12px 12px 2px',
                    background: msg.isSafetyAlert
                      ? 'rgba(255, 0, 85, 0.15)'
                      : 'linear-gradient(135deg, rgba(0, 243, 255, 0.1), rgba(5, 8, 17, 0.95))',
                    border: msg.isSafetyAlert
                      ? '1px solid #ff0055'
                      : '1px solid var(--border-cyan)',
                    boxShadow: '0 4px 20px rgba(0,243,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}
                >
                  {/* Headline Summary & Provider Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: '600', color: msg.isSafetyAlert ? '#ff4d79' : '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {msg.isSafetyAlert ? <AlertCircle size={18} /> : <Sparkles size={18} color="var(--accent-cyan)" />}
                      {msg.text}
                    </div>
                    {msg.payload?.providerName && (
                      <span className={`hud-badge ${msg.payload.isLiveAI ? 'hud-badge-green' : 'hud-badge-purple'}`} style={{ fontSize: '0.75rem' }}>
                        {msg.payload.isLiveAI ? <Wifi size={10} /> : <WifiOff size={10} />}
                        {msg.payload.providerName}
                      </span>
                    )}
                  </div>

                  {/* Rich Payload Section */}
                  {msg.payload && (
                    <>
                      {/* JARVIS Recommendations Box */}
                      {msg.payload.recommendations && msg.payload.recommendations.length > 0 && (
                        <div style={{ background: 'rgba(5, 8, 17, 0.7)', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-cyan)' }}>
                          <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-hud)', color: 'var(--accent-cyan)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Lightbulb size={14} /> KEY TAKEAWAYS & RECOMMENDATIONS
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {msg.payload.recommendations.map((rec, i) => (
                              <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                                <ChevronRight size={14} color="var(--accent-cyan)" style={{ marginTop: '3px', flexShrink: 0 }} />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step-by-Step Action Breakdown */}
                      {msg.payload.steps && msg.payload.steps.length > 0 && (
                        <div style={{ background: 'rgba(5, 8, 17, 0.7)', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-green)' }}>
                          <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-hud)', color: 'var(--accent-green)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Target size={14} /> ACTIONABLE STEP-BY-STEP WORKFLOW
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {msg.payload.steps.map((step, i) => (
                              <div key={i} style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '0.75rem' }}>Step {i+1}:</span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Complete Output Box */}
                      {msg.payload.generatedOutput && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-hud)', color: 'var(--accent-purple)' }}>
                              COMPLETE WORK OUTPUT BRIEF
                            </span>
                            <button 
                              onClick={() => copyText(msg.id, msg.payload.generatedOutput)} 
                              className="hud-btn" 
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              {copiedId === msg.id ? <Check size={12} color="var(--accent-green)" /> : <Copy size={12} />}
                              {copiedId === msg.id ? 'COPIED FULL TEXT' : 'COPY FULL TEXT'}
                            </button>
                          </div>
                          <pre style={{ 
                            background: 'rgba(5, 8, 17, 0.95)', 
                            border: '1px solid var(--border-cyan)', 
                            borderRadius: '8px', 
                            padding: '0.9rem', 
                            fontFamily: 'var(--font-code)', 
                            fontSize: '0.85rem',
                            lineHeight: '1.6',
                            color: '#00f3ff',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '340px',
                            overflowY: 'auto'
                          }}>
                            {msg.payload.generatedOutput}
                          </pre>
                        </div>
                      )}

                      {/* One-Click Quick Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.6rem', pt: '0.4rem', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => handleQuickAddTask(msg.payload, msg.text)} 
                          className="hud-btn hud-btn-primary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                        >
                          <Plus size={14} /> ADD STEPS TO TASK MATRIX
                        </button>

                        <button 
                          onClick={() => handleQuickSaveMemory(msg.payload)} 
                          className="hud-btn" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                        >
                          <Database size={14} color="var(--accent-purple)" /> SAVE FULL BRIEF TO BRAIN
                        </button>
                      </div>
                    </>
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
            placeholder={engineMode === 'offline' ? "Type command for Offline Local Engine..." : "Ask JARVIS for recommendations, task breakdowns, output drafts..."}
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
