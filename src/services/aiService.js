// JARVIS AI Integration & Intelligent Knowledge Engine
import { fetchOpenSourceData } from './openSearchService';

export const AI_PROVIDERS = {
  LOCAL: 'local',
  GEMINI: 'gemini',
  OPENAI: 'openai',
  GROQ: 'groq'
};

export const CONFIGURED_OPENAI_KEY = 'sk-abcdef1234567890abcdef1234567890abcdef12';

export const getStoredAISettings = () => {
  const provider = localStorage.getItem('jarvis_ai_provider') || AI_PROVIDERS.OPENAI;
  const apiKey = localStorage.getItem('jarvis_ai_api_key') || CONFIGURED_OPENAI_KEY;
  const model = localStorage.getItem('jarvis_ai_model') || (provider === AI_PROVIDERS.GEMINI ? 'gemini-1.5-flash' : provider === AI_PROVIDERS.GROQ ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');
  return { provider, apiKey, model };
};

export const saveAISettings = (provider, apiKey, model) => {
  localStorage.setItem('jarvis_ai_provider', provider);
  localStorage.setItem('jarvis_ai_api_key', apiKey);
  localStorage.setItem('jarvis_ai_model', model);
};

// Multi-Slot Key Storage Management
export const getSavedKeySlots = () => {
  try {
    const saved = localStorage.getItem('jarvis_saved_key_slots');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse saved key slots:', e);
  }
  return [
    {
      id: 'slot-default-openai',
      label: 'OpenAI (Default Slot)',
      provider: AI_PROVIDERS.OPENAI,
      apiKey: CONFIGURED_OPENAI_KEY,
      model: 'gpt-4o-mini',
      isActive: true,
      lastTested: null,
      testStatus: null
    },
    {
      id: 'slot-free-knowledge',
      label: 'Wikipedia & Web Knowledge (Free)',
      provider: AI_PROVIDERS.LOCAL,
      apiKey: '',
      model: 'local-knowledge',
      isActive: false,
      lastTested: null,
      testStatus: { success: true, message: 'Free live web knowledge always ready' }
    }
  ];
};

export const saveKeySlots = (slots) => {
  try {
    localStorage.setItem('jarvis_saved_key_slots', JSON.stringify(slots));
  } catch (e) {
    console.error('Failed to save key slots:', e);
  }
};

const DIRECT_JARVIS_SYSTEM_PROMPT = `You are ChatGPT, an advanced and highly capable AI assistant developed by OpenAI (operating as J.A.R.V.I.S.).
Provide answers in the exact same style, quality, depth, and conversational tone as ChatGPT.
1. Deliver direct, natural, and comprehensive answers in smooth, well-written prose and natural paragraphs.
2. DO NOT format responses with artificial template headings such as "Key Highlights", "Definition & Overview", or "Core Concepts & Principles".
3. Answer the user's inquiry directly and naturally. Use standard formatting (bold text, code blocks with language identifiers, or natural bullet lists) only when it genuinely improves clarity, exactly as ChatGPT does.
4. If asked for code, provide clean, runnable code with a natural, clear explanation.`;

/**
 * Check if the prompt specifically requests task creation / scheduling
 */
function detectTaskIntent(promptText) {
  const lower = promptText.toLowerCase().trim();
  const isTask = /^(?:add task|create task|remind me to|schedule a task|new task|plan a task)\b/i.test(lower);
  if (!isTask) return { isTaskAction: false };

  const taskTitle = promptText
    .replace(/^(?:add task|create task|remind me to|schedule a task|new task|plan a task)\s*/i, '')
    .trim();

  return {
    isTaskAction: true,
    taskData: {
      title: taskTitle || "New JARVIS Scheduled Task",
      priority: lower.includes('urgent') ? 'Urgent' : lower.includes('high') ? 'High' : 'Important',
      deadline: 'Today, 18:00'
    }
  };
}

/**
 * Test an API key connection live and measure latency
 */
export async function testApiKeyConnection(provider, apiKey, model) {
  if (provider === AI_PROVIDERS.LOCAL) {
    return {
      success: true,
      latency: 15,
      message: 'Local Open Knowledge Engine active. Ready for direct queries without an API key.'
    };
  }

  const cleanKey = (apiKey || '').trim();
  if (!cleanKey) {
    return {
      success: false,
      latency: 0,
      message: 'Please paste an API Key in the slot to test.'
    };
  }

  const startTime = performance.now();

  // Test OpenAI Key
  if (provider === AI_PROVIDERS.OPENAI) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Reply with: OK' }],
          max_tokens: 5
        })
      });

      const latency = Math.round(performance.now() - startTime);

      if (res.ok) {
        return {
          success: true,
          latency,
          message: `OpenAI connection verified! (${latency}ms) — Model: ${model || 'gpt-4o-mini'}`
        };
      } else {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.error?.message || res.statusText;
        if (res.status === 401) {
          return { success: false, latency, message: `Authentication Failed: Invalid API key. (${msg})` };
        } else if (res.status === 429) {
          return { success: false, latency, message: `Quota / Rate Limit Exceeded: ${msg}` };
        } else {
          return { success: false, latency, message: `OpenAI Error (${res.status}): ${msg}` };
        }
      }
    } catch (err) {
      return { success: false, latency: 0, message: `Network Request Failed: ${err.message}` };
    }
  }

  // Test Google Gemini Key
  if (provider === AI_PROVIDERS.GEMINI) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${cleanKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "ping" }] }]
        })
      });

      const latency = Math.round(performance.now() - startTime);

      if (res.ok) {
        return {
          success: true,
          latency,
          message: `Google Gemini verified! (${latency}ms) — Model: ${model || 'gemini-1.5-flash'}`
        };
      } else {
        const errJson = await res.json().catch(() => ({}));
        return {
          success: false,
          latency,
          message: `Gemini Error (${res.status}): ${errJson.error?.message || res.statusText}`
        };
      }
    } catch (err) {
      return { success: false, latency: 0, message: `Network Request Failed: ${err.message}` };
    }
  }

  // Test Groq Key
  if (provider === AI_PROVIDERS.GROQ) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanKey}`
        },
        body: JSON.stringify({
          model: model || 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5
        })
      });

      const latency = Math.round(performance.now() - startTime);

      if (res.ok) {
        return {
          success: true,
          latency,
          message: `Groq connection verified! (${latency}ms) — Model: ${model || 'llama-3.3-70b-versatile'}`
        };
      } else {
        const errJson = await res.json().catch(() => ({}));
        return {
          success: false,
          latency,
          message: `Groq Error (${res.status}): ${errJson.error?.message || res.statusText}`
        };
      }
    } catch (err) {
      return { success: false, latency: 0, message: `Network Request Failed: ${err.message}` };
    }
  }

  return { success: false, latency: 0, message: 'Unknown AI provider selected.' };
}

export async function queryOfflineJarvis(promptText) {
  const taskIntent = detectTaskIntent(promptText);
  const result = await fetchOpenSourceData(promptText);
  return {
    ...result,
    isTaskAction: taskIntent.isTaskAction,
    taskData: taskIntent.taskData
  };
}

export async function queryJARVIS(promptText, forcedOffline = false) {
  const { provider, apiKey, model } = getStoredAISettings();
  const taskIntent = detectTaskIntent(promptText);

  // If user has an active external Google Gemini API key configured
  if (!forcedOffline && provider === AI_PROVIDERS.GEMINI && apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${DIRECT_JARVIS_SYSTEM_PROMPT}\n\nUser Question/Prompt: "${promptText}"`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return {
          answer: rawText.trim(),
          sources: [],
          isLiveAI: true,
          providerName: `Google Gemini (${model || 'gemini-1.5-flash'})`,
          summary: promptText,
          isTaskAction: taskIntent.isTaskAction,
          taskData: taskIntent.taskData
        };
      }
    } catch (err) {
      console.warn("Gemini API call failed, switching to Direct Knowledge Engine:", err);
    }
  }

  // If user has an active external OpenAI ChatGPT API key configured
  if (!forcedOffline && provider === AI_PROVIDERS.OPENAI && apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: DIRECT_JARVIS_SYSTEM_PROMPT },
            { role: 'user', content: promptText }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        return {
          answer: rawContent.trim(),
          sources: [],
          isLiveAI: true,
          providerName: `OpenAI ChatGPT (${model || 'gpt-4o-mini'})`,
          summary: promptText,
          isTaskAction: taskIntent.isTaskAction,
          taskData: taskIntent.taskData
        };
      } else {
        const errJson = await response.json().catch(() => ({}));
        console.warn("OpenAI API response status:", response.status, errJson);
      }
    } catch (err) {
      console.warn("OpenAI API call failed, switching to Direct Knowledge Engine:", err);
    }
  }

  // If user has an active Groq API key configured
  if (!forcedOffline && provider === AI_PROVIDERS.GROQ && apiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: DIRECT_JARVIS_SYSTEM_PROMPT },
            { role: 'user', content: promptText }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        return {
          answer: rawContent.trim(),
          sources: [],
          isLiveAI: true,
          providerName: `Groq LLM (${model || 'llama-3.3-70b-versatile'})`,
          summary: promptText,
          isTaskAction: taskIntent.isTaskAction,
          taskData: taskIntent.taskData
        };
      }
    } catch (err) {
      console.warn("Groq API call failed, switching to Direct Knowledge Engine:", err);
    }
  }

  // Free Open Knowledge Engine (Wikipedia REST + DuckDuckGo + Math + Code)
  const openResult = await fetchOpenSourceData(promptText);
  return {
    ...openResult,
    isTaskAction: taskIntent.isTaskAction,
    taskData: taskIntent.taskData
  };
}
