# Progress Tracker

## Current Phase

- Phase 1: Backend Core (In Progress)

## Current Goal

- Project initialization and directory structure setup.

## Completed

- [x] Population of context files from PLAN.md.
- [x] Establishing implementation strategy.
- [x] Backend initialization with Express, TypeScript, and basic config.
- [x] Pipeline Step 1: Script Generator (OpenRouter/DeepSeek integration).
- [x] Orchestrator skeleton and basic API endpoint (/api/generate).
- [x] Pipeline Step 2: TTS Generator (ElevenLabs SDK integration).
- [x] Pipeline Step 3: Audio Merger (FFmpeg integration).
- [x] Pipeline Step 4: Subtitle Generator (Styled ASS generation).

## In Progress

- Pipeline Step 5: Video Compositor (FFmpeg final render).

## Next Up

- Write `scriptGenerator.ts` — OpenRouter integration.
- Write `ttsGenerator.ts` — ElevenLabs integration.

## Open Questions

- None.

## Architecture Decisions

- **Synchronous Pipeline**: Starting with synchronous execution for v1 to ensure core service stability before adding complexity (queues).
- **Custom ASS Utility**: Using a custom string builder for styled subtitles to maintain full control over the "viral" look.

## Session Notes

- Starting implementation of the Express backend and the first step of the pipeline (Script Generation).
