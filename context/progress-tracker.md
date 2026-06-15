# Progress Tracker

## Current Phase

- Phase 2: Auth + Full API (In Progress)

## Current Goal

- Implement job tracking and video history endpoints.
- Transition to asynchronous job processing (optional for v1, but good to keep in mind).

## Completed

- [x] Population of context files from PLAN.md.
- [x] Establishing implementation strategy.
- [x] Backend initialization with Express, TypeScript, and basic config.
- [x] Pipeline Step 1: Script Generator (OpenRouter/DeepSeek integration).
- [x] Pipeline Step 2: TTS Generator (ElevenLabs SDK integration).
- [x] Pipeline Step 3: Audio Merger (FFmpeg integration).
- [x] Pipeline Step 4: Subtitle Generator (Styled ASS generation).
- [x] Pipeline Step 5: Video Compositor (FFmpeg final render).
- [x] PostgreSQL + Drizzle setup (schema, connection)
- [x] Redis integration for OTP caching.
- [x] User model & Job model implementation.
- [x] Auth routes: register, login, verify-otp, resend-otp, me.
- [x] Auth middleware (JWT verification).
- [x] Protected /api/generate behind auth.

## In Progress

- (Nothing currently in progress)

## Next Up

- Phase 2: Auth + Full API
  1. Job status polling endpoint
  2. Video history endpoint
  3. Error handling middleware refinement
- Phase 3: Frontend
- Phase 4: Payments + Launch

## Roadmap & Future Vision

- [ ] **Social Media Auto-Publish**: Direct integration with YouTube Shorts and Instagram Reels APIs.
- [ ] **AI-Generated Backgrounds**: Instead of preset gameplay, use Flux or Midjourney to generate custom looping backgrounds based on the script.
- [ ] **Viral Trend Analysis**: Hook into TikTok/Reels trends to suggest high-performing topics.
- [ ] **Interactive Preview**: Let users tweak the script or swap voices before the final render.
- [ ] **Face-Sync AI**: Animate character avatars to match the TTS audio for higher engagement.
- [ ] **Magic Link Auth**: Add passwordless login option via magic link.

## Open Questions

- None.

## Architecture Decisions

- **Synchronous Pipeline**: Starting with synchronous execution for v1 to ensure core service stability before adding complexity (queues).
- **Custom ASS Utility**: Using a custom string builder for styled subtitles to maintain full control over the "viral" look.
- **PostgreSQL over MongoDB**: Switched for auth/user management — better relational integrity for users, jobs, and OTP tracking.
- **Drizzle ORM**: Lightweight, type-safe SQL queries. Good alternative to Prisma for this project.
- **OTP over Magic Link (for now)**: Simpler to implement, easier to test (console log in dev), can add magic link later.
- **Nodemailer via Gmail**: For OTP emails in dev/prod. Can swap to Resend or SES later.

## Session Notes

- Decided to switch from MongoDB to PostgreSQL for auth.
- Adding username field — login via email or username.
- Email verification via OTP (6-digit, 10min expiry).
- JWT 7-day expiry.
- Drizzle ORM chosen over Prisma for a change.
- Nodemailer with Gmail for sending OTP emails.
