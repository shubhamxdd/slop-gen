# Architecture Context

## Stack

| Layer     | Technology                  | Role                                      |
| --------- | --------------------------- | ----------------------------------------- |
| Framework | Node.js + Express + TS      | Backend API and Video Pipeline            |
| Frontend  | Vite + React + TS           | User Interface                            |
| UI        | Vanilla CSS (Modern)        | Styling (Avoiding Tailwind per guidelines)|
| Auth      | JWT + Bcrypt                | Custom Authentication                     |
| Database  | MongoDB                     | Metadata, User, and Job storage           |
| Pipeline  | FFmpeg                      | Video Compositing and Audio Merging       |
| AI Models | OpenRouter (DeepSeek)       | Script Generation                         |
| TTS       | ElevenLabs                  | Voice Synthesis                           |

## System Boundaries

- `src/pipeline/` — Core generation logic (Script, TTS, Subtitles, Compositing).
- `src/routes/` — API endpoint definitions.
- `src/models/` — Mongoose schemas for MongoDB.
- `outputs/` — Local storage for generated media (audio, video, subs).
- `assets/` — Static assets (background gameplay clips).

## Storage Model

- **MongoDB**: Stores user accounts, generation job statuses, and video metadata.
- **File System / DO Spaces**: Stores final MP4 outputs, intermediate audio chunks, and subtitle files.

## Auth and Access Model

- JWT-based authentication for all non-public routes.
- Every generation job is owned by a user.
- Users can only access their own video history and job statuses.

## Invariants

1. Subtitle timings must match the ElevenLabs audio duration exactly.
2. Final video output must always be 1080x1920 (9:16 aspect ratio).
3. Free tier users are limited to 5 videos per month.
4. Script generation must return a valid JSON array of dialogue.
