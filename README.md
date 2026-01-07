# prema.ai (Video Generation Engine)

> **Automated Video Editing Agent (AVEA)**
> *Turn raw footage into viral shorts in seconds using AI.*

---

## 🚀 Overview
**prema.ai** is a high-performance AI video editor that analyzes raw video footage, identifies the most engaging moments ("hooks", "body", "punch"), and automatically assembles them into a viral-style vertical video (TikTok/Reels/Shorts).

It features a modern, premium UI with real-time job processing, optimized AI pipelines, and instant dashboard redirection.

---

## ✨ Features

### 🧠 Intelligent Analysis (Gemini 2.0 Flash)
- **Ultra-Fast Scene Detection**: Uses Google's `gemini-2.0-flash` model for lightning-fast video understanding (2K Requests/Min).
- **Smart Compression Protocol**: Automatically compresses large 4K uploads (500MB+) into tiny 360p proxies (5MB) *before* sending to AI. **10x faster processing.**
- **Contextual Editing**: Detects sentiment (Motivational, Intense, Happy) and adjusts pacing automatically.

### 🎨 Premium UI/UX
- **Universal Themes**: toggle between **Universal Space** (Holographic), **Vibrant Nebula** (Creative), and **Premium Light** (SaaS).
- **Instant Redirect**: No loading screens. "Setup" page redirects immediately to "Dashboard" where jobs process in the background.
- **Micro-Animations**: Mouse-tracking spotlights, magnetic buttons, and glassmorphism elements.

### ⚡ Performance Engineering
- **Async Rendering**: Video assembly happens in a background thread; the API never blocks.
- **Optimized FFmpeg**: Uses `imageio-ffmpeg` binary for guaranteed hardware acceleration support on Windows.
- **Polling Architecture**: Dashboard autonomously checks local storage to resume tracking jobs even after a refresh.

---

## 🛠️ Architecture

### Frontend (`/frontend`)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Framer Motion
- **State**: React Hooks + Local Storage (for Job IDs)

### Backend (`/backend`)
- **Server**: FastAPI (Python)
- **AI Engine**: Google Gemini 1.5/2.0 Flash
- **Video Processing**: MoviePy + FFmpeg (Direct Binary)
- **Task Queue**: FastAPI BackgroundTasks

---

## 🏃‍♂️ Quick Start

### 1. Backend
```bash
cd backend
# Create/Activate Virtual Env
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install Deps
pip install -r requirements.txt

# Run Server (Port 8080)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

### 2. Frontend
```bash
cd frontend
# Install Deps
npm install

# Run Dev Server (Port 3000)
npm run dev
```

Visit: `http://localhost:3000`

---

## 🔮 Roadmap & Improvements

### Phase 1: Core (Completed ✅)
- [x] Basic Video Assembly (Hook/Body/Punch)
- [x] AI Captioning
- [x] Universal UI Themes
- [x] **Speed Optimization (Gemini Flash + Compression)**

### Phase 2: Generation (Coming Soon 🚧)
- [ ] **AI Image Generation**: Use `imagen-4.0-generate` to create B-roll from scratch.
- [ ] **AI Video Generation**: Use `veo-3.0` to generate transitions or scenes.
- [ ] **AI Voiceovers**: Integrated ElevenLabs or OpenAI TTS for narration.

### Phase 3: Polish
- [ ] **Precise Transitions**: Add 'whip-pan' and 'zoom-blur' transitions in MoviePy.
- [ ] **Music Sync**: Beat-sync logic to cut video exactly on music downbeats.
- [ ] **User Accounts**: Firebase/Supabase auth for saving user history.

---

## 🐛 Troubleshooting

**"FFmpeg not found"**
- The system now uses `imageio-ffmpeg` to automatically find the correct binary. You do not need to install FFmpeg manually on the system PATH.

**"Hydration Mismatch"**
- Fixed by adding `suppressHydrationWarning` to inputs, preventing browser extensions (like Password Managers) from crashing the React tree.
