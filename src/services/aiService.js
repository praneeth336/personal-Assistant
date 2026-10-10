// JARVIS AI Integration & Intelligent Knowledge Engine
import { fetchOpenSourceData } from './openSearchService';

export const AI_PROVIDERS = {
  LOCAL: 'local',
  GEMINI: 'gemini',
  OPENAI: 'openai'
};

export const getStoredAISettings = () => {
  const provider = localStorage.getItem('jarvis_ai_provider') || AI_PROVIDERS.LOCAL;
  const apiKey = localStorage.getItem('jarvis_ai_api_key') || '';
  const model = localStorage.getItem('jarvis_ai_model') || (provider === AI_PROVIDERS.GEMINI ? 'gemini-1.5-flash' : 'gpt-4o-mini');
  return { provider, apiKey, model };
};

export const saveAISettings = (provider, apiKey, model) => {
  localStorage.setItem('jarvis_ai_provider', provider);
  localStorage.setItem('jarvis_ai_api_key', apiKey);
  localStorage.setItem('jarvis_ai_model', model);
};

const JARVIS_SYSTEM_PROMPT = `You are J.A.R.V.I.S., a personal task management assistant and intelligent workflow advisor.
When a user asks a question, requests specified information, or seeks task guidance:
1. Provide a COMPLETE, EXACT, DETAILED, CLEAR, and UNABRIDGED response. Do not truncate information.
2. Structure your output in a clear JSON object with the following fields:

{
  "summary": "Clear, concise 1-sentence title or overview",
  "recommendations": [
    "Key strategic tip 1",
    "Key strategic tip 2",
    "Key strategic tip 3"
  ],
  "steps": [
    "Step 1 action item",
    "Step 2 action item",
    "Step 3 action item"
  ],
  "generatedOutput": "Complete unabridged full detailed answer text with sections, explanations, or code/draft outline",
  "suggestedPriority": "Urgent" | "High" | "Important" | "Routine",
  "suggestedDeadline": "Today, 18:00" | "Tomorrow, 12:00" | "In 3 Days"
}

IMPORTANT: Respond ONLY with valid JSON.`;

export async function queryOfflineJarvis(promptText) {
  return await fetchOpenSourceData(promptText);
}

export async function queryJARVIS(promptText, forcedOffline = false) {
  const { provider, apiKey, model } = getStoredAISettings();

  // If user has an active external API key configured
  if (!forcedOffline && provider === AI_PROVIDERS.GEMINI && apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${JARVIS_SYSTEM_PROMPT}\n\nUser Query: "${promptText}"`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanJsonStr = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

        try {
          const parsed = JSON.parse(cleanJsonStr);
          return {
            summary: parsed.summary || `Exact Answer for "${promptText}"`,
            recommendations: parsed.recommendations || ["Review key principles."],
            steps: parsed.steps || ["Execute core steps."],
            generatedOutput: parsed.generatedOutput || rawText,
            suggestedPriority: parsed.suggestedPriority || 'Important',
            suggestedDeadline: parsed.suggestedDeadline || 'Today, 18:00',
            isLiveAI: true,
            providerName: `Google Gemini (${model})`
          };
        } catch (e) {
          return {
            summary: `Exact Answer for "${promptText}"`,
            recommendations: ["Review detailed response below."],
            steps: ["Execute action items."],
            generatedOutput: rawText,
            suggestedPriority: 'Important',
            suggestedDeadline: 'Today, 18:00',
            isLiveAI: true,
            providerName: `Google Gemini (${model})`
          };
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, switching to Open Search Engine:", err);
    }
  }

  // OpenAI ChatGPT API Handler
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
            { role: 'system', content: JARVIS_SYSTEM_PROMPT },
            { role: 'user', content: `Query: "${promptText}"` }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(rawContent);
        return {
          summary: parsed.summary || `Exact Answer for "${promptText}"`,
          recommendations: parsed.recommendations || ["Review key principles."],
          steps: parsed.steps || ["Execute core steps."],
          generatedOutput: parsed.generatedOutput || rawContent,
          suggestedPriority: parsed.suggestedPriority || 'Important',
          suggestedDeadline: parsed.suggestedDeadline || 'Today, 18:00',
          isLiveAI: true,
          providerName: `OpenAI ChatGPT (${model})`
        };
      }
    } catch (err) {
      console.warn("OpenAI API call failed, switching to Open Search Engine:", err);
    }
  }

  // Open Data Search & Detailed Synthesis (Wikipedia + DuckDuckGo + Knowledge Engine)
  return await fetchOpenSourceData(promptText);
}
