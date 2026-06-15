# ClipForge — Project Overview

## Overview

ClipForge is an AI-powered SaaS designed to generate viral-style short videos (9:16) automatically. It caters to content creators looking for "brainrot" or engagement-heavy content by pairing gameplay footage (like Minecraft or Subway Surfers) with AI-generated character dialogues and synchronized, bold, word-by-word subtitles.

## Goals

1. Generate a complete 60-second viral video from a single topic prompt in under 2 minutes.
2. Provide high-quality TTS using ElevenLabs with distinct character voices.
3. Ensure perfectly synced, word-by-word subtitles with high visual impact (ASS format).

## Core User Flow

1. User registers with email, username, and password.
2. User verifies email via 6-digit OTP sent to their inbox.
3. User logs in (via email or username) and selects two characters and a background.
4. User enters a topic and submits the request (POST /api/generate).
5. Backend generates a dialogue script using DeepSeek-R1 (OpenRouter).
6. Backend generates audio files for each line using ElevenLabs.
7. Backend merges audio, generates styled ASS subtitles, and composites the final MP4 with gameplay footage.
8. User polls for job status and downloads the finished video.

## Features

### AI Generation Pipeline
- **Script Generation**: Conversational JSON scripts via DeepSeek-R1.
- **TTS**: High-quality voice synthesis via ElevenLabs.
- **Subtitles**: Styled, synchronized ASS subtitles (word-by-word).
- **Video Compositing**: Background looping and multi-layer rendering via FFmpeg.

### User Management & Payments
- **Auth**: JWT-based registration and login with email verification (OTP).
- **Payments**: Razorpay integration for subscription plans.
- **History**: Dashboard to view and download previously generated videos.

## Scope

### In Scope
- Node.js/Express/TypeScript Backend.
- Vite/React/TypeScript Frontend.
- PostgreSQL for data storage (users, jobs, videos, OTP codes).
- Drizzle ORM for type-safe database queries.
- Nodemailer (Gmail) for OTP verification emails.
- Local file storage for dev, DigitalOcean Spaces for prod.
- Synchronous (for v1) video generation pipeline.

### Out of Scope
- Automatic social media posting (TikTok/YouTube API).
- AI background video generation (using pre-loaded clips instead).
- Whisper-based transcription (using TTS timestamps instead).

## Success Criteria

1. End-to-end video generation triggered via API call.
2. Accurate synchronization between audio and subtitles.
3. Functional user dashboard and payment flow.
