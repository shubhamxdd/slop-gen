# Architecture Context

## Stack

| Layer     | Technology                  | Role                                      |
| --------- | --------------------------- | ----------------------------------------- |
| Framework | Node.js + Express + TS      | Backend API and API Layer                 |
| Worker    | Node.js + BullMQ + TS       | Background Video Pipeline Processing      |
| Frontend  | Vite + React + TS           | User Interface                            |
| UI        | Vanilla CSS (Modern)        | Styling (Avoiding Tailwind per guidelines)|
| Auth      | JWT + Bcrypt + OTP          | Custom Authentication with Email Verify   |
| Database  | PostgreSQL (Docker)         | User, Job, and Video storage              |
| Cache     | Redis                       | OTP, Job Queue, and Rate Limit storage    |
| ORM       | Drizzle ORM                 | Type-safe SQL queries                     |
| Pipeline  | FFmpeg                      | Video Compositing and Audio Merging       |
| AI Models | OpenRouter (DeepSeek)       | Script Generation                         |
| TTS       | ElevenLabs                  | Voice Synthesis                           |
| Email     | Nodemailer (Gmail)          | OTP Verification Emails                   |

## System Boundaries

- `src/pipeline/` — Core generation logic (Script, TTS, Subtitles, Compositing).
- `src/queues/` — BullMQ queue definitions and producers.
- `src/workers/` — Background worker logic that consumes queue jobs.
- `src/routes/` — API endpoint definitions.
- `src/db/` — Drizzle schema, migrations, connection, and Redis client.
- `src/middleware/` — Auth verification, error handling.
- `outputs/` — Local storage for generated media (audio, video, subs).
- `assets/` — Static assets (background gameplay clips).

## Storage Model

- **PostgreSQL**: Stores user accounts, job metadata, and video records.
- **Redis**: Stores ephemeral OTP codes, resend rate limit counters, and BullMQ job state.
- **File System / DO Spaces**: Stores final MP4 outputs, intermediate audio chunks, and subtitle files.

## Auth and Access Model

- JWT-based authentication (7-day expiry) for all non-public routes.
- Users register with email + username + password.
- Login accepts either email or username.
- Email verification required via 6-digit OTP sent through Gmail/Nodemailer.
- Every generation job is owned by a user.
- Users can only access their own video history and job statuses.

## Invariants

1. Subtitle timings must match the ElevenLabs audio duration exactly.
2. Final video output must always be 1080x1920 (9:16 aspect ratio).
3. Free tier users are limited to 5 videos per month.
4. Script generation must return a valid JSON array of dialogue.
5. Email must be verified before user can generate videos.
6. **Async Processing (Target State)**: API requests for video generation should return a job ID immediately and never block on the FFmpeg pipeline. Note: Current implementation is synchronous and blocks during pipeline execution - this is a known limitation to be addressed in future iterations.
