# Carve Knowledge System — Design Document

**Date:** 2026-03-04
**Status:** Approved (revised after review)
**Author:** Furkan + Claude

## Summary

A quiz-based knowledge system for carve.wiki that tests users across 7 categories with 3 difficulty levels, provides AI-powered explanations on wrong answers, and displays progress as thematic rank titles on user profiles.

Core loop: **Read → Test → Learn from mistakes → Level up → Show off**

---

## Two Entry Points

### 1. Post-Article Quiz

After reading a wiki article, a "Test je kennis" section appears at the bottom with 3-5 questions about that article's content.

- Contextual — questions directly tied to what the user just read
- Low friction — they're already engaged with the topic
- Serves as a comprehension check and gateway to the Knowledge Hub
- **Renders client-side** — does not break ISR caching of wiki pages
- **Works for unauthenticated users** — anyone can take the quiz, but login is required to save results/XP. On submit without auth, show a soft prompt: "Log in om je score op te slaan"

### 2. Knowledge Hub (`/wiki/learn`)

Standalone quiz experience, independent from articles.

- User picks a category (Training, Nutrition, etc.)
- Picks a difficulty level (unlocked progressively)
- Takes a 10-question quiz
- This is the primary practice space for leveling up
- **Requires authentication** — progress tracking is the core value here

---

## Quiz Format

### Question Type

Multiple choice with 4 options. Proven, fast, easy to grade, gamifiable.

### Difficulty Levels

Three levels per category, unlocked progressively:

| Level | Unlock Condition | XP per Correct |
|-------|-----------------|----------------|
| Beginner | Available immediately | 10 XP |
| Intermediate | 80% accuracy on 20+ Beginner questions | 25 XP |
| Expert | 80% accuracy on 20+ Intermediate questions | 50 XP |

### Wrong Answer Flow

When a user answers incorrectly:

1. Show the correct answer highlighted
2. Display a short explanation (2-3 sentences) from the pre-written `quiz_questions.explanation`
3. Link to the relevant wiki article for deeper reading
4. The explanation is contextual — it addresses WHY the chosen answer is wrong, not just what the right answer is

Example:

> **Q:** Hoeveel gram eiwit per kg lichaamsgewicht wordt aanbevolen voor spieropbouw?
>
> A) 0.5g/kg &nbsp; **B) 0.8g/kg** (selected) &nbsp; C) 1.6-2.2g/kg &nbsp; D) 3.0g/kg
>
> **Fout.** Het correcte antwoord is **C) 1.6-2.2g/kg**.
>
> *0.8g/kg is de minimale aanbeveling voor sedentaire mensen. Voor spieropbouw toont onderzoek dat 1.6-2.2g/kg optimaal is — hogere inname levert geen extra voordeel op.*
> → Lees meer: [Protein Intake for Muscle Growth](/wiki/nutrition/protein-intake)

### Correct Answer Flow

1. Show confirmation with a brief reinforcement fact (optional)
2. Award XP
3. Continue to next question

### Quiz Completion

After finishing a quiz, show:

- Score (e.g., 8/10)
- XP earned
- Progress toward next rank title
- Option to retry missed questions
- Option to start next quiz

### Retry Rules

- Retried questions create new `quiz_attempts` rows (for audit trail)
- Retries do **NOT** award additional XP
- Retries do **NOT** count toward level unlock accuracy calculations
- Only the **first attempt** per question counts toward progression metrics

### Question Selection Strategy

- Knowledge Hub: serve 10 questions the user has **not yet answered correctly** at the selected difficulty, prioritizing unseen questions
- If fewer than 10 unseen questions remain, backfill with previously incorrect questions
- If fewer than 10 total questions exist at that difficulty, serve all available and show a shorter quiz
- Post-article quizzes: draw from questions linked to that specific `article_slug`

---

## Knowledge Ranks

Instead of generic "Level 1/2/3", users earn **thematic titles** per category:

| Category | Beginner | Intermediate | Expert |
|----------|----------|--------------|--------|
| **Training** | Rookie | Coach | Personal Trainer |
| **Nutrition** | Foodie | Nutritionist | Dietitian |
| **Supplements** | Curious | Informed | Specialist |
| **Recovery** | Starter | Practitioner | Recovery Pro |
| **Mindset** | Learner | Mentor | Psychologist |
| **Money** | Saver | Advisor | Financial Planner |
| **Travel** | Tourist | Explorer | World Traveler |

**Master title:** Achieving Expert in all 7 categories earns the title **"Carve Master"**.

---

## Profile: Kenniskaart

### Display Elements

1. **Primary title** — Displayed under username. Shows top 1-2 achieved titles (e.g., "Personal Trainer · Nutritionist")

2. **Radar chart** — Spider/web chart with 7 axes (one per category). Values 0-3 representing level. Instant visual overview of where someone is strong. Built with Recharts `RadarChart` (recharts is in the dependency tree, but RadarChart has not been used yet — needs implementation).

