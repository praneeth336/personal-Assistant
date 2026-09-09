# 🤖 J.A.R.V.I.S. — Personal AI Assistant & Task Intelligence Platform

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-2.5_Flash-886FBF?logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_On--Device-00ff9d)](docs/FEATURES.md#privacy)

> **J.A.R.V.I.S. (Just A Rather Very Intelligent System)** is an advanced, privacy-focused personal AI task management assistant designed to help users organize, track, and complete their goals with step-by-step guidance, automated plan correction, voice interaction, and Google Gemini AI intelligence.

---

## 🌟 Key Features

### 1. 🎙️ AI Core & Voice Command Console
* **Reactive Holographic Core**: Interactive animated visualizer reacting in real time during listening, processing, and speaking states.
* **Google Gemini AI (`gemini-2.5-flash`)**: Powered by Google Gemini API to generate complete, clear, and unabridged responses.
* **Web Speech API**: Hands-free voice recognition microphone input and text-to-speech audio feedback.
* **1-Click Actions**: Instantly export generated action steps to your Task Matrix or save outputs to your Jarvis Brain.

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
├── LICENSE                     # MIT License
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

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
