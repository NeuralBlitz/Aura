# Aura OS v9.0: The Unified Spatial Substrate

A high-performance, mobile-first spatial substrate forge and agentic coding environment. Aura OS v9.0 leverages the latest Gemini 3.1 models to provide a seamless bridge between natural language and interactive spatial artifacts.

## 🌌 Core Modules

### 🛠️ Substrate Forge
A robust, neural-driven coding environment for creating spatial simulations and interactive artifacts.
- **Unified Rendering:** Support for 2D Canvas, Three.js (3D), React, and Angular within a single substrate.
- **AURA API:** A simplified, high-level API for animations, input handling, and spatial utilities.
- **Neural Repair:** Automated runtime debugging and "healing" of generated code using self-review loops.
- **Context Management:** Advanced WebGL/2D context switching with automatic canvas reset.

### 🤖 Neural Link (Aura Codex)
An advanced agentic chat system that handles complex reasoning and code synthesis.
- **Multi-Phase Planning:** Codex architects a technical plan before writing a single line of code.
- **Iterative Fabrication:** Step-by-step code generation with real-time progress visualization.
- **Google Search Grounding:** Integrated web search for up-to-date technical information.
- **Persistence:** Real-time session sync to Firestore for seamless continuity across devices.

### 📡 Integrated Ecosystem
- **Nexus Intel:** AI-powered tech and science feed with real-time grounding.
- **Module Registry:** A marketplace for discovering, installing, and launching specialized AURA modules.
- **Sovereign Vault:** Secure, encrypted storage for sensitive data, user profiles, and API keys.
- **Neural Forums:** Simulated real-time community discussions and system updates.

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env` file based on `.env.example`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Firebase Integration
Aura OS uses Firebase for persistence and authentication.
- Ensure `firebase-applet-config.json` is populated with your project credentials.
- Deploy security rules using the provided `firestore.rules`.
- The app automatically handles user profile synchronization and session persistence.

### 3. Development
```bash
npm install
npm run dev
```

## 🛠️ Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS, Motion (Animations), Lucide Icons.
- **AI Engine:** Google Generative AI SDK (`@google/genai`) using Gemini 3.1 Pro/Flash.
- **Backend:** Express (Vite Middleware), Firestore, Firebase Auth.
- **Graphics:** HTML5 Canvas, Three.js, React Three Fiber (optional), htm (React-in-JS).

---
*Aura OS: The interface between thought and substrate.*
