# Code Standards

## General

- Keep pipeline steps modular and testable in isolation.
- Use explicit error handling for API calls (OpenRouter, ElevenLabs).
- Ensure all file paths are handled using the `path` module for cross-platform compatibility.

## TypeScript

- Strict mode enabled.
- No `any` — define interfaces for AI responses and job inputs.
- Use Zod (or similar) for environment variable and API request validation.

## Express (Backend)

- Use a global error handler middleware.
- Keep controllers thin; move logic to services/pipeline modules.
- Use async/await with try-catch blocks or a wrapper utility.

## Styling

- Use CSS Modules for component-level styling.
- Use the CSS custom properties defined in `ui-context.md`.
- No inline styles unless dynamically calculated.

## API Routes

- Return consistent response shapes: `{ success: boolean, data?: any, error?: string }`.
- Validate job parameters before starting the pipeline.

## Database (Drizzle + PostgreSQL)

- Schema definitions in `src/db/schema/`.
- Use Drizzle's type-safe query builder — no raw SQL strings.
- Migrations in `src/db/migrations/` generated via `drizzle-kit`.
- Use UUIDs for all public-facing IDs (jobId, etc.).
- Table names: snake_case, columns: snake_case.

## Auth

- Password hashing: bcryptjs with salt rounds of 10.
- JWT expiry: 7 days.
- OTP: 6-digit numeric, expires in 10 minutes, max 3 resend attempts per hour.
- Store OTP hashes in DB, not plaintext.

## Data and Storage

- Metadata (title, duration, URL) in PostgreSQL.
- MP4/MP3/ASS files in `outputs/` (dev) or S3-compatible storage (prod).
- Use UUIDs for job IDs and file names to prevent collisions.

## File Organization

- `src/pipeline/` — Step-by-step video generation logic.
- `src/routes/` — Express route handlers.
- `src/db/` — Drizzle schema, connection, migrations.
- `src/middleware/` — Auth, error handler.
- `src/utils/` — Shared helpers (FFmpeg, Storage, Email, etc.).
- `assets/backgrounds/` — Source gameplay videos.
- `outputs/` — Generated artifacts.
