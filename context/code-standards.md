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

## Data and Storage

- Metadata (title, duration, URL) in MongoDB.
- MP4/MP3/ASS files in `outputs/` (dev) or S3-compatible storage (prod).
- Use UUIDs for job IDs and file names to prevent collisions.

## File Organization

- `src/pipeline/` — Step-by-step video generation logic.
- `src/routes/` — Express route handlers.
- `src/models/` — Mongoose models.
- `src/utils/` — Shared helpers (FFmpeg, Storage, etc.).
- `assets/backgrounds/` — Source gameplay videos.
- `outputs/` — Generated artifacts.
