# 🏗️ J.A.R.V.I.S. Technical Architecture & System Design

This document details the system design, data flow, state management, and component hierarchy of the **J.A.R.V.I.S. Personal Assistant** platform.

---

## 📐 System Overview

The system is constructed as a modern single-page application (SPA) using **React 18** and **Vite 5**, backed by a multi-tier intelligence pipeline combining **Google Gemini API (`gemini-2.5-flash`)**, browser-native **Web Speech API**, and **Open Knowledge Retrieval APIs (Wikipedia & DuckDuckGo)**.

```
+-----------------------------------------------------------------------+
|                             USER INTERFACE                            |
|          React 18 HUD Router (Tab Navigation & Live Header Bar)        |
+-----+---------------+-----------------+---------------+---------------+
      |               |                 |               |
      v               v                 v               v
+-----------+  +--------------+  +--------------+  +---------------+
|  AI Core  |  | Task Matrix  |  | Work         |  | Memory Vault  |
|  Console  |  | (Eisenhower) |  | Analyzer     |  | (Jarvis Brain)|
+-----+-----+  +--------------+  +--------------+  +---------------+
      |
      +---> [ Safety & Ethics Guardrail ]
      |
      +---> [ Google Gemini 2.5 Flash REST API ]
      |
      +---> [ Open Source Search Engine (Wikipedia/DuckDuckGo) ]
      |
      +---> [ Web Speech API (Voice Synthesis & Speech Recognition) ]
```

---

## 🔄 Intelligence & Data Flow Pipeline

1. **User Prompt Dispatch**:
   - The operator submits a query via text input or hands-free voice using `SpeechRecognition`.
2. **Safety & Ethics Scanning**:
   - `checkSafetyViolation()` evaluates the prompt against forbidden keywords.
   - If flagged, the system returns a **Safety Refusal Warning Card** and logs an incident in the Safety Audit Vault.
3. **Google Gemini AI Processing**:
   - Prompt is sent to `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`.
   - Structured JSON response is parsed into summary, strategic recommendations, step-by-step breakdown, and unabridged output text.
4. **Open Data Retrieval Fallback**:
   - Informational queries trigger `fetchOpenSourceData()`, querying Wikipedia & DuckDuckGo APIs for full reference extracts.
5. **Voice Audio Feedback**:
   - `SpeechSynthesis` synthesizes natural spoken feedback if enabled.
6. **Task & Memory State Synchronization**:
   - Generated action steps can be exported with 1-click into `TaskManager` or persisted in `MemoryVault` (`localStorage`).

---

## 💾 Local Storage & Confidentiality Architecture

All application data is strictly localized within the browser's sandbox environment:
* `jarvis_tasks`: Persistent array of task matrix objects, completion states, and sub-steps.
* `jarvis_memories`: Encrypted local store of user habits, schedule constraints, and preferences.

---

## 🔒 Security & Guardrail Specifications

- **Zero Third-Party Tracking**: User input data is never logged to unauthorized telemetry servers.
- **Strict Ethics Enforcement**: Enforces policies refusing illegal, malicious, or exploit code generation.
