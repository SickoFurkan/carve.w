# Health Dashboard: Link to iOS Carve App Data

Date: 2026-02-21

## Problem

The web dashboard reads from old/empty tables while the iOS Carve app writes to different, richer tables in the same Supabase database. The dashboard shows placeholder data instead of real user data.

## Data Mapping

### Old (broken) vs New (iOS app) tables

| Data | Old table (web) | New table (iOS) | Rows |
|------|----------------|-----------------|------|
| Workouts | `workouts` (doesn't exist!) | `completed_workouts` | 4 |
| Exercises | `exercises` (old schema) | `workout_exercises` | 5 |
| Food diary | — | `diary_entries` | 342 |
| Meals | `meals` (old schema) | `meals` (rewritten by iOS) | 64 |
| Meal items | — | `meal_food_items` | 133 |
| XP/Level | `user_stats.total_xp` | `user_xp` | 31 |
| Score/Tier | — | `carve_scores` | 9 |
| Score history | — | `score_history` | 0 |
| Challenges | hardcoded sample | `monthly_challenges` + `user_challenge_progress` + `challenge_templates` | 4/352 |
| Season ranking | — | `user_season_rankings` | 2 |
| Steps | hardcoded "—" | `daily_steps` | 14 |
| Quick activities | — | `quick_activities` | 25 |

### Key iOS table schemas

**`completed_workouts`**: id, user_id, planned_workout_id, name, workout_date, start_time, end_time, total_volume_kg, total_sets, total_reps, intensity_level, notes, total_duration_minutes, muscle_groups_targeted[], variant_id

**`workout_exercises`**: id, completed_workout_id, exercise_id, exercise_name, order_index, sets, reps, weight_kg, distance_km, duration_seconds, rest_seconds, sets_completed, actual_sets_data (jsonb), notes

**`diary_entries`**: id, user_id, entry_date, total_calories, total_protein_g, total_carbs_g, total_fat_g, total_fiber_g, water_ml, calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g, weight_kg, notes, mood, is_complete

**`meals`** (iOS schema): id, diary_entry_id, user_id, meal_type (text), meal_name, meal_time, total_calories, total_protein_g, total_carbs_g, total_fat_g, notes, photo_url, consumed_at

**`meal_food_items`**: id, meal_id, food_item_id, user_id, servings, serving_unit, calories, protein_g, carbs_g, fat_g, order_index, notes, quantity, unit, protein, carbs, fat, added_method, tokens_used, photo_url, category

**`user_xp`**: user_id, total_xp, current_level, xp_in_current_level, current_season, season_xp, season_month, peak_tier

**`carve_scores`**: user_id, score, tier, components (jsonb: voeding/beweging/training/consistentie), available_components[], calculated_at, window_start, window_end

**`user_season_rankings`**: user_id, season_month, season_xp, percentile, tier

**`challenge_templates`**: id, timeframe, challenge_title, challenge_icon, challenge_image, task_title, task_icon, interaction, xp_reward, category, tier, target_value, sort_order, is_active

**`user_challenge_progress`**: id, user_id, template_id, current_value, is_completed, is_claimed, period_key

**`quick_activities`**: id, user_id, local_id, activity_type, effort_level, duration_minutes, estimated_calories, logged_at

## Changes

### 1. Main Dashboard (`app/(protected)/dashboard/page.tsx`)
**Read from iOS tables:**
- `user_xp` for total_xp, current_level, season_xp, peak_tier
- `carve_scores` for score, tier, components
- `completed_workouts` count
- `daily_steps` for today's steps
- `user_season_rankings` for percentile + worldwide rank
- `challenge_templates` + `user_challenge_progress` for real challenge data

### 2. Dashboard Client (`components/dashboard/HealthDashboardClient.tsx`)
**New props:**
- carveScore, scoreTier, scoreComponents (voeding/beweging/training/consistentie)
- seasonXp, percentile, currentLevel, peakTier
- Real challenge progress data instead of sample data

### 3. Workouts Page (`app/(protected)/dashboard/workouts/page.tsx`)
**Read from:** `completed_workouts` + `workout_exercises`
- Show: total_volume_kg, total_sets, total_reps, intensity_level, muscle_groups_targeted
- Display exercises with weight_kg, sets_completed, actual_sets_data

### 4. Workouts New (`app/(protected)/dashboard/workouts/new/page.tsx`)
**Write to:** `completed_workouts` + `workout_exercises`
- Use new column names: weight_kg (not weight), workout_date (not created_at)

### 5. Food Page (`app/(protected)/dashboard/food/page.tsx`)
**Read from:** `diary_entries` + `meals` (new schema) + `meal_food_items`
- Show daily diary with goals, water intake, mood
- Show individual meals with food items

### 6. Food New (`app/(protected)/dashboard/food/new/page.tsx`)
**Write to:** `diary_entries` + `meals` (new schema)
- Create/update diary_entry for the day
- Create meal linked to diary_entry

### 7. Cleanup
- Remove `components/dashboard/sample-data.ts` hardcoded data (replace with real queries)
- Update type definitions to match new schemas
