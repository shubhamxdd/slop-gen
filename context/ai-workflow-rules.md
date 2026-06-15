# AI Workflow Rules

## Approach

Build ClipForge incrementally starting with the Backend Pipeline. The pipeline is the core product; without it, the API and Frontend have no purpose. Follow the Phase 1–4 plan in `PLAN.md` strictly.

## Scoping Rules

- Implement one pipeline step at a time (Script -> TTS -> Merge -> Subtitles -> Composite).
- Verify each step with a script or test before moving to the next.
- The backend must be fully functional via API (Postman/Curl) before starting the Frontend.
- Auth must be fully functional before protecting generation routes.

## When to Split Work

- Separate the generation of dialogue from the generation of audio.
- Separate subtitle file generation from the video compositing step.
- Separate user auth logic from the core generation pipeline.

## Handling Missing Requirements

- If a specific character voice is not defined, use a sensible default from ElevenLabs.
- If a background clip is missing, return a clear error in the job status.

## Protected Files

- `outputs/` (Do not delete files manually; use cleanup logic if implemented).
- `assets/backgrounds/` (Source assets).

## Keeping Docs in Sync

- Update `progress-tracker.md` after each pipeline step is completed.
- Update `architecture.md` if switching from synchronous to asynchronous (BullMQ).
- Update `architecture.md` if changing database or ORM.

## Before Moving to the Next Unit

1. The current pipeline step produces the expected output file or data.
2. Errors (API timeouts, invalid JSON) are handled gracefully.
3. `progress-tracker.md` is updated.
