-- XP and Level Calculation Functions
-- These functions handle the gamification logic

-- Function to calculate XP needed for a specific level
-- Formula: XP = 100 * level^1.5
CREATE OR REPLACE FUNCTION public.xp_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF level <= 1 THEN
    RETURN 0;
  END IF;
  RETURN FLOOR(100 * POWER(level, 1.5))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate level from total XP
-- Inverse of xp_for_level using binary search
CREATE OR REPLACE FUNCTION public.calculate_level(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_level INTEGER := 1;
  xp_needed INTEGER;
BEGIN
  IF total_xp IS NULL OR total_xp < 0 THEN
    RETURN 1;
  END IF;

  -- Simple loop to find level (fast enough for reasonable levels)
  WHILE true LOOP
    xp_needed := public.xp_for_level(current_level + 1);
    EXIT WHEN total_xp < xp_needed;
    current_level := current_level + 1;

    -- Safety limit (prevent infinite loop)
    EXIT WHEN current_level >= 1000;
  END LOOP;

  RETURN current_level;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate streak multiplier
CREATE OR REPLACE FUNCTION public.streak_multiplier(streak INTEGER)
RETURNS DECIMAL AS $$
BEGIN
  IF streak >= 30 THEN
    RETURN 2.0;
  ELSIF streak >= 14 THEN
    RETURN 1.5;
  ELSIF streak >= 7 THEN
    RETURN 1.25;
  ELSIF streak >= 3 THEN
    RETURN 1.1;
  ELSE
    RETURN 1.0;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate XP for an activity
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
  total_xp INTEGER;
BEGIN
  -- Determine base XP by activity type
  CASE activity_type
    WHEN 'workout' THEN base_xp := 50;
    WHEN 'meal' THEN base_xp := 10;
    WHEN 'daily_checkin' THEN base_xp := 5;
    ELSE base_xp := 0;
  END CASE;

  -- Apply streak multiplier
  multiplier := public.streak_multiplier(current_streak);

  -- Add PR bonus if applicable
  IF is_pr THEN
    bonus_xp := 100;
  END IF;

  -- Calculate total XP
  total_xp := FLOOR(base_xp * multiplier)::INTEGER + bonus_xp;

  RETURN total_xp;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to award XP and update level
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id UUID,
  p_xp_amount INTEGER
)
RETURNS TABLE (
  new_total_xp INTEGER,
  old_level INTEGER,
  new_level INTEGER,
  leveled_up BOOLEAN
) AS $$
DECLARE
  v_old_xp INTEGER;
  v_new_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get current stats
  SELECT total_xp, level INTO v_old_xp, v_old_level
  FROM public.user_stats
  WHERE user_id = p_user_id;

  -- Calculate new XP and level
  v_new_xp := v_old_xp + p_xp_amount;
  v_new_level := public.calculate_level(v_new_xp);

  -- Update user stats
  UPDATE public.user_stats
  SET
    total_xp = v_new_xp,
    level = v_new_level
  WHERE user_id = p_user_id;

  -- Return results
  RETURN QUERY SELECT
    v_new_xp AS new_total_xp,
    v_old_level AS old_level,
    v_new_level AS new_level,
    (v_new_level > v_old_level) AS leveled_up;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS TABLE (
  current_streak INTEGER,
  longest_streak INTEGER,
  streak_continued BOOLEAN
) AS $$
DECLARE
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_today DATE := CURRENT_DATE;
  v_streak_continued BOOLEAN;
BEGIN
  -- Get current stats
  SELECT last_activity_date, user_stats.current_streak, user_stats.longest_streak
  INTO v_last_activity, v_current_streak, v_longest_streak
  FROM public.user_stats
  WHERE user_id = p_user_id;

  -- Determine if streak continues or resets
  IF v_last_activity IS NULL OR v_last_activity < v_today - INTERVAL '1 day' THEN
    -- Streak broken or first activity
    IF v_last_activity = v_today - INTERVAL '1 day' THEN
      -- Yesterday, continue streak
      v_current_streak := v_current_streak + 1;
      v_streak_continued := true;
    ELSE
      -- More than 1 day ago, reset streak
      v_current_streak := 1;
      v_streak_continued := false;
    END IF;
  ELSIF v_last_activity = v_today THEN
    -- Already logged today, maintain streak
    v_streak_continued := true;
  ELSE
    -- Future date (shouldn't happen), reset
    v_current_streak := 1;
    v_streak_continued := false;
  END IF;

  -- Update longest streak if needed
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Update user stats
  UPDATE public.user_stats
  SET
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_activity_date = v_today
  WHERE user_id = p_user_id;

  -- Return results
  RETURN QUERY SELECT
    v_current_streak AS current_streak,
    v_longest_streak AS longest_streak,
    v_streak_continued AS streak_continued;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect PR for an exercise
CREATE OR REPLACE FUNCTION public.detect_pr(
  p_user_id UUID,
  p_exercise_name TEXT,
  p_weight DECIMAL,
  p_reps INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_previous_best DECIMAL;
  v_current_score DECIMAL;
  v_is_pr BOOLEAN := false;
BEGIN
  -- Calculate score (weight * reps for comparison)
  v_current_score := p_weight * COALESCE(p_reps, 1);

  -- Get previous best for this exercise
  SELECT MAX(weight * COALESCE(reps, 1))
  INTO v_previous_best
  FROM public.exercises e
  JOIN public.workouts w ON e.workout_id = w.id
  WHERE w.user_id = p_user_id
    AND LOWER(e.exercise_name) = LOWER(p_exercise_name)
    AND e.weight IS NOT NULL;

  -- Check if this is a PR
  IF v_previous_best IS NULL OR v_current_score > v_previous_best THEN
    v_is_pr := true;
  END IF;

  RETURN v_is_pr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON FUNCTION public.xp_for_level IS 'Calculate total XP needed to reach a specific level';
COMMENT ON FUNCTION public.calculate_level IS 'Calculate level from total XP';
COMMENT ON FUNCTION public.streak_multiplier IS 'Get XP multiplier based on current streak';
COMMENT ON FUNCTION public.calculate_xp IS 'Calculate XP for an activity with streak multiplier and bonuses';
COMMENT ON FUNCTION public.award_xp IS 'Award XP to user and update level';
COMMENT ON FUNCTION public.update_streak IS 'Update user streak based on activity date';
COMMENT ON FUNCTION public.detect_pr IS 'Check if exercise is a personal record';
