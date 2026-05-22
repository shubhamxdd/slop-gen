# 🎬 ClipForge — AI-Powered Viral Short Video Generator

ClipForge is a powerful SaaS pipeline designed to generate high-engagement, viral-style short videos (9:16) automatically. It pairs AI-generated dialogues with gameplay footage and high-impact, synchronized subtitles.

## 🚀 How It Works

The generation process follows a strict 5-step modular pipeline:

1.  **Script Generation**: Uses **DeepSeek-R1 (via OpenRouter)** to generate funny, engaging 2-character dialogues in JSON format based on a user-provided topic.
2.  **Voice Synthesis**: Converts the script into high-quality audio using the **ElevenLabs SDK**, generating individual segments for each character.
3.  **Audio Merging**: Uses **FFmpeg** to stitch all dialogue segments into a single, seamless master audio track.
4.  **Subtitle Generation**: Creates custom **Advanced Substation Alpha (.ass)** files. It uses word-level timing from the TTS step to create the "viral" word-by-word animation effect.
5.  **Video Composition**: The final FFmpeg render loops a background gameplay clip (e.g., Minecraft), overlays the master audio, and "burns in" the styled subtitles to produce a ready-to-post MP4.

## 🛠️ Tech Stack

-   **Backend**: Node.js, Express, TypeScript
-   **AI**: OpenRouter
-   **Voice**: ElevenLabs SDK
-   **Media Processing**: FFmpeg (via fluent-ffmpeg)
-   **Database**: MongoDB (Mongoose) - *In Progress*
-   **Frontend**: React + Vite - *Phase 3*

## 📁 Project Structure

```text
slop-gen/
├── backend/
│   ├── src/
│   │   ├── pipeline/          # The Core Engine
│   │   │   ├── index.ts       # Pipeline Orchestrator
│   │   │   ├── scriptGen.ts   # OpenRouter Integration
│   │   │   ├── ttsGen.ts      # ElevenLabs Integration
│   │   │   ├── audioMerger.ts # FFmpeg Audio Stitching
│   │   │   ├── subtitleGen.ts # Styled ASS Generation
│   │   │   └── compositor.ts  # Final Video Rendering
│   │   └── index.ts           # Express API
│   ├── assets/                # Background gameplay clips
│   └── outputs/               # Generated Audio/Video/Subs
├── context/                   # Project Specification & Progress
└── PLAN.md                    # Detailed Technical Roadmap
```

## ⚡ Quick Start

### 1. Prerequisites
-   **Node.js** (v18+ recommended)
-   **FFmpeg** installed and added to your system PATH.

### 2. Setup
```bash
cd backend
npm install
```

### 3. Environment Variables
Create a `.env` file in the `backend` folder:
```env
PORT=3000
OPENROUTER_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
```

### 4. Run the Server
```bash
npm run dev
```

### 5. Generate a Video
Send a POST request to `http://localhost:3000/api/generate`:
```json
{
  "topic": "Why coding is like cooking",
  "characters": {
    "A": { "name": "Chef", "voiceId": "JBFqnCBsd6RMkjVDRZzb" },
    "B": { "name": "Coder", "voiceId": "XB0fDUnXU5powFXDhCwa" }
  },
  "backgroundId": "minecraft_loop"
}
```

## 📈 Roadmap

- [x] Phase 1: Core Generation Pipeline
- [ ] Phase 2: User Auth & MongoDB Persistence
- [ ] Phase 3: React Frontend Dashboard
- [ ] Phase 4: Razorpay Payments & Subscription Tiers

---
*Built with ❤️ for the "Brainrot" Content Economy.*
