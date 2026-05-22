# UI Context

## Theme

The design language is a dark, modern, and high-energy workspace. It should feel like a content creation studio. Dark backgrounds, neon or vivid accents (primary purple or blue), and clean, high-contrast text.

## Colors

| Role            | CSS Variable       | Value    |
| --------------- | ------------------ | -------- |
| Page background | `--bg-base`        | `#0a0a0a` |
| Surface         | `--bg-surface`     | `#161616` |
| Primary text    | `--text-primary`   | `#ffffff` |
| Muted text      | `--text-muted`     | `#a3a3a3` |
| Primary accent  | `--accent-primary` | `#7c3aed` |
| Border          | `--border-default` | `#262626` |
| Error           | `--state-error`    | `#ef4444` |
| Success         | `--state-success`  | `#22c55e` |

## Typography

| Role      | Font                | Variable      |
| --------- | ------------------- | ------------- |
| UI text   | Geist Sans / Inter  | `--font-sans` |
| Code/mono | Geist Mono / JetBrains | `--font-mono` |

## Border Radius

| Context           | Class            |
| ----------------- | ---------------- |
| Inline / small UI | `4px`            |
| Cards / panels    | `8px`            |
| Modals / overlays | `12px`           |

## Component Library

Standard React components styled with Vanilla CSS modules. Focus on high-quality interactions and polished transitions.

## Layout Patterns

- **Dashboard**: Grid of generated video cards with quick-view and download options.
- **Generator**: Multi-step form or single-page focused input for topic, voices, and background selection.
- **Player**: Centered mobile-style (9:16) video player for previewing results.

## Icons

Lucide React. Stroke width: 2. Sizes: 16px for inline, 20px for buttons.
