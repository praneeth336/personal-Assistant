// JARVIS Google Gemini AI Integration Service
// Uses Google Gemini API with key: AIzaSyD634jnLCQKS1cdwprn-taseUdjJWMDVk4

const GEMINI_API_KEY = 'AIzaSyD634jnLCQKS1cdwprn-taseUdjJWMDVk4';
const DEFAULT_MODEL = 'gemini-2.5-flash';

const JARVIS_SYSTEM_PROMPT = `You are J.A.R.V.I.S., a personal task management assistant and intelligent workflow advisor.
When a user asks a question, requests specified information, or seeks task guidance:
1. Provide a COMPLETE, DETAILED, CLEAR, and UNABRIDGED response. Do not truncate information.
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

IMPORTANT: Respond ONLY with the valid JSON object above, without extra markdown code block wrappers if possible.`;

export async function queryJARVIS(promptText, userContext = {}) {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
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
      
      // Clean JSON formatting
      const cleanJsonStr = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      try {
        const parsed = JSON.parse(cleanJsonStr);
        return {
          summary: parsed.summary || `JARVIS Response for "${promptText}"`,
          recommendations: parsed.recommendations || ["Review information for key insights."],
          steps: parsed.steps || ["Execute core steps."],
          generatedOutput: parsed.generatedOutput || rawText,
          suggestedPriority: parsed.suggestedPriority || 'Important',
          suggestedDeadline: parsed.suggestedDeadline || 'Today, 18:00',
          isLiveAI: true,
          providerName: `Google Gemini (${DEFAULT_MODEL})`
        };
      } catch (parseErr) {
        // If JSON parsing failed, format rawText cleanly
        return {
          summary: `Google Gemini Analysis for "${promptText}"`,
          recommendations: [
            "Review full AI generated information below.",
            "Apply key principles to your task matrix."
          ],
          steps: [
            "Analyze generated information.",
            "Execute corresponding action items."
          ],
          generatedOutput: rawText,
          suggestedPriority: 'Important',
          suggestedDeadline: 'Today, 18:00',
          isLiveAI: true,
          providerName: `Google Gemini (${DEFAULT_MODEL})`
        };
      }
    }
  } catch (err) {
    console.warn("Gemini API request failed, switching to backup knowledge engine:", err);
  }

  // Backup fallback if network is offline
  return {
    summary: `JARVIS Local Analysis for "${promptText}"`,
    recommendations: [
      "Prioritize key sub-deliverables under your Eisenhower Task Matrix.",
      "Review baseline specifications before committing changes."
    ],
    steps: [
      `Define target scope for "${promptText}".`,
      "Execute implementation steps."
    ],
    generatedOutput: `JARVIS KNOWLEDGE BRIEF:\nQuery: "${promptText}"\nStatus: Processing ready.`,
    suggestedPriority: 'Important',
    suggestedDeadline: 'Today, 18:00',
    isLiveAI: false,
    providerName: 'JARVIS Backup Local Engine'
  };
}
