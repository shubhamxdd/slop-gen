# ClipForge — AI-Powered Viral Short Video Generator
### Updated Product & Technical Plan · v2.0

---

## Table of Contents

1. [What Is ClipForge?](#1-what-is-clipforge)
2. [What Changed in v2](#2-what-changed-in-v2)
3. [System Architecture](#3-system-architecture)
4. [Backend — Node + Express + TypeScript](#4-backend--node--express--typescript)
5. [The Core Generation Pipeline](#5-the-core-generation-pipeline)
6. [API Endpoints](#6-api-endpoints)
7. [Database Design (MongoDB)](#7-database-design-mongodb)
8. [File Storage Strategy](#8-file-storage-strategy)
9. [Frontend — Vite + React + TypeScript](#9-frontend--vite--react--typescript)
10. [Tech Stack Summary](#10-tech-stack-summary)
11. [Cost Breakdown](#11-cost-breakdown)
12. [Pricing & Payments (Razorpay)](#12-pricing--payments-razorpay)
13. [Week-by-Week Build Plan](#13-week-by-week-build-plan)
14. [Risks & Mitigations](#14-risks--mitigations)
15. [Future Roadmap](#15-future-roadmap)

---

## 1. What Is ClipForge?

ClipForge is a SaaS that generates viral-style short videos automatically:

- 🎮 Gameplay footage in the background (Minecraft, Subway Surfers, etc.)
- 🗣️ Two AI characters having a conversation (voices via ElevenLabs)
- 📝 Auto-synced bold word-by-word subtitles

User inputs a topic or script → gets a ready-to-post 9:16 MP4 in under 2 minutes.

---

## 2. What Changed in v2

| Area | v1 Plan | v2 Plan |
|---|---|---|
| AI model | Groq (Llama 3.3 70B) | OpenRouter → `deepseek/deepseek-r1-0528:free` |
| Backend | Next.js API routes | Separate Node.js + Express + TypeScript app |
| Frontend | Next.js | Vite + React + TypeScript |
| Database | Supabase (Postgres) | MongoDB self-hosted in Docker |
| Payments | Stripe | Razorpay |
| Job queue | Inngest | Synchronous for now → BullMQ later |
| Dev storage | Supabase Storage | Local filesystem → DigitalOcean Spaces later |

---

## 3. System Architecture

```
┌─────────────────────┐         ┌──────────────────────────────────────┐
│                     │  REST   │        Backend (Express + TS)        │
│  Vite React TS App  │ ──────► │                                      │
│  (Frontend)         │         │  /api/generate   POST  → start job   │
│                     │ ◄────── │  /api/job/:id    GET   → poll status │
│  localhost:5173     │  JSON   │  /api/videos     GET   → history     │
└─────────────────────┘         │  /api/auth       POST  → login etc.  │
                                │  /api/payment    POST  → razorpay    │
                                │                                      │
                                │  localhost:3000                      │
                                └──────────┬───────────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
           ┌─────────────┐      ┌─────────────────┐    ┌──────────────────┐
           │  MongoDB    │      │  Local Storage  │    │  External APIs   │
           │  (Docker)   │      │  /outputs/      │    │                  │
           │             │      │  (dev only)     │    │  OpenRouter AI   │
           │  users      │      │                 │    │  ElevenLabs TTS  │
           │  jobs       │      │  → DO Spaces    │    │  Razorpay        │
           │  videos     │      │     (prod)      │    └──────────────────┘
           └─────────────┘      └─────────────────┘
```

---

## 4. Backend — Node + Express + TypeScript

### Project Structure

```
clipforge-backend/
├── src/
│   ├── index.ts                  # Express app entry point
│   ├── config/
│   │   ├── db.ts                 # MongoDB connection
│   │   └── env.ts                # Env var validation
│   ├── routes/
│   │   ├── generate.route.ts     # POST /api/generate
│   │   ├── job.route.ts          # GET /api/job/:id
│   │   ├── video.route.ts        # GET /api/videos
│   │   ├── auth.route.ts         # Auth endpoints
│   │   └── payment.route.ts      # Razorpay endpoints
│   ├── controllers/
│   │   ├── generate.controller.ts
│   │   ├── job.controller.ts
│   │   └── payment.controller.ts
│   ├── pipeline/                 # ← THE CORE (build this first)
│   │   ├── index.ts              # Orchestrator — runs all steps in order
│   │   ├── scriptGenerator.ts    # Step 1: OpenRouter → dialogue JSON
│   │   ├── ttsGenerator.ts       # Step 2: ElevenLabs → MP3 per line
│   │   ├── audioMerger.ts        # Step 3: FFmpeg → stitch MP3s
│   │   ├── subtitleGenerator.ts  # Step 4: Build .ASS from timestamps
│   │   ├── videoCompositor.ts    # Step 5: FFmpeg → final MP4
│   │   └── uploader.ts           # Step 6: Save locally (or DO Spaces later)
│   ├── models/
│   │   ├── User.model.ts
│   │   ├── Job.model.ts
│   │   └── Video.model.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT verification
│   │   └── error.middleware.ts   # Global error handler
│   └── utils/
│       ├── ffmpeg.ts             # FFmpeg wrapper helpers
│       └── storage.ts            # Local save → later DO Spaces
├── outputs/                      # Generated files stored here (dev)
│   ├── audio/
│   ├── video/
│   └── subtitles/
├── assets/
│   └── backgrounds/              # Pre-loaded gameplay clips
├── .env
├── tsconfig.json
├── package.json
└── docker-compose.yml            # MongoDB container
```

### Key Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.x",
    "mongoose": "^8.x",
    "axios": "^1.x",
    "fluent-ffmpeg": "^2.x",
    "jsonwebtoken": "^9.x",
    "bcryptjs": "^2.x",
    "razorpay": "^2.x",
    "dotenv": "^16.x",
    "uuid": "^9.x",
    "cors": "^2.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/express": "^4.x",
    "@types/node": "^20.x",
    "@types/fluent-ffmpeg": "^2.x",
    "ts-node-dev": "^2.x"
  }
}
```

### Docker Compose (MongoDB)

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongo:
    image: mongo:7
    container_name: clipforge_mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

volumes:
  mongo_data:
```

Start with: `docker compose up -d`

### Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://admin:password@localhost:27017/clipforge?authSource=admin
JWT_SECRET=your_jwt_secret

# AI
OPENROUTER_API_KEY=your_key
OPENROUTER_MODEL=deepseek/deepseek-r1-0528:free

# TTS
ELEVENLABS_API_KEY=your_key

# Payments
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

# Storage
STORAGE_MODE=local              # switch to "spaces" when ready
LOCAL_OUTPUTS_DIR=./outputs
DO_SPACES_KEY=                  # fill when going to prod
DO_SPACES_SECRET=
DO_SPACES_BUCKET=
DO_SPACES_ENDPOINT=
```

---

## 5. The Core Generation Pipeline

This is the entire product. Build this first, before any routes or auth.

### Step-by-Step Flow

```
POST /api/generate  { topic, characters, backgroundId }
        │
        ▼
pipeline/index.ts  ← orchestrator
        │
        ├── Step 1: scriptGenerator.ts
        │     └── OpenRouter API (deepseek-r1-0528:free)
        │         Input:  topic string
        │         Output: [ { character: "A", line: "..." }, ... ]
        │
        ├── Step 2: ttsGenerator.ts
        │     └── ElevenLabs API (per line)
        │         Input:  each dialogue line + voice ID
        │         Output: [ line1.mp3, line2.mp3, ... ]
        │         Also returns: [ { line, startMs, durationMs } ]
        │
        ├── Step 3: audioMerger.ts
        │     └── fluent-ffmpeg concat
        │         Input:  array of .mp3 files
        │         Output: full_dialogue.mp3 + total duration
        │
        ├── Step 4: subtitleGenerator.ts
        │     └── Pure TypeScript (no Whisper needed for v1!)
        │         Input:  script lines + TTS timestamps
        │         Output: subtitles.ass (word-level, styled)
        │
        ├── Step 5: videoCompositor.ts
        │     └── fluent-ffmpeg
        │         Input:  background clip + audio + subtitles
        │         Output: final_output.mp4 (1080x1920)
        │
        └── Step 6: uploader.ts
              └── Dev: save to ./outputs/video/
                  Prod: upload to DO Spaces
                  Returns: accessible URL

```

### Why Skip Whisper in v1?

Whisper transcribes audio to get word timestamps. But since you're generating the script yourself and ElevenLabs returns the audio duration per line, you already know exactly what was said and roughly when. You can calculate subtitle timestamps directly:

```
Line 1 audio = 2.3 seconds → words spread across 0s to 2.3s
Line 2 audio = 1.8 seconds → starts at 2.3s, ends at 4.1s
...
```

This means no Whisper server needed for v1. Add it later if you want more precise per-word timing.

### Pipeline Code Sketch

```typescript
// pipeline/index.ts
export async function runPipeline(jobId: string, input: PipelineInput): Promise<string> {
  await updateJob(jobId, { status: 'generating_script' });
  const script = await generateScript(input.topic, input.characters);

  await updateJob(jobId, { status: 'generating_audio' });
  const audioFiles = await generateTTS(script);            // returns mp3s + timestamps

  await updateJob(jobId, { status: 'merging_audio' });
  const { audioPath, duration } = await mergeAudio(audioFiles);

  await updateJob(jobId, { status: 'generating_subtitles' });
  const subtitlePath = await generateSubtitles(script, audioFiles);

  await updateJob(jobId, { status: 'rendering_video' });
  const videoPath = await compositeVideo({
    backgroundId: input.backgroundId,
    audioPath,
    subtitlePath,
    duration
  });

  await updateJob(jobId, { status: 'uploading' });
  const videoUrl = await uploadFile(videoPath);

  await updateJob(jobId, { status: 'done', videoUrl });
  return videoUrl;
}
```

### Script Generator (OpenRouter)

```typescript
// pipeline/scriptGenerator.ts
const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
  model: process.env.OPENROUTER_MODEL,
  messages: [{
    role: 'user',
    content: `Generate a funny dialogue between two characters about: "${topic}".
    Return ONLY a JSON array like:
    [{"character":"A","line":"..."},{"character":"B","line":"..."}]
    8-12 lines total. No preamble, no markdown, just JSON.`
  }]
}, {
  headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` }
});
// parse JSON from response
```

### TTS Generator (ElevenLabs)

```typescript
// pipeline/ttsGenerator.ts
// Call ElevenLabs for each line, save to outputs/audio/{jobId}/line_N.mp3
// ElevenLabs response headers include X-DG-Request-Id and audio duration info
// Store { linIndex, filePath, durationMs } for subtitle generation
```

### Subtitle Generator (No Whisper)

```typescript
// pipeline/subtitleGenerator.ts
// Build .ASS subtitle file from known timestamps
// Format: word-by-word, 1-2 words at a time, bold white + black outline
// ASS format gives full control over styling unlike SRT
```

### Video Compositor (FFmpeg)

```typescript
// pipeline/videoCompositor.ts
import ffmpeg from 'fluent-ffmpeg';

ffmpeg()
  .input(backgroundPath).inputOptions(['-stream_loop -1'])
  .input(audioPath)
  .videoFilters(`subtitles=${subtitlePath}`)
  .outputOptions([
    '-t', String(duration),
    '-c:v libx264', '-preset fast', '-crf 28',
    '-c:a aac', '-b:a 128k',
    '-s 1080x1920',
    '-y'
  ])
  .save(outputPath)
```

---

## 6. API Endpoints

All endpoints prefixed with `/api`.

### Generation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/generate` | Start a video generation job |
| `GET` | `/api/job/:jobId` | Poll job status + get result URL |
| `GET` | `/api/videos` | List user's generated videos |
| `GET` | `/api/videos/:id` | Get a single video details |

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/auth/me` | Get current user info |

### Payments (Razorpay)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/payment/create-order` | Create Razorpay order |
| `POST` | `/api/payment/verify` | Verify payment signature |
| `GET` | `/api/payment/plans` | Get available plans |

### Generate Request Body

```json
{
  "topic": "Why dogs are better than cats",
  "mode": "ai",
  "characters": {
    "A": { "name": "Dumb Dad", "voiceId": "elevenlabs_voice_id_1" },
    "B": { "name": "Evil Genius", "voiceId": "elevenlabs_voice_id_2" }
  },
  "backgroundId": "minecraft_parkour"
}
```

### Job Status Response

```json
{
  "jobId": "abc123",
  "status": "rendering_video",
  "progress": 70,
  "createdAt": "2026-05-22T10:00:00Z",
  "videoUrl": null
}
```

Status progression:
`queued` → `generating_script` → `generating_audio` → `merging_audio` → `generating_subtitles` → `rendering_video` → `uploading` → `done` | `failed`

---

## 7. Database Design (MongoDB)

### User Model

```typescript
{
  _id: ObjectId,
  email: string,
  passwordHash: string,
  plan: 'free' | 'starter' | 'pro' | 'agency',
  videosGeneratedThisMonth: number,
  createdAt: Date
}
```

### Job Model

```typescript
{
  _id: ObjectId,
  jobId: string,           // UUID, used for polling
  userId: ObjectId,
  status: string,          // see status progression above
  progress: number,        // 0-100
  input: {
    topic: string,
    mode: 'ai' | 'manual',
    characters: object,
    backgroundId: string
  },
  output: {
    videoUrl: string | null,
    durationSec: number | null
  },
  error: string | null,
  createdAt: Date,
  completedAt: Date | null
}
```

### Video Model

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  jobId: string,
  title: string,           // auto-generated from topic
  videoUrl: string,
  thumbnailUrl: string,
  durationSec: number,
  storageSize: number,     // bytes
  createdAt: Date,
  expiresAt: Date          // auto-delete after 7 days (free tier)
}
```

---

## 8. File Storage Strategy

### Development (Local)

```
outputs/
├── audio/
│   └── {jobId}/
│       ├── line_0.mp3
│       ├── line_1.mp3
│       ├── ...
│       └── full_dialogue.mp3
├── subtitles/
│   └── {jobId}.ass
└── video/
    └── {jobId}.mp4
```

Served via Express static middleware during dev:
```typescript
app.use('/outputs', express.static(path.join(__dirname, '../outputs')));
```

### Production (DigitalOcean Spaces)

Switch by changing `STORAGE_MODE=spaces` in `.env`. The `uploader.ts` module handles both:

```typescript
// utils/storage.ts
export async function saveFile(localPath: string, jobId: string): Promise<string> {
  if (process.env.STORAGE_MODE === 'local') {
    return `http://localhost:3000/outputs/video/${jobId}.mp4`;
  }
  // upload to DO Spaces, return CDN URL
}
```

Zero code changes needed when switching — just update the env var.

---

## 9. Frontend — Vite + React + TypeScript

> **Build after the backend pipeline works end-to-end. Don't touch the frontend until you can generate a video via a raw API call (curl or Postman).**

### Project Structure

```
clipforge-frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api/
│   │   └── client.ts          # Axios instance + all API calls
│   ├── pages/
│   │   ├── Home.tsx            # Landing page
│   │   ├── Dashboard.tsx       # User's video history
│   │   └── Generate.tsx        # The main generation form
│   ├── components/
│   │   ├── GenerateForm.tsx    # Topic input, character select, background picker
│   │   ├── ProgressTracker.tsx # Polls job status, shows progress bar
│   │   ├── VideoCard.tsx       # Display a generated video
│   │   └── PlanBadge.tsx       # Show current plan
│   └── hooks/
│       └── useJobPoller.ts     # Polls GET /api/job/:id every 2s
├── index.html
├── vite.config.ts
└── package.json
```

### Polling Hook

```typescript
// hooks/useJobPoller.ts
export function useJobPoller(jobId: string | null) {
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      const res = await api.get(`/job/${jobId}`);
      setJob(res.data);
      if (['done', 'failed'].includes(res.data.status)) {
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  return job;
}
```

---

## 10. Tech Stack Summary

| Layer | Technology | Cost |
|---|---|---|
| Backend framework | Node.js + Express + TypeScript | Free |
| Frontend framework | Vite + React + TypeScript | Free |
| Database | MongoDB (Docker) | Free |
| AI model | OpenRouter → `deepseek/deepseek-r1-0528:free` | Free |
| TTS | ElevenLabs API | Free tier (10k chars/mo) |
| Video processing | FFmpeg via fluent-ffmpeg | Free |
| Subtitles | Custom ASS generator (no Whisper in v1) | Free |
| Auth | JWT (custom, no third-party) | Free |
| Payments | Razorpay | Free until revenue |
| Dev storage | Local filesystem | Free |
| Prod storage | DigitalOcean Spaces | $5/mo |
| Prod server | DigitalOcean Droplet (2 vCPU) | $12/mo |
| **Total (dev)** | | **$0/mo** |
| **Total (prod)** | | **$17/mo** |

---

## 11. Cost Breakdown

### Per Video (Production)

| Component | Cost |
|---|---|
| OpenRouter (DeepSeek free) | $0.00 |
| ElevenLabs (free tier) | $0.00 |
| FFmpeg render on $12 droplet | ~$0.03 |
| DO Spaces storage | ~$0.01 |
| **Total** | **~$0.04/video** |

### Monthly Fixed (Production)

| Service | Cost |
|---|---|
| DigitalOcean Droplet $12 | $12/mo |
| DigitalOcean Spaces | $5/mo |
| **Total** | **$17/mo** |

---

## 12. Pricing & Payments (Razorpay)

### Plans

| Plan | Price | Videos/mo | Features |
|---|---|---|---|
| Free | ₹0 | 5 | Watermark, preset voices only |
| Starter | ₹299/mo | 30 | No watermark, all voices |
| Pro | ₹799/mo | 100 | + Custom voice upload, priority queue |
| Agency | ₹1,599/mo | Unlimited | + Team seats, API access |

### Razorpay Flow

```
Frontend: user clicks "Upgrade"
        ↓
POST /api/payment/create-order  { planId }
        ↓
Backend: Razorpay SDK creates order → returns { orderId, amount, currency }
        ↓
Frontend: opens Razorpay checkout modal
        ↓
User pays
        ↓
POST /api/payment/verify  { orderId, paymentId, signature }
        ↓
Backend: verifies HMAC signature → updates user.plan in MongoDB
        ↓
Frontend: shows success, unlocks features
```

---

## 13. Week-by-Week Build Plan

### Phase 1 — Backend Core (Weeks 1–3)

**Week 1 — Project Setup + Pipeline Skeleton**

- Init Node + Express + TypeScript project
- Set up Docker + MongoDB + Mongoose models
- Set up folder structure as defined above
- Write `.env` config + validation
- Write pipeline `index.ts` orchestrator (empty stubs for each step)
- Write `scriptGenerator.ts` — call OpenRouter, parse JSON dialogue
- Test: hit OpenRouter, get back structured dialogue array ✅

**Week 2 — Audio + Subtitles**

- Write `ttsGenerator.ts` — call ElevenLabs per line, save MP3s locally
- Write `audioMerger.ts` — FFmpeg concat all MP3s into one file
- Write `subtitleGenerator.ts` — generate `.ASS` file from timestamps
- Test: given a script, get back one merged audio file + subtitle file ✅

**Week 3 — Video + API**

- Write `videoCompositor.ts` — FFmpeg composite final MP4
- Write `uploader.ts` — save locally, return URL
- Wire up `POST /api/generate` → runs pipeline synchronously → returns jobId
- Wire up `GET /api/job/:id` → returns status + videoUrl when done
- Test: POST a topic via Postman → poll job → download finished MP4 ✅

---

### Phase 2 — Auth + Full API (Week 4)

- Add JWT auth middleware
- `POST /api/auth/register` and `/login`
- Protect generation routes behind auth
- Usage limit check (free tier: 5 videos/month)
- Add `GET /api/videos` for video history

---

### Phase 3 — Frontend (Week 5)

- Init Vite + React + TypeScript
- Build Generate page (form → POST → poll → download)
- Build Dashboard (video history)
- Build basic auth pages (login/register)

---

### Phase 4 — Payments + Launch (Week 6)

- Integrate Razorpay (create order → verify → update plan)
- Add watermark to free tier videos (FFmpeg `drawtext`)
- Switch storage to DigitalOcean Spaces (`STORAGE_MODE=spaces`)
- Deploy backend to DigitalOcean Droplet
- Deploy frontend to Vercel
- Invite beta users

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| DeepSeek free model gives bad dialogue | Prompt engineer heavily. Add retry if JSON parse fails. Fallback to `meta-llama/llama-3.3-70b-instruct:free` on OpenRouter |
| ElevenLabs 10k char/mo free limit hit fast | Monitor usage. One video ≈ 600 chars. ~16 videos free/mo. Switch to OpenAI TTS ($0.015/1k chars) when needed |
| FFmpeg render blocks the Express server | Fine for now (synchronous). Move to BullMQ + worker process once it's a problem |
| MongoDB data loss on Docker restart | Volume mount in docker-compose ensures data persists across restarts |
| Long render time (30-60 sec) causes HTTP timeout | Set Express timeout to 120s. For production, switch to async queue before deploy |

---

## Summary

| Dimension | Decision |
|---|---|
| Backend | Node.js + Express + TypeScript |
| Frontend | Vite + React + TypeScript (after backend done) |
| Database | MongoDB in Docker |
| AI model | OpenRouter → `deepseek/deepseek-r1-0528:free` |
| TTS | ElevenLabs free tier |
| Subtitles | Custom ASS generator (skip Whisper in v1) |
| Job handling | Synchronous now → BullMQ queue later |
| Dev storage | Local filesystem |
| Prod storage | DigitalOcean Spaces |
| Payments | Razorpay |
| Dev cost | $0/mo |
| Prod cost | $17/mo |
| Build order | Pipeline → API → Auth → Frontend → Payments |

---

## 15. Future Roadmap

### Short Term (v2.1)
- **BullMQ Integration**: Move video rendering to a background worker process.
- **DigitalOcean Spaces**: Switch from local storage to cloud storage for scale.
- **Dockerization**: Full containerized stack for easy deployment.

### Mid Term (v2.2)
- **Social Connect**: One-click posting to YouTube Shorts and Instagram Reels.
- **AI Backgrounds**: Integrate Flux/Stable Diffusion for custom scene generation.
- **Manual Editor**: A simple web UI to edit the script lines before hitting "Render".

### Long Term (v3.0)
- **Face Animation**: Use LivePortrait or similar tech to animate character avatars.
- **Multi-Language**: Auto-translate scripts and use localized ElevenLabs voices.
- **Viral Predictor**: AI that scores script ideas based on current TikTok trends.

---

*ClipForge — Confidential Product Plan · v2.0*