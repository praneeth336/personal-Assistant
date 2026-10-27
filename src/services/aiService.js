// JARVIS AI Integration & Intelligent Knowledge Engine
import { fetchOpenSourceData } from './openSearchService';

export const AI_PROVIDERS = {
  LOCAL: 'local',
  GEMINI: 'gemini',
  OPENAI: 'openai'
};

export const CONFIGURED_OPENAI_KEY = 'sk-abcdef1234567890abcdef1234567890abcdef12';

export const getStoredAISettings = () => {
  const provider = localStorage.getItem('jarvis_ai_provider') || AI_PROVIDERS.OPENAI;
  const apiKey = localStorage.getItem('jarvis_ai_api_key') || CONFIGURED_OPENAI_KEY;
  const model = localStorage.getItem('jarvis_ai_model') || (provider === AI_PROVIDERS.GEMINI ? 'gemini-1.5-flash' : 'gpt-4o-mini');
  return { provider, apiKey, model };
};

export const saveAISettings = (provider, apiKey, model) => {
  localStorage.setItem('jarvis_ai_provider', provider);
  localStorage.setItem('jarvis_ai_api_key', apiKey);
  localStorage.setItem('jarvis_ai_model', model);
};

const DIRECT_JARVIS_SYSTEM_PROMPT = `You are J.A.R.V.I.S., an advanced, highly intelligent personal AI assistant.
Answer the user's prompt directly, comprehensively, and naturally—just like ChatGPT or Gemini.
1. Provide the direct answer immediately without generic filler, conversational preambles, or artificial boilerplate.
2. Format beautifully in standard Markdown (use headings, bullet points, bold text, and fenced code blocks with language identifiers where appropriate).
3. If the user asks for code, provide clean, runnable code with concise explanations.
4. If the prompt explicitly asks to create or schedule a task, format the task clearly.`;

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
          providerName: `Google Gemini (${model})`,
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

  // Free Open Knowledge Engine (Wikipedia REST + DuckDuckGo + Math + Code)
  const openResult = await fetchOpenSourceData(promptText);
  return {
    ...openResult,
    isTaskAction: taskIntent.isTaskAction,
    taskData: taskIntent.taskData
  };
}
