# CARVE — Brand Story

## Brand Foundation

| Element | Value |
|---|---|
| **Brand name** | CARVE (legal entity: Carve AI, EU trademark registered) |
| **Tagline** | Self improvement |
| **Supporting line** | Effortless tracking. Visible progress. |
| **Core emotion** | Hunger to progress |
| **Origin** | Amsterdam |

## Positioning

The app that turns solo fitness into a multiplayer game with effortless tracking.

## Target User

Anyone who works out but has no system to track, measure, and share their progress.

## Problem We Solve

Fitness has no scoreboard — no rank, no progression, no way to see if you're improving. And tracking it yourself feels like a chore.

## Brand Story

Fitness has no scoreboard. You work out, eat okay, and hope for the best — but there's no way to see if you're actually progressing. And tracking it yourself feels like a chore. Carve fixes both. We make tracking effortless and turn your progress into a game you play with friends. Scan your food in seconds. Log workouts with a tap. Watch your rank climb from Rookie to Legend. Every rep counts. Every meal matters. Every day is a chance to level up.

## Ecosystem

- **Carve** — Self improvement. Umbrella brand.
- **Carve Health** (app) — Fitness with a scoreboard. Train, eat, compete daily.
- **Carve Money** (app) — Know where your money goes. Track subscriptions, spending, savings.
- **Carve Wiki** (web) — Learn. Knowledge base + public stats dashboard.
- **Carve Coach** (AI) — Grow. Personal AI health advisor.

## Brand Voice

Confident, direct, a little competitive. Like a teammate who's one step ahead of you. Short. Factual. Progress-focused. Let the numbers do the motivating — not empty praise.

### Core Rule

**Gamify the system, not the language.** The UI mechanics should feel like a game (XP bars, ranks, progress). The words should feel like a smart friend talking to you. That contrast is what makes it feel premium instead of gimmicky.

### Voice Principles

- No cheerleader language ("Great job!", "You're amazing!")
- No RPG/fantasy language ("Enter the arena!", "Claim your rank!")
- No generic motivational fluff ("Your journey starts here")
- Let data motivate: ranks, percentiles, streaks, climb indicators
- Keep copy short and factual
- Use the Carve brand voice everywhere: notifications, onboarding, empty states, error messages

## Visual Identity

### Welcome Screen Design Principles

- Dark canvas, no background images — restraint is the flex
- CARVE logo in bold white, wide tracking
- Red double curved flourish as brand accent
- Show, don't tell — mock scoreboard card proves the value proposition visually
- Staggered entrance animation — each element earns its moment
- Single accent color (gold) for ranking/progress elements
- Green for positive change indicators (climb arrows)
- No AI-generated illustrations — they date quickly and look generic

### Design Philosophy

- Premium means less, not more
- One accent color per context, not a rainbow
- Data is the visual — real numbers are more compelling than illustrations
- Monochrome + accent > multicolor
- Every pixel on the welcome screen should sell the product
- If it could be on any other fitness app, it's too generic

## Key Decisions Log

- "Carve AI" is the legal name; "CARVE" is used everywhere users see it
- "Amsterdam" is not shown on the welcome screen — it belongs in Settings > About
- XP is an internal metric; user-facing metrics should be universally understood (workouts, streak, percentile)
- The welcome screen shows a mock scoreboard to create desire before signup friction
- "Top 3% worldwide" is more immediately powerful than "#312" — percentile is the hero, rank is supporting context

---

# Working Style Guide

## How AI Should Assist on This Project

### Approach

- Act as a specialist advisor, not an order-taker. Provide opinionated recommendations with reasoning at every step.
- Lead with strong opinions, loosely held. Present a recommended direction with clear "why", but be open to course corrections.
- One question at a time. Never overwhelm with multiple questions in a single message.
- Prefer multiple choice when possible, open-ended when necessary.

### Design Process

1. **Research first** — always explore the codebase before proposing changes
2. **Brand alignment check** — every design decision gets filtered through the brand story
3. **Build iteratively** — ship something visible quickly, then refine based on what we see on device
4. **Honest critique** — when something looks bad, say so directly with specific reasons
5. **Compare against premium benchmarks** — reference how WHOOP, Strava, Nike, Apple approach similar problems

### Decision Making

- Always explain the tradeoff, not just the recommendation
- When evaluating external input (other AI suggestions, competitor designs), be honest about what works and what doesn't
- Reject over-engineering and unnecessary complexity
- Simple and clear beats clever and complex
- If a design element could be on any generic fitness app, it's not good enough for Carve

### Communication Style

- Direct, no filler
- Dutch and English mixed is fine — follow the user's language in each message
- When showing changes, describe what the user will see before they build
- Use layout sketches (ASCII) to communicate visual concepts before building
- After building, summarize what changed and why

### What Not To Do

- Don't implement without understanding the existing codebase first
- Don't add features beyond what was discussed
- Don't use generic/safe solutions when a distinctive one is possible
- Don't agree with external suggestions just because they exist — evaluate them critically
- Don't add emojis unless asked
- Don't write motivational or cheerleader-style copy anywhere
