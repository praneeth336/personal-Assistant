# 📖 J.A.R.V.I.S. Modules & Feature Specifications

Detailed reference guide for all interactive panels and capabilities available in J.A.R.V.I.S.

---

## 1. 🎙️ AI Core Console ([JarvisCore.jsx](file:///c:/Users/praneeth/Desktop/my_projects/personal%20assistent/src/components/JarvisCore.jsx))
* **Reactive Holographic Visualizer**: Pulsing cyan/purple sphere reflecting microphone listening, processing, and voice synthesis states.
* **Direct ChatGPT & Gemini-Style Responses**: Direct, natural, and comprehensive answers without robotic boilerplate or artificial preambles.
* **Rich Cybernetic Markdown Engine ([MarkdownViewer.jsx](file:///c:/Users/praneeth/Desktop/my_projects/personal%20assistent/src/components/MarkdownViewer.jsx))**:
  * Formatted headings, bold emphasis, bullet points, and numbered lists.
  * Fenced code blocks with language identifiers and a 1-click **Copy Code** button.
  * Verified external citations and sources at the bottom (Wikipedia, DuckDuckGo) with direct links.
* **Hybrid Intelligence Engine**: Works seamlessly with free Open Web Knowledge (Wikipedia REST & DuckDuckGo), on-device offline intelligence, or connected Google Gemini / OpenAI keys.
* **Smart Task Matrix Integration**: Only presents task creation buttons when the user explicitly requests to add, plan, or schedule a task.

---

## 2. 🔑 AI Key Slot & Diagnostics Bench ([APIKeySlotPanel.jsx](file:///c:/Users/praneeth/Desktop/my_projects/personal%20assistent/src/components/APIKeySlotPanel.jsx))
* **Dedicated Integration Slot**: Paste any API key directly into the slot with auto-detection for OpenAI (`sk-`), Google Gemini (`AIzaSy`), or Groq (`gsk_`).
* **Live Connection Test Bench**: 1-click **TEST KEY CONNECTION** executes a real ping to the selected provider, calculating latency in milliseconds and reporting exact validation/quota status (e.g. HTTP 200 OK, HTTP 401 Unauthorized, HTTP 429 Quota Exceeded).
* **Multi-Slot Key Manager**: Save multiple keys into customizable slots and switch the active AI engine with a single click.
* **Live Query Output Sandbox**: Test actual prompt generation quality with the active key right inside the panel.

---

## 2. 📋 Task & Goal Matrix ([TaskManager.jsx](file:///c:/Users/praneeth/Desktop/my_projects/personal%20assistent/src/components/TaskManager.jsx))
* **Eisenhower Prioritization**: Organize tasks into *Urgent*, *High Priority*, *Routine Work*, and *Low Priority*.
* **Step Breakdown Checklist**: Interactive sub-task completion tracking.
* **Confetti Rewards**: Triggers canvas particle confetti when major goals are completed.

---

## 3. 🔍 Work Analyzer & Corrector ([WorkAnalyzer.jsx](file:///c:/Users/praneeth/Desktop/my_projects/personal%20assistent/src/components/WorkAnalyzer.jsx))
* **Diagnostic Risk Engine**: Analyzes draft plans, code snippets, or document strategies.
* **Flaw Detection**: Detects risky deployment timing (e.g. Friday afternoon releases), unsegmented email campaigns, or missing automated backups.
* **1-Click Fix Export**: Provides a sanitized, optimized work product ready for immediate use.

---

## 4. 🧠 Memory Vault / Jarvis Brain ([MemoryVault.jsx](file:///c:/Users/praneeth/Desktop/my_projects/personal%20assistent/src/components/MemoryVault.jsx))
* Encrypted local storage for user preferences, work patterns, project context, and schedule rules.
* Instant search, category filters, and 1-click **WIPE BRAIN** controls.

---

## 5. 🛡️ Privacy Permissions Vault ([PrivacyPermissions.jsx](file:///c:/Users/praneeth/Desktop/my_projects/personal%20assistent/src/components/PrivacyPermissions.jsx))
* Granular consent switches for Calendar, Files, Preferences, and Voice Hardware.
* Real-Time Privacy Audit Stream logging all local sandbox events.

---

## 6. ⚠️ Safety & Ethics Filter ([SafetyFilter.jsx](file:///c:/Users/praneeth/Desktop/my_projects/personal%20assistent/src/components/SafetyFilter.jsx))
* Ethics guardrail blocking illegal, malicious, or harmful requests.
* Includes an interactive Safety Test Bench to test benign vs unethical query handling.

---

## 7. 📊 Work Analytics Dashboard ([AnalyticsDashboard.jsx](file:///c:/Users/praneeth/Desktop/my_projects/personal%20assistent/src/components/AnalyticsDashboard.jsx))
* Visual task velocity progress bars, urgency bottleneck counters, completion rates, and AI focus window recommendations.

---

## 8. 🚀 Application Launcher & Security Authorization Vault ([AppLauncherVault.jsx](file:///c:/Users/praneeth/Desktop/my_projects/personal%20assistent/src/components/AppLauncherVault.jsx) & [SecurityAuthModal.jsx](file:///c:/Users/praneeth/Desktop/my_projects/personal%20assistent/src/components/SecurityAuthModal.jsx))
* **Voice & Text Application Launching**: Say or type `"JARVIS open YouTube"`, `"open youtude"`, `"open Gmail"`, `"open GitHub"`, etc.
* **Security Clearance / Password Protection**:
  * Secured applications (Gmail, Banking, Google Drive, WhatsApp, Calendar) require user authorization.
  * Prompts the Operator with a cybernetic security modal requiring the master password / PIN (Default: `jarvis123`, customizable).
  * Automatically verifies credentials before granting launch access.
* **App Security Configuration**: Toggle any application between 🔒 Locked (Secured) and 🔓 Open with 1-click.
* **Custom App Registration**: Register any desktop or web application with custom URL/protocol and security level.
