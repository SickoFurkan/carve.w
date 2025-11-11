-- Create user_stats table
-- Stores user gamification stats: level, XP, streaks, totals

CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,

  -- Gamification
  level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,

  -- Streaks
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,

  -- Totals
  total_workouts INTEGER NOT NULL DEFAULT 0,
  total_meals_logged INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT level_positive CHECK (level > 0),
  CONSTRAINT xp_non_negative CHECK (total_xp >= 0),
  CONSTRAINT streak_non_negative CHECK (current_streak >= 0 AND longest_streak >= 0),
  CONSTRAINT totals_non_negative CHECK (total_workouts >= 0 AND total_meals_logged >= 0)
);

-- Create index on user_id for fast lookups (though it's primary key, explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view all stats (needed for leaderboards)
CREATE POLICY "User stats are viewable by everyone"
  ON public.user_stats
  FOR SELECT
  USING (true);

-- Users can only insert their own stats
CREATE POLICY "Users can insert own stats"
  ON public.user_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own stats
CREATE POLICY "Users can update own stats"
  ON public.user_stats
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own stats
CREATE POLICY "Users can delete own stats"
  ON public.user_stats
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically create user_stats on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user_stats on profile creation
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile();

-- Trigger to update updated_at on user_stats changes
DROP TRIGGER IF EXISTS on_user_stats_updated ON public.user_stats;
CREATE TRIGGER on_user_stats_updated
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.user_stats IS 'User gamification statistics: levels, XP, streaks, and activity totals';
COMMENT ON COLUMN public.user_stats.level IS 'Current user level (starts at 1)';
COMMENT ON COLUMN public.user_stats.total_xp IS 'Total XP earned across all activities';
COMMENT ON COLUMN public.user_stats.current_streak IS 'Current consecutive days with activity';
COMMENT ON COLUMN public.user_stats.longest_streak IS 'Longest streak ever achieved';
COMMENT ON COLUMN public.user_stats.last_activity_date IS 'Date of last workout or meal log';
COMMENT ON COLUMN public.user_stats.total_workouts IS 'Lifetime workout count';
COMMENT ON COLUMN public.user_stats.total_meals_logged IS 'Lifetime meal log count';
