-- Triggers for automatic XP awards, achievements, and activity feed

-- Trigger function: Handle workout insertion
CREATE OR REPLACE FUNCTION public.handle_workout_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_xp_result RECORD;
  v_streak_result RECORD;
  v_xp_amount INTEGER;
BEGIN
  -- Update streak
  SELECT * INTO v_streak_result FROM public.update_streak(NEW.user_id);

  -- Calculate XP
  v_xp_amount := public.calculate_xp('workout', v_streak_result.current_streak, false);

  -- Award XP
  SELECT * INTO v_xp_result FROM public.award_xp(NEW.user_id, v_xp_amount);

  -- Update total_workouts count
  UPDATE public.user_stats
  SET total_workouts = total_workouts + 1
  WHERE user_id = NEW.user_id;

  -- Create activity feed entry
  PERFORM public.create_activity(
    NEW.user_id,
    'workout'::public.activity_type,
    jsonb_build_object(
      'workout_id', NEW.id,
      'workout_name', NEW.name,
      'xp_earned', v_xp_amount
    )
  );

  -- Check and unlock first workout achievement
  IF NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    JOIN public.achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = NEW.user_id AND a.code = 'first_workout'
  ) THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
    SELECT NEW.user_id, id FROM public.achievements WHERE code = 'first_workout';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On workout insert
DROP TRIGGER IF EXISTS on_workout_inserted ON public.workouts;
CREATE TRIGGER on_workout_inserted
  AFTER INSERT ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_workout_insert();

-- Trigger function: Handle exercise insertion (for PR detection)
CREATE OR REPLACE FUNCTION public.handle_exercise_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_workout_user_id UUID;
  v_is_pr BOOLEAN;
  v_pr_xp INTEGER := 100;
BEGIN
  -- Get user_id from workout
  SELECT user_id INTO v_workout_user_id
  FROM public.workouts
  WHERE id = NEW.workout_id;

  -- Check if this is a PR (only if weight is provided)
  IF NEW.weight IS NOT NULL THEN
    v_is_pr := public.detect_pr(
      v_workout_user_id,
      NEW.exercise_name,
      NEW.weight,
      NEW.reps
    );

    -- If PR, update the exercise and award bonus XP
    IF v_is_pr THEN
      NEW.is_pr := true;

      -- Award PR bonus XP
      PERFORM public.award_xp(v_workout_user_id, v_pr_xp);

      -- Create PR activity
      PERFORM public.create_activity(
        v_workout_user_id,
        'pr'::public.activity_type,
        jsonb_build_object(
          'exercise_name', NEW.exercise_name,
          'weight', NEW.weight,
          'reps', NEW.reps,
          'weight_unit', NEW.weight_unit,
          'xp_earned', v_pr_xp
        )
      );

      -- Check and unlock first PR achievement
      IF NOT EXISTS (
        SELECT 1 FROM public.user_achievements ua
        JOIN public.achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = v_workout_user_id AND a.code = 'first_pr'
      ) THEN
        INSERT INTO public.user_achievements (user_id, achievement_id)
        SELECT v_workout_user_id, id FROM public.achievements WHERE code = 'first_pr';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On exercise insert
DROP TRIGGER IF EXISTS on_exercise_inserted ON public.exercises;
CREATE TRIGGER on_exercise_inserted
  BEFORE INSERT ON public.exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_exercise_insert();

-- Trigger function: Handle meal insertion
CREATE OR REPLACE FUNCTION public.handle_meal_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_xp_result RECORD;
  v_streak_result RECORD;
  v_xp_amount INTEGER;
BEGIN
  -- Update streak
  SELECT * INTO v_streak_result FROM public.update_streak(NEW.user_id);

  -- Calculate XP
  v_xp_amount := public.calculate_xp('meal', v_streak_result.current_streak, false);

  -- Award XP
  SELECT * INTO v_xp_result FROM public.award_xp(NEW.user_id, v_xp_amount);

  -- Update total_meals_logged count
  UPDATE public.user_stats
  SET total_meals_logged = total_meals_logged + 1
  WHERE user_id = NEW.user_id;

  -- Create activity feed entry
  PERFORM public.create_activity(
    NEW.user_id,
    'meal'::public.activity_type,
    jsonb_build_object(
      'meal_id', NEW.id,
      'meal_type', NEW.meal_type,
      'calories', NEW.calories,
      'xp_earned', v_xp_amount
    )
  );

  -- Check and unlock first meal achievement
  IF NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    JOIN public.achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = NEW.user_id AND a.code = 'first_meal'
  ) THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
    SELECT NEW.user_id, id FROM public.achievements WHERE code = 'first_meal';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On meal insert