3. **Category cards** — Below the radar chart, one card per category:
   - Rank title + badge icon
   - Questions answered count
   - Accuracy percentage
   - Progress bar toward next rank

4. **Achievements** — Special badges for milestones:
   - "Perfect Score" — 10/10 on any quiz session
   - "Streak: 7 Days" — quiz streak
   - "Quick Learner" — passed Intermediate within first week
   - "Carve Master" — all 7 Expert ranks achieved
   - Category-specific badges (e.g., "Protein Pro", "Budget Boss")

### Social Aspect

- Kenniskaart is visible on public profile
- Other users can see your rank titles and radar chart
- Feeds into existing hiscores/leaderboard system

---

## Question Generation Strategy

### Phase 1: AI-Generated, Human-Reviewed

1. Build a script that takes wiki article content and generates 5-10 questions per article using Claude API
2. Questions are generated with: question text, 4 options, correct answer, difficulty tag, explanation text, linked article slug
3. Human review pass before publishing to ensure quality and accuracy
4. Target: 50-100 questions per category at launch (350-700 total)

### Phase 2: Data-Driven Refinement

- Track which questions are too easy (>95% correct) or too hard (<20% correct)
- Adjust difficulty tags based on real performance data
- Add new questions for underrepresented topics
- Retire stale or poor-performing questions

### Phase 2b: Personalized AI Explanations

- On wrong answers, generate a personalized explanation via Vercel AI SDK (Claude) that considers the user's specific wrong answer
- Store in `quiz_attempts.personalized_explanation`
- Adds cost and latency — only enable when value is proven from Phase 1 usage data

---

## Technical Design

### New Supabase Tables

**`quiz_questions`**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| article_slug | text | NULLABLE | Linked wiki article (null for standalone) |
| category | text | NOT NULL, CHECK (category IN ('Training', 'Nutrition', 'Supplements', 'Recovery', 'Mindset', 'Money', 'Travel')) | Must match wiki_articles categories |
| difficulty | text | NOT NULL, CHECK (difficulty IN ('beginner', 'intermediate', 'expert')) | |
| question_text | text | NOT NULL | The question |
| options | jsonb | NOT NULL, CHECK (jsonb_array_length(options) = 4) | Array of 4 option strings |
| correct_option_index | int | NOT NULL, CHECK (correct_option_index BETWEEN 0 AND 3) | Index of correct answer |
| explanation | text | NOT NULL | Pre-written explanation for wrong answers |
| article_link | text | NULLABLE | Slug to link for "read more" |
| is_published | boolean | NOT NULL, DEFAULT false | True after human review |
| created_at | timestamptz | DEFAULT now() | |

**Indexes:** `(category, difficulty, is_published)`, `(article_slug)`

**`quiz_sessions`**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | NOT NULL, FK auth.users | |
| category | text | NOT NULL | |
| difficulty | text | NOT NULL | |
| source | text | NOT NULL, DEFAULT 'hub' | 'hub' or 'article' |
| article_slug | text | NULLABLE | Only for post-article quizzes |
| score | int | NULLABLE | Filled on completion |
| total_questions | int | NOT NULL | |
| xp_earned | int | DEFAULT 0 | |
| started_at | timestamptz | DEFAULT now() | |
| completed_at | timestamptz | NULLABLE | |

**Indexes:** `(user_id, created_at)`

**`quiz_attempts`**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| session_id | uuid | NOT NULL, FK quiz_sessions | Groups attempts into a quiz |
| user_id | uuid | NOT NULL, FK auth.users | |
| question_id | uuid | NOT NULL, FK quiz_questions | |
| selected_option_index | int | NOT NULL | What the user picked |
| is_correct | boolean | NOT NULL | |
| is_first_attempt | boolean | NOT NULL, DEFAULT true | False for retries — only first attempts count for progression |
| personalized_explanation | text | NULLABLE | Phase 2b: AI-generated contextual explanation |
| created_at | timestamptz | DEFAULT now() | |

**Indexes:** `(user_id, question_id)`, `(user_id, created_at)`, `(session_id)`

**`user_knowledge`**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | uuid | PK (composite), FK auth.users | |
| category | text | PK (composite) | |
| current_level | text | NOT NULL, DEFAULT 'beginner' | beginner / intermediate / expert |
| rank_title | text | NOT NULL, DEFAULT '' | Current rank title |
| total_correct | int | NOT NULL, DEFAULT 0 | Lifetime correct (first attempts only) |
| total_attempted | int | NOT NULL, DEFAULT 0 | Lifetime attempts (first attempts only) |
| level_correct | int | NOT NULL, DEFAULT 0 | Correct at current level |
| level_attempted | int | NOT NULL, DEFAULT 0 | Attempts at current level |
| streak | int | NOT NULL, DEFAULT 0 | Current daily quiz streak (independent from workout/login streaks) |
| best_streak | int | NOT NULL, DEFAULT 0 | All-time best streak |
| xp_earned | int | NOT NULL, DEFAULT 0 | Total XP from this category |
| updated_at | timestamptz | DEFAULT now() | |

