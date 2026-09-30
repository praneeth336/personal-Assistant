// JARVIS Hybrid AI Service (Supports Online Google Gemini AI & 100% On-Device Offline Engine)

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

IMPORTANT: Respond ONLY with valid JSON.`;

// 1. Local Offline Intelligence Generator (Zero Internet / API required)
export function queryOfflineJarvis(promptText) {
  const lower = promptText.toLowerCase();

  // Offline Intelligence Categorization & Response Generation
  let summary = `JARVIS Offline Brief & Action Blueprint for "${promptText}"`;
  let recommendations = [
    "Execute sub-tasks systematically using your local Eisenhower Matrix.",
    "Maintain buffer windows between high-intensity focus blocks.",
    "Verify baseline requirements prior to committing final deliverables."
  ];
  let steps = [
    `Phase 1: Define clear baseline objectives for "${promptText}".`,
    `Phase 2: Execute modular sub-tasks with real-time local logging.`,
    `Phase 3: Verify outcome quality and update Jarvis Brain memory.`
  ];
  let generatedOutput = `===============================================================
JARVIS OFFLINE KNOWLEDGE BRIEF: ${promptText.toUpperCase()}
[Mode: 100% Local On-Device Sandbox Engine]
===============================================================

1. EXECUTIVE OVERVIEW:
${promptText} is processed locally within your on-device intelligence engine. All task matrix updates, memory logs, and step breakdowns operate with zero external network dependency.

2. CORE WORKFLOW SPECIFICATION:
• Objective Structuring: Segment into clear actionable deliverables.
• Execution Sprints: Work in 25-minute focus intervals.
• Persistent Verification: Save key progress milestones to Jarvis Brain.

3. ACTIONABLE NEXT STEPS:
• Step 1: Assign priority status under your Task Matrix.
• Step 2: Complete initial sub-step checklist.
• Step 3: Log deliverables in offline memory vault.
===============================================================`;

  if (lower.includes('schedule') || lower.includes('time') || lower.includes('routine')) {
    summary = `Offline Schedule Optimization Blueprint for "${promptText}"`;
    recommendations = [
      "Morning Deep Work: Reserve 09:00 - 11:30 for high-priority task execution.",
      "Buffer Protection: Insert 15-minute sync buffers between major focus slots.",
      "Evening Sync: Review completed task velocity at 17:00 daily."
    ];
    steps = [
      "Audit active priority tasks.",
      "Block calendar focus slots.",
      "Log completed milestones."
    ];
    generatedOutput = `OFFLINE OPTIMIZED SCHEDULE:
• 09:00 - 10:30 | Core Strategic Focus (High Priority Tasks)
• 10:30 - 10:45 | Hydration & Recovery Window
• 10:45 - 12:00 | Deep Execution & Problem Solving
• 13:30 - 15:00 | Deliverables & Task Matrix Completion
• 16:30 - 17:00 | Daily Review & Jarvis Memory Persistence`;
  } else if (lower.includes('project') || lower.includes('code') || lower.includes('build') || lower.includes('app')) {
    summary = `Offline Technical Project Architecture for "${promptText}"`;
    recommendations = [
      "Modular Sprints: Divide architecture into isolated components.",
      "Automated Testing: Execute component unit checks before integration.",
      "State Persistence: Ensure local storage caching for offline data reliability."
    ];
    steps = [
      "Set up local project environment and store.",
      "Build core logic modules and offline state hooks.",
      "Perform diagnostic verification and compile build."
    ];
    generatedOutput = `OFFLINE PROJECT BLUEPRINT:
1. Architecture Setup: Create baseline workspace and state contracts.
2. Logic Integration: Implement modular components with persistent storage.
3. Quality Assurance: Run diagnostic verification and build compilation.`;
  }

  return {
    summary,
    recommendations,
    steps,
    generatedOutput,
    suggestedPriority: lower.includes('urgent') ? 'Urgent' : 'High',
    suggestedDeadline: 'Today, 18:00',
    isLiveAI: false,
    providerName: 'JARVIS Local Engine (Offline)'
  };
}

// 2. Hybrid Router (Online API with automatic Offline fallback)
export async function queryJARVIS(promptText, forcedOffline = false) {
  // If explicitly set to offline or browser is offline, use Local Offline Engine directly
  if (forcedOffline || typeof navigator !== 'undefined' && !navigator.onLine) {
    return queryOfflineJarvis(promptText);
  }

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
    console.warn("Online API unavailable, falling back to JARVIS Offline Engine:", err);
  }

  // Automatic Offline Fallback
  return queryOfflineJarvis(promptText);
}
