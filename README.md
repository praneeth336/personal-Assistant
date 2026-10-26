# 🤖 J.A.R.V.I.S. — Personal AI Assistant & Task Intelligence Platform

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-2.5_Flash-886FBF?logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_On--Device-00ff9d)](docs/FEATURES.md#privacy)

> **J.A.R.V.I.S. (Just A Rather Very Intelligent System)** is an advanced, privacy-focused personal AI task management assistant designed to help users organize, track, and complete their goals with step-by-step guidance, automated plan correction, voice interaction, and Google Gemini AI intelligence.

---

## 🌟 Key Features

### 1. 🎙️ AI Core & Direct Knowledge Console
* **Direct ChatGPT & Gemini-Style Output**: Delivers clear, conversational, exact answers immediately without unnecessary task matrix clutter or robotic boilerplate.
* **Cybernetic Markdown Engine**: Beautiful formatting with headers, bullet points, syntax-highlighted code blocks with 1-click copy, and verified web citations.
* **Free Public Knowledge & Search**: Fetches live encyclopedic information from Wikipedia REST API and DuckDuckGo with zero API keys required.
* **External AI Integration**: Optionally connect Google Gemini or OpenAI ChatGPT API keys for frontier LLM reasoning.
* **Web Speech Voice Interaction**: Hands-free voice recognition input and dynamic audio response output.

### 2. 📋 Eisenhower Task & Goal Matrix
* **Quadrant Prioritization**: Organize work into *Urgent & Important*, *High Priority*, *Routine Work*, and *Low Priority*.
* **Automated Sub-Task Generator**: Automatically breaks down complex goals into step-by-step checklists.
* **Celebration Rewards**: Triggers interactive particle confetti celebrations upon completing major goals.

### 3. 🔍 AI Work & Plan Corrector
* **Automated Diagnostic Engine**: Input draft plans, reports, or code snippets for instant risk and efficiency scoring.
* **Flaw Detection**: Scans for high-risk assumptions (e.g. Friday evening production releases, missing backups, unsegmented marketing emails).
* **1-Click Fixes**: Generates a sanitized, optimized work output ready to copy.

### 4. 🧠 Memory Vault ("Jarvis Brain")
* **Encrypted On-Device Memory**: Stores personal working styles, schedule constraints, preferences, and project context locally.
* **Brain Management**: Full search, filtering, adding, and 1-click memory wipe controls.

### 5. 🛡️ Privacy & Permissions Vault
* **Granular Consent Matrix**: Individual permission switches for System Calendar, Local Files, Work History, and Voice Audio hardware.
* **Real-Time Audit Log**: Transparent audit stream verifying all data operations remain inside your local browser sandbox.

### 6. ⚠️ Safety & Ethics Guardrails
* **Active Harm Prevention**: Automatically scans and blocks prompts involving illegal acts, malware, security bypasses, or physical harm.
* **Safety Test Bench**: Built-in test sandbox to verify benign vs unethical query handling.

### 7. 📊 Work Analytics Dashboard
* Real-time metrics for completion rates, efficiency scores, priority bottlenecks, and AI productivity insights.

### 8. 🚀 Application Launcher & Security Authorization Vault
* **Voice & Text App Launching**: Say or type `"JARVIS open YouTube"`, `"open youtude"`, `"open Gmail"`, `"open GitHub"`, `"launch Spotify"`, etc.
* **Security Authorization & Password Protection**: Secured applications (e.g., Gmail, Banking, Drive, WhatsApp) require user permission and password verification before launching.
* **Custom App Registry & Vault**: Add custom web or desktop apps and toggle security lock status (🔒 Locked vs 🔓 Open) with 1-click.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite 5, JavaScript (ES6+)
* **Styling**: Vanilla CSS3, Custom HSL Tokens, Glassmorphism, CSS Grid/Flexbox
* **AI Model**: Google Gemini API (`gemini-2.5-flash` via REST API)
* **Voice Engine**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
* **Open Knowledge**: Wikipedia Open API & DuckDuckGo Instant Answer API
* **Icons & Effects**: Lucide React & Canvas-Confetti
* **Fonts**: Google Fonts (`Orbitron`, `Rajdhani`, `Inter`, `Fira Code`)

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/jarvis-personal-assistant.git
   cd jarvis-personal-assistant
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000/`.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📂 Project Architecture

```
personal-assistant/
├── index.html                  # Web entry point with Orbitron & Rajdhani fonts
├── package.json                # Project dependencies & scripts
├── vite.config.js              # Vite server & build setup
├── README.md                   # Project documentation
├── docs/                       # Architectural & feature documentation
│   ├── ARCHITECTURE.md
│   └── FEATURES.md
└── src/
    ├── main.jsx                # React DOM root renderer
    ├── App.jsx                 # Main layout, HUD top bar & tab router
    ├── index.css               # Design tokens, cyber theme & glassmorphism
    ├── services/
    │   ├── aiService.js        # Google Gemini API integration service
    │   └── openSearchService.js# Wikipedia & DuckDuckGo open data engine
    └── components/
        ├── JarvisCore.jsx      # AI Voice/Text Command Console & Holographic Core
        ├── TaskManager.jsx     # Eisenhower Task Matrix & sub-task generator
        ├── WorkAnalyzer.jsx    # Diagnostic work corrector & plan optimizer
        ├── MemoryVault.jsx     # Jarvis Brain memory store
        ├── PrivacyPermissions.jsx # Consent switches & privacy audit log
        ├── SafetyFilter.jsx    # Ethics guardrail & safety test bench
        └── AnalyticsDashboard.jsx # Work performance & productivity metrics
```

---

## 🔒 Privacy & Safety Commitment

* **Zero Cloud Data Leakage**: All user memories, task matrices, and permission settings are stored strictly in your browser's private `localStorage` sandbox.
* **Ethical Guardrails**: Built-in safety filters enforce zero tolerance for illegal, malicious, or harmful instructions.