**Primary key:** `(user_id, category)` — guarantees one row per user per category.

**Indexes:** `(user_id)` for profile page loading.

**Streak semantics:** Quiz streaks are **completely independent** from workout streaks (`user_stats.current_workout_streak`) and login streaks (`user_subscriptions.login_streak_current`). A quiz streak increments when the user completes at least one quiz session in a calendar day. Missing a day resets to 0.

### XP Award Mechanism

The existing `award_xp()` function writes to `user_stats.total_xp`, but **production uses `profiles.total_xp`** (known DB divergence). The quiz system will:

1. Create a new `award_quiz_xp(p_user_id uuid, p_xp_amount int)` function that updates `profiles.total_xp` and `profiles.level` directly
2. This function is called by the quiz submit API route after grading
3. XP amount is determined by difficulty level (10/25/50) — not by `calculate_xp()` which has no quiz type
4. The function also updates `user_knowledge.xp_earned` for the relevant category

### Rate Limiting

The `POST /api/quiz/submit` endpoint uses the existing `checkRateLimit()` from `lib/ai/rate-limit.ts` to prevent XP farming through automated submissions. Limit: 60 submissions per minute per user.

### RLS Policies

- `quiz_questions`: SELECT for all (published only), INSERT/UPDATE/DELETE for admin role
- `quiz_sessions`: SELECT/INSERT/UPDATE own rows only
- `quiz_attempts`: SELECT/INSERT own rows only (no UPDATE — answers are immutable)
- `user_knowledge`: SELECT own rows (+ public for profile viewing), UPDATE own rows only

### Key Technical Decisions

- **Quiz UI is fully client-side** — No page reloads between questions. Smooth transitions, instant feedback. Submit answers via API route.
- **AI explanations** — Pre-written explanations in `quiz_questions.explanation` for Phase 1. Personalized AI explanations as Phase 2b enhancement.
- **Radar chart** — Recharts `RadarChart` component (needs implementation, not yet used in project).
- **XP integration** — New `award_quiz_xp()` function writes directly to `profiles.total_xp` (matching production schema).
- **RLS policies** — Users can read all published questions, but only read/write their own attempts and knowledge records.

### Routes

Routes use a **Next.js route group** `(learn)` to avoid collision with the existing `/wiki/[category]` dynamic segment:

```
app/wiki/(learn)/learn/page.tsx           → /wiki/learn (Knowledge Hub)
app/wiki/(learn)/learn/[category]/page.tsx → /wiki/learn/[category] (level picker)
app/wiki/(learn)/learn/[category]/quiz/page.tsx → /wiki/learn/[category]/quiz
app/wiki/(learn)/learn/[category]/results/page.tsx → /wiki/learn/[category]/results
```

| Route | Purpose |
|-------|---------|
| `/wiki/learn` | Knowledge Hub — category picker, level selection |
| `/wiki/learn/[category]` | Category quiz page — level picker, start quiz |
| `/wiki/learn/[category]/quiz` | Active quiz experience |
| `/wiki/learn/[category]/results` | Quiz results + AI explanations review |
| `/dashboard/profile` (updated) | Add Kenniskaart section |

**Note:** The existing `VALID_CATEGORIES` in `app/wiki/[category]/layout.tsx` is stale and must be fixed to match the actual 7 categories as a prerequisite task.

### API Routes

| Route | Purpose |
|-------|---------|
| `POST /api/quiz/submit` | Submit a quiz session, return results + explanations. Rate limited. |
| `GET /api/quiz/questions` | Fetch questions by category + difficulty (excludes already-correct questions for authenticated users) |
| `GET /api/quiz/progress` | Get user's knowledge state across all categories |

---

## Integration Points

- **Wiki articles** — Post-article quiz component at bottom of `ArticleLayout` (client-side rendered)
- **Dashboard profile** — Kenniskaart radar chart + rank cards
- **XP system** — New `award_quiz_xp()` function updates `profiles.total_xp` directly
- **Hiscores** — Knowledge leaderboard tab (most XP from quizzes, most Expert ranks)
- **Coach chat** — AI coach can reference quiz performance ("Je scoort laag op Recovery — wil je daar mee oefenen?")

---

## Database Migration Strategy

Because production DB diverges from migration files, all new tables are created via **standalone migration** using:
- `CREATE TABLE IF NOT EXISTS` for all tables
- `CREATE OR REPLACE FUNCTION` for `award_quiz_xp()`
- Can be applied via Supabase dashboard SQL editor or targeted migration
- No dependency on prior migration state

---

## What This Does NOT Include (YAGNI)

- Multiplayer/versus quiz mode (future consideration)
- Open-ended/essay questions (complexity, hard to grade)
- User-submitted questions (moderation burden)
- Timed quizzes (adds stress, reduces learning)
- Paid/premium quiz content (all free for now)
- Admin UI for question management (Phase 1 uses direct DB / scripts)
