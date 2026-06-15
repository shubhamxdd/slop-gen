# Progress Tracker

## Current Phase

- Phase 2: Auth + Full API (Not Started)

## Current Goal

- Implement PostgreSQL + Drizzle ORM setup.
- Build auth system: register, login, email verification (OTP).
- Add job tracking and video history endpoints.

## Completed

- [x] Population of context files from PLAN.md.
- [x] Establishing implementation strategy.
- [x] Backend initialization with Express, TypeScript, and basic config.
- [x] Pipeline Step 1: Script Generator (OpenRouter/DeepSeek integration).
- [x] Pipeline Step 2: TTS Generator (ElevenLabs SDK integration).
- [x] Pipeline Step 3: Audio Merger (FFmpeg integration).
- [x] Pipeline Step 4: Subtitle Generator (Styled ASS generation).
- [x] Pipeline Step 5: Video Compositor (FFmpeg final render).

## In Progress

- (Nothing currently in progress)

## Next Up

- Phase 2: Auth + Full API
  1. PostgreSQL + Drizzle setup (docker-compose, schema, connection)
  2. User model (email, username, passwordHash, plan, isVerified)
  3. Job model (jobId, userId, status, progress, input, output)
  4. Auth routes: register, login, verify-otp, resend-otp, me
  5. Auth middleware (JWT verification)
  6. Error handling middleware
  7. Protect /api/generate behind auth
  8. Job status polling endpoint
  9. Video history endpoint
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
