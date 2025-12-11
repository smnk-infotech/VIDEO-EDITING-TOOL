# A.V.E.A – Automated Video Editing Agent 🎬✨

**The AI-powered creative engine for next-gen content creators.**

A.V.E.A completely automates the editing process for TikToks, Reels, and Youtube Videos. It takes your raw footage, analyses it with Gemini, and uses MoviePy to stitch together a perfect story with music, voiceovers, and effects.

---

## 🚀 Key Features

*   **Intelligent Storyboarding (Gemini)**: The AI "watches" your videos, picks the best moments, and arranges them into a coherent narrative (Hook -> Body -> Punch).
*   **Multi-Format Support**:
    *   **📱 Vertical (9:16)**: Perfect for TikTok, Instagram Reels, and YouTube Shorts.
    *   **📺 Horizontal (16:9)**: Full-width support for standard YouTube videos.
*   **Auto Duration**: "Auto" mode lets the AI decide the perfect length based on your footage quality, or you can stick to strict presets (15s, 30s, 60s).
*   **Audio Suite**:
    *   **🎵 Smart Background Music**: Automatically loops and mixes background tracks.
    *   **🗣️ AI Voiceover (TTS)**: Converts generated captions into spoken narration.
*   **Performance Turbo Mode**: Parallel file uploads and multi-threaded rendering make processing large batches (26+ files) up to 10x faster.
*   **Interactive Dashboard**: Real-time state management, format selection, and an integrated "AI Co-Editor" chat for refining edits.

---

## 🛠️ Technology Stack

*   **Frontend**: Next.js 15, React, Tailwind CSS, TypeScript
*   **Backend**: FastAPI (Python 3.11), Uvicorn
*   **AI Core**: Google Gemini 1.5 Pro/Flash (via `google.generativeai`)
*   **Video Engine**: MoviePy, FFmpeg, OpenCV
*   **Audio**: gTTS (Google Text-to-Speech)

---

## 🏁 Getting Started

### Prerequisites
*   Node.js & npm
*   Python 3.11+
*   FFmpeg (installed and added to PATH)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/avea.git
    cd avea
    ```

2.  **Backend Setup**:
    ```bash
    cd backend
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # Mac/Linux:
    source venv/bin/activate
    
    pip install -r requirements.txt
    ```

3.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    ```

4.  **Environment Variables**:
    Create a `.env` file in `backend/` with your API key:
    ```env
    GOOGLE_API_KEY=your_gemini_api_key_here
    ```
    *(Optional: Add `bg_music.mp3` to `backend/assets/music/` for background music)*

### Running the App

1.  **Start Backend** (inside `backend/`):
    ```bash
    python -m uvicorn app.main:app --reload
    ```
    *Server will start at `http://localhost:8000`*

2.  **Start Frontend** (inside `frontend/`):
    ```bash
    npm run dev
    ```
    *App will be live at `http://localhost:3000`*

---

## 📂 Project Structure

*   `backend/app/services/gemini_client.py`: Core AI logic (Prompt engineering, Parallel Uplods).
*   `backend/app/services/renderer.py`: Video processing engine (MoviePy, TTS, Effects).
*   `frontend/app/dashboard/page.tsx`: Main UI logic.
*   `media/`: Dynamic storage for user uploads and generated output.

---

**Built with ❤️ for Creators.**
