-- Create achievements table
-- Defines all possible achievements in the system

CREATE TYPE public.achievement_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Achievement details
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,  -- Lucide icon name
  tier public.achievement_tier NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT code_format CHECK (code ~ '^[a-z0-9_]+$'),
  CONSTRAINT name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT description_not_empty CHECK (char_length(trim(description)) > 0),
  CONSTRAINT xp_non_negative CHECK (xp_reward >= 0)
);

-- Create index on code for fast lookups
CREATE INDEX IF NOT EXISTS idx_achievements_code ON public.achievements(code);
CREATE INDEX IF NOT EXISTS idx_achievements_tier ON public.achievements(tier);

-- Enable Row Level Security
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view achievements
CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements
  FOR SELECT
  USING (true);

-- Create user_achievements junction table
-- Tracks which achievements users have unlocked

CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, achievement_id)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON public.user_achievements(user_id, unlocked_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view all user achievements (for leaderboards, friend profiles)
CREATE POLICY "User achievements are viewable by everyone"
  ON public.user_achievements
  FOR SELECT
  USING (true);

-- Users can only insert their own achievements
CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update achievements (they're unlocked once)
-- Users can delete their own achievements (for testing/admin)
CREATE POLICY "Users can delete own achievements"
  ON public.user_achievements
  FOR DELETE
  USING (auth.uid() = user_id);

-- Seed initial achievements
INSERT INTO public.achievements (code, name, description, icon, tier, xp_reward) VALUES
  -- First Steps
  ('first_workout', 'First Rep', 'Log your first workout', 'dumbbell', 'bronze', 50),
  ('first_meal', 'First Bite', 'Log your first meal', 'apple', 'bronze', 50),
  ('first_friend', 'Social Butterfly', 'Add your first friend', 'users', 'bronze', 50),

  -- Workout Milestones
  ('workout_10', 'Getting Strong', 'Complete 10 workouts', 'dumbbell', 'silver', 150),
  ('workout_50', 'Gym Regular', 'Complete 50 workouts', 'dumbbell', 'gold', 300),
  ('workout_100', 'Fitness Warrior', 'Complete 100 workouts', 'dumbbell', 'gold', 300),
  ('workout_500', 'Legend', 'Complete 500 workouts', 'trophy', 'platinum', 500),

  -- PR Achievements
  ('first_pr', 'Record Breaker', 'Set your first PR', 'award', 'bronze', 100),
  ('pr_10', 'Strength Rising', 'Set 10 PRs', 'award', 'silver', 150),
  ('pr_50', 'Power House', 'Set 50 PRs', 'zap', 'gold', 300),

  -- Streak Achievements
  ('streak_3', 'On a Roll', 'Maintain a 3-day streak', 'flame', 'bronze', 50),
  ('streak_7', 'Week Warrior', 'Maintain a 7-day streak', 'flame', 'silver', 150),
  ('streak_14', 'Fortnight Fighter', 'Maintain a 14-day streak', 'flame', 'silver', 150),
  ('streak_30', 'Monthly Machine', 'Maintain a 30-day streak', 'flame', 'gold', 300),
  ('streak_100', 'Unstoppable', 'Maintain a 100-day streak', 'flame', 'platinum', 500),

  -- Level Achievements
  ('level_5', 'Rising Star', 'Reach Level 5', 'star', 'bronze', 50),
  ('level_10', 'Power Player', 'Reach Level 10', 'star', 'silver', 150),
  ('level_25', 'Elite Athlete', 'Reach Level 25', 'star', 'gold', 300),
  ('level_50', 'Champion', 'Reach Level 50', 'crown', 'platinum', 500),

  -- Social Achievements
  ('friends_5', 'Squad Building', 'Have 5 friends', 'users', 'bronze', 50),
  ('friends_10', 'Squad Goals', 'Have 10 friends', 'users', 'silver', 150),
  ('friends_25', 'Social Star', 'Have 25 friends', 'users-round', 'gold', 300),

  -- Nutrition Achievements
  ('meal_week_complete', 'Meal Master', 'Log meals for 7 consecutive days', 'utensils', 'silver', 150),
  ('meal_100', 'Nutrition Tracker', 'Log 100 meals', 'utensils', 'gold', 300)
ON CONFLICT (code) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE public.achievements IS 'Achievement definitions available in the system';
COMMENT ON COLUMN public.achievements.code IS 'Unique identifier for achievement (snake_case)';
COMMENT ON COLUMN public.achievements.name IS 'Display name of the achievement';
COMMENT ON COLUMN public.achievements.description IS 'Description of how to unlock';
COMMENT ON COLUMN public.achievements.icon IS 'Lucide icon name for display';
COMMENT ON COLUMN public.achievements.tier IS 'Achievement tier: bronze, silver, gold, or platinum';
COMMENT ON COLUMN public.achievements.xp_reward IS 'XP awarded when unlocked';

COMMENT ON TABLE public.user_achievements IS 'Tracks which achievements users have unlocked';
COMMENT ON COLUMN public.user_achievements.unlocked_at IS 'Timestamp when achievement was unlocked';