DROP TRIGGER IF EXISTS on_meal_inserted ON public.meals;
CREATE TRIGGER on_meal_inserted
  AFTER INSERT ON public.meals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_meal_insert();

-- Trigger function: Handle achievement unlock
CREATE OR REPLACE FUNCTION public.handle_achievement_unlock()
RETURNS TRIGGER AS $$
DECLARE
  v_achievement RECORD;
BEGIN
  -- Get achievement details
  SELECT * INTO v_achievement
  FROM public.achievements
  WHERE id = NEW.achievement_id;

  -- Award achievement XP
  PERFORM public.award_xp(NEW.user_id, v_achievement.xp_reward);

  -- Create achievement activity
  PERFORM public.create_activity(
    NEW.user_id,
    'achievement'::public.activity_type,
    jsonb_build_object(
      'achievement_code', v_achievement.code,
      'achievement_name', v_achievement.name,
      'tier', v_achievement.tier,
      'xp_earned', v_achievement.xp_reward
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On achievement unlock
DROP TRIGGER IF EXISTS on_achievement_unlocked ON public.user_achievements;
CREATE TRIGGER on_achievement_unlocked
  AFTER INSERT ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_achievement_unlock();

-- Trigger function: Check for level-based and count-based achievements
CREATE OR REPLACE FUNCTION public.check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  v_old_level INTEGER;
  v_achievement_code TEXT;
BEGIN
  -- If level changed, check level achievements
  IF NEW.level > OLD.level THEN
    v_old_level := OLD.level;

    -- Create level-up activity
    PERFORM public.create_activity(
      NEW.user_id,
      'level_up'::public.activity_type,
      jsonb_build_object(
        'old_level', v_old_level,
        'new_level', NEW.level
      )
    );

    -- Check level achievements
    FOR v_achievement_code IN
      SELECT code FROM public.achievements
      WHERE code IN ('level_5', 'level_10', 'level_25', 'level_50')
        AND (
          (code = 'level_5' AND NEW.level >= 5) OR
          (code = 'level_10' AND NEW.level >= 10) OR
          (code = 'level_25' AND NEW.level >= 25) OR
          (code = 'level_50' AND NEW.level >= 50)
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.user_achievements ua
          JOIN public.achievements a ON ua.achievement_id = a.id
          WHERE ua.user_id = NEW.user_id AND a.code = v_achievement_code
        )
    LOOP
      INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT NEW.user_id, id FROM public.achievements WHERE code = v_achievement_code;
    END LOOP;
  END IF;

  -- Check workout count achievements
  IF NEW.total_workouts <> OLD.total_workouts THEN
    FOR v_achievement_code IN
      SELECT code FROM public.achievements
      WHERE code IN ('workout_10', 'workout_50', 'workout_100', 'workout_500')
        AND (
          (code = 'workout_10' AND NEW.total_workouts >= 10) OR
          (code = 'workout_50' AND NEW.total_workouts >= 50) OR
          (code = 'workout_100' AND NEW.total_workouts >= 100) OR
          (code = 'workout_500' AND NEW.total_workouts >= 500)
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.user_achievements ua
          JOIN public.achievements a ON ua.achievement_id = a.id
          WHERE ua.user_id = NEW.user_id AND a.code = v_achievement_code
        )
    LOOP
      INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT NEW.user_id, id FROM public.achievements WHERE code = v_achievement_code;
    END LOOP;
  END IF;

  -- Check streak achievements
  IF NEW.current_streak <> OLD.current_streak THEN
    FOR v_achievement_code IN
      SELECT code FROM public.achievements
      WHERE code IN ('streak_3', 'streak_7', 'streak_14', 'streak_30', 'streak_100')
        AND (
          (code = 'streak_3' AND NEW.current_streak >= 3) OR
          (code = 'streak_7' AND NEW.current_streak >= 7) OR
          (code = 'streak_14' AND NEW.current_streak >= 14) OR
          (code = 'streak_30' AND NEW.current_streak >= 30) OR
          (code = 'streak_100' AND NEW.current_streak >= 100)
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.user_achievements ua
          JOIN public.achievements a ON ua.achievement_id = a.id
          WHERE ua.user_id = NEW.user_id AND a.code = v_achievement_code
        )
    LOOP
      INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT NEW.user_id, id FROM public.achievements WHERE code = v_achievement_code;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Check achievements on user_stats update
DROP TRIGGER IF EXISTS on_stats_updated_check_achievements ON public.user_stats;
CREATE TRIGGER on_stats_updated_check_achievements
  AFTER UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.check_achievements();

-- Trigger function: Handle friendship acceptance (for first friend achievement)
CREATE OR REPLACE FUNCTION public.handle_friendship_update()
RETURNS TRIGGER AS $$
DECLARE
  v_friend_count INTEGER;
BEGIN
  -- Only process if status changed to accepted
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status <> 'accepted') THEN
    -- Count accepted friends for user_id
    SELECT COUNT(*) INTO v_friend_count
    FROM public.friendships
    WHERE (user_id = NEW.user_id OR friend_id = NEW.user_id)
      AND status = 'accepted';

    -- Check first friend achievement for user_id
    IF v_friend_count = 1 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua
      JOIN public.achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = NEW.user_id AND a.code = 'first_friend'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT NEW.user_id, id FROM public.achievements WHERE code = 'first_friend';
    END IF;

    -- Count accepted friends for friend_id
    SELECT COUNT(*) INTO v_friend_count
    FROM public.friendships
    WHERE (user_id = NEW.friend_id OR friend_id = NEW.friend_id)
      AND status = 'accepted';

    -- Check first friend achievement for friend_id
    IF v_friend_count = 1 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua
      JOIN public.achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = NEW.friend_id AND a.code = 'first_friend'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT NEW.friend_id, id FROM public.achievements WHERE code = 'first_friend';
    END IF;

    -- Check other friend count achievements (friends_5, friends_10, friends_25)
    -- For user_id
    SELECT COUNT(*) INTO v_friend_count
    FROM public.friendships
    WHERE (user_id = NEW.user_id OR friend_id = NEW.user_id)
      AND status = 'accepted';

    IF v_friend_count >= 5 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua
      JOIN public.achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = NEW.user_id AND a.code = 'friends_5'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT NEW.user_id, id FROM public.achievements WHERE code = 'friends_5';
    END IF;

    IF v_friend_count >= 10 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua
      JOIN public.achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = NEW.user_id AND a.code = 'friends_10'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT NEW.user_id, id FROM public.achievements WHERE code = 'friends_10';
    END IF;

    IF v_friend_count >= 25 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua
      JOIN public.achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = NEW.user_id AND a.code = 'friends_25'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT NEW.user_id, id FROM public.achievements WHERE code = 'friends_25';
    END IF;

    -- For friend_id (same checks)
    SELECT COUNT(*) INTO v_friend_count
    FROM public.friendships
    WHERE (user_id = NEW.friend_id OR friend_id = NEW.friend_id)
      AND status = 'accepted';

    IF v_friend_count >= 5 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua
      JOIN public.achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = NEW.friend_id AND a.code = 'friends_5'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT NEW.friend_id, id FROM public.achievements WHERE code = 'friends_5';
    END IF;

    IF v_friend_count >= 10 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua
      JOIN public.achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = NEW.friend_id AND a.code = 'friends_10'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT NEW.friend_id, id FROM public.achievements WHERE code = 'friends_10';
    END IF;

    IF v_friend_count >= 25 AND NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua
      JOIN public.achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = NEW.friend_id AND a.code = 'friends_25'
    ) THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      SELECT NEW.friend_id, id FROM public.achievements WHERE code = 'friends_25';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: On friendship update
DROP TRIGGER IF EXISTS on_friendship_status_changed ON public.friendships;
CREATE TRIGGER on_friendship_status_changed
  AFTER UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_friendship_update();

-- Comments
COMMENT ON FUNCTION public.handle_workout_insert IS 'Trigger function: Award XP, update stats, create activity, check achievements on workout insert';
COMMENT ON FUNCTION public.handle_exercise_insert IS 'Trigger function: Detect PRs, award bonus XP, create PR activity on exercise insert';
COMMENT ON FUNCTION public.handle_meal_insert IS 'Trigger function: Award XP, update stats, create activity, check achievements on meal insert';
COMMENT ON FUNCTION public.handle_achievement_unlock IS 'Trigger function: Award achievement XP and create activity on unlock';
COMMENT ON FUNCTION public.check_achievements IS 'Trigger function: Check and unlock level, workout count, and streak achievements';
COMMENT ON FUNCTION public.handle_friendship_update IS 'Trigger function: Check and unlock friend count achievements on friendship acceptance';
