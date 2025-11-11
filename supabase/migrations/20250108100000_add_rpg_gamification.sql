-- ============================================================================
-- RPG GAMIFICATION SYSTEM - Additive Migration
-- Adds level/XP system, activity feed, and gamification to existing schema
-- ============================================================================

-- ============================================================================
-- PART 1: Add gamification columns to existing user_stats table
-- ============================================================================

-- Add level and XP columns to user_stats
ALTER TABLE public.user_stats
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1 CHECK (level > 0),
  ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
  ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- Update existing rows to have default values
UPDATE public.user_stats
SET level = 1, total_xp = 0
WHERE level IS NULL OR total_xp IS NULL;

-- Make level and total_xp NOT NULL after setting defaults
ALTER TABLE public.user_stats
  ALTER COLUMN level SET NOT NULL,
  ALTER COLUMN total_xp SET NOT NULL;

COMMENT ON COLUMN public.user_stats.level IS 'Current user level in RPG system (starts at 1)';
COMMENT ON COLUMN public.user_stats.total_xp IS 'Total XP earned across all activities';
COMMENT ON COLUMN public.user_stats.last_activity_date IS 'Date of last workout or meal log (for streak tracking)';

-- ============================================================================
-- PART 2: Create activity_feed table for social features
-- ============================================================================

CREATE TYPE public.activity_type AS ENUM ('workout', 'pr', 'achievement', 'level_up', 'meal');

CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type public.activity_type NOT NULL,
  activity_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT activity_data_valid CHECK (jsonb_typeof(activity_data) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user_created ON public.activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON public.activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_public ON public.activity_feed(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_activity_data ON public.activity_feed USING GIN (activity_data);

ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" ON public.activity_feed FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view friend public activities" ON public.activity_feed FOR SELECT USING (
  is_public = true AND user_id IN (
    SELECT CASE
      WHEN f.requester_id = auth.uid() THEN f.addressee_id
      WHEN f.addressee_id = auth.uid() THEN f.requester_id
    END
    FROM public.friendships f
    WHERE (f.requester_id = auth.uid() OR f.addressee_id = auth.uid())
      AND f.status = 'accepted'
  )
);
CREATE POLICY "Users can insert own activities" ON public.activity_feed FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activities" ON public.activity_feed FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own activities" ON public.activity_feed FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.activity_feed IS 'Activity feed entries for social features';
COMMENT ON COLUMN public.activity_feed.activity_type IS 'Type of activity: workout, pr, achievement, level_up, or meal';
COMMENT ON COLUMN public.activity_feed.activity_data IS 'Flexible JSONB data specific to activity type';

-- ============================================================================
-- PART 3: XP and Level Calculation Functions
-- ============================================================================

-- Calculate XP needed for a specific level (Formula: 100 * level^1.5)
CREATE OR REPLACE FUNCTION public.xp_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF level <= 1 THEN RETURN 0; END IF;
  RETURN FLOOR(100 * POWER(level, 1.5))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate level from total XP
CREATE OR REPLACE FUNCTION public.calculate_level(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_level INTEGER := 1;
  xp_needed INTEGER;
BEGIN
  IF total_xp IS NULL OR total_xp < 0 THEN RETURN 1; END IF;
  WHILE true LOOP
    xp_needed := public.xp_for_level(current_level + 1);
    EXIT WHEN total_xp < xp_needed;
    current_level := current_level + 1;
    EXIT WHEN current_level >= 1000;
  END LOOP;
  RETURN current_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate streak multiplier
CREATE OR REPLACE FUNCTION public.streak_multiplier(streak INTEGER)
RETURNS DECIMAL AS $$
BEGIN
  IF streak >= 30 THEN RETURN 2.0;
  ELSIF streak >= 14 THEN RETURN 1.5;
  ELSIF streak >= 7 THEN RETURN 1.25;
  ELSIF streak >= 3 THEN RETURN 1.1;
  ELSE RETURN 1.0;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calculate XP for an activity
CREATE OR REPLACE FUNCTION public.calculate_xp(
  activity_type TEXT,
  current_streak INTEGER DEFAULT 0,
  is_pr BOOLEAN DEFAULT false
)
RETURNS INTEGER AS $$
DECLARE
  base_xp INTEGER := 0;
  multiplier DECIMAL := 1.0;
  bonus_xp INTEGER := 0;
BEGIN
  CASE activity_type
    WHEN 'workout' THEN base_xp := 50;
    WHEN 'meal' THEN base_xp := 10;
    WHEN 'daily_checkin' THEN base_xp := 5;
    ELSE base_xp := 0;
  END CASE;
  multiplier := public.streak_multiplier(current_streak);
  IF is_pr THEN bonus_xp := 100; END IF;
  RETURN FLOOR(base_xp * multiplier)::INTEGER + bonus_xp;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Award XP and update level
CREATE OR REPLACE FUNCTION public.award_xp(p_user_id UUID, p_xp_amount INTEGER)
RETURNS TABLE (new_total_xp INTEGER, old_level INTEGER, new_level INTEGER, leveled_up BOOLEAN) AS $$
DECLARE
  v_old_xp INTEGER;
  v_new_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
BEGIN
  SELECT total_xp, level INTO v_old_xp, v_old_level FROM public.user_stats WHERE user_id = p_user_id;
  v_new_xp := v_old_xp + p_xp_amount;
  v_new_level := public.calculate_level(v_new_xp);
  UPDATE public.user_stats SET total_xp = v_new_xp, level = v_new_level WHERE user_id = p_user_id;
  RETURN QUERY SELECT v_new_xp, v_old_level, v_new_level, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update streak
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS TABLE (current_streak INTEGER, longest_streak INTEGER, streak_continued BOOLEAN) AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_today DATE := CURRENT_DATE;
  v_streak_continued BOOLEAN;
BEGIN
  SELECT last_activity_date, current_workout_streak, longest_workout_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM public.user_stats WHERE user_id = p_user_id;

  IF v_last_activity IS NULL OR v_last_activity < v_today - INTERVAL '1 day' THEN
    IF v_last_activity = v_today - INTERVAL '1 day' THEN
      v_current_streak := COALESCE(v_current_streak, 0) + 1;
      v_streak_continued := true;
    ELSE
      v_current_streak := 1;
      v_streak_continued := false;
    END IF;
  ELSIF v_last_activity = v_today THEN
    v_streak_continued := true;
  ELSE
    v_current_streak := 1;
    v_streak_continued := false;
  END IF;

  IF v_current_streak > COALESCE(v_longest_streak, 0) THEN
    v_longest_streak := v_current_streak;
  END IF;

  UPDATE public.user_stats
  SET current_workout_streak = v_current_streak,
      longest_workout_streak = v_longest_streak,
      last_activity_date = v_today
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT v_current_streak, v_longest_streak, v_streak_continued;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to create activity
CREATE OR REPLACE FUNCTION public.create_activity(
  p_user_id UUID,
  p_activity_type public.activity_type,
  p_activity_data JSONB DEFAULT '{}'::jsonb,
  p_is_public BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.activity_feed (user_id, activity_type, activity_data, is_public)
  VALUES (p_user_id, p_activity_type, p_activity_data, p_is_public)
  RETURNING id INTO v_activity_id;
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get friend highlights (PRs, achievements, level-ups only)
CREATE OR REPLACE FUNCTION public.get_friend_highlights(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  activity_id UUID, user_id UUID, username TEXT, display_name TEXT,
  avatar_image_url TEXT, activity_type public.activity_type,
  activity_data JSONB, created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
    SELECT a.id, a.user_id, p.username, p.display_name, p.avatar_image_url,
           a.activity_type, a.activity_data, a.created_at
    FROM public.activity_feed a
    JOIN public.profiles p ON a.user_id = p.id
    WHERE a.is_public = true
      AND a.user_id IN (
        SELECT CASE WHEN f.requester_id = p_user_id THEN f.addressee_id ELSE f.requester_id END
        FROM public.friendships f
        WHERE (f.requester_id = p_user_id OR f.addressee_id = p_user_id) AND f.status = 'accepted'
      )
      AND a.activity_type IN ('pr', 'achievement', 'level_up')
    ORDER BY a.created_at DESC LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 4: Triggers for Automatic XP Awards
-- ============================================================================

-- Trigger: Handle completed workout insertion
CREATE OR REPLACE FUNCTION public.handle_completed_workout_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_xp_result RECORD;
  v_streak_result RECORD;
  v_xp_amount INTEGER;
BEGIN
  SELECT * INTO v_streak_result FROM public.update_streak(NEW.user_id);
  v_xp_amount := public.calculate_xp('workout', v_streak_result.current_streak, false);
  SELECT * INTO v_xp_result FROM public.award_xp(NEW.user_id, v_xp_amount);

  PERFORM public.create_activity(
    NEW.user_id, 'workout'::public.activity_type,
    jsonb_build_object('workout_id', NEW.id, 'workout_name', NEW.workout_name,
                       'duration_minutes', NEW.total_duration_minutes, 'xp_earned', v_xp_amount)
  );

  IF v_xp_result.leveled_up THEN
    PERFORM public.create_activity(
      NEW.user_id, 'level_up'::public.activity_type,
      jsonb_build_object('old_level', v_xp_result.old_level, 'new_level', v_xp_result.new_level)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_completed_workout_xp ON public.completed_workouts;
CREATE TRIGGER on_completed_workout_xp
  AFTER INSERT ON public.completed_workouts
  FOR EACH ROW EXECUTE FUNCTION public.handle_completed_workout_insert();

-- Trigger: Handle meal insertion
CREATE OR REPLACE FUNCTION public.handle_meal_insert_xp()
RETURNS TRIGGER AS $$
DECLARE
  v_xp_result RECORD;
  v_streak_result RECORD;
  v_xp_amount INTEGER;
BEGIN
  SELECT * INTO v_streak_result FROM public.update_streak(NEW.user_id);
  v_xp_amount := public.calculate_xp('meal', v_streak_result.current_streak, false);
  SELECT * INTO v_xp_result FROM public.award_xp(NEW.user_id, v_xp_amount);

  PERFORM public.create_activity(
    NEW.user_id, 'meal'::public.activity_type,
    jsonb_build_object('meal_id', NEW.id, 'meal_name', NEW.name, 'xp_earned', v_xp_amount)
  );

  IF v_xp_result.leveled_up THEN
    PERFORM public.create_activity(
      NEW.user_id, 'level_up'::public.activity_type,
      jsonb_build_object('old_level', v_xp_result.old_level, 'new_level', v_xp_result.new_level)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_meal_xp ON public.meals;
CREATE TRIGGER on_meal_xp
  AFTER INSERT ON public.meals
  FOR EACH ROW EXECUTE FUNCTION public.handle_meal_insert_xp();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON FUNCTION public.xp_for_level IS 'Calculate total XP needed to reach a specific level';
COMMENT ON FUNCTION public.calculate_level IS 'Calculate level from total XP';
COMMENT ON FUNCTION public.streak_multiplier IS 'Get XP multiplier based on current streak';
COMMENT ON FUNCTION public.calculate_xp IS 'Calculate XP for an activity with streak multiplier and bonuses';
COMMENT ON FUNCTION public.award_xp IS 'Award XP to user and update level';
COMMENT ON FUNCTION public.update_streak IS 'Update user streak based on activity date';
COMMENT ON FUNCTION public.create_activity IS 'Create a new activity feed entry';
COMMENT ON FUNCTION public.get_friend_highlights IS 'Get friend activity highlights (PRs, achievements, level-ups only)';
