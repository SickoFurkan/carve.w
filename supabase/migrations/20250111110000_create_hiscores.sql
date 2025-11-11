-- Migration: Create Hiscores/Leaderboard System
-- Purpose: Enable public leaderboards with opt-in privacy controls

-- ============================================================================
-- 1. PROFILE PRIVACY SETTINGS
-- ============================================================================

-- Add privacy settings to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_workouts BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN profiles.public_profile IS 'Whether profile is publicly viewable';
COMMENT ON COLUMN profiles.show_on_leaderboard IS 'Whether to appear on leaderboards (requires public_profile)';
COMMENT ON COLUMN profiles.show_workouts IS 'Whether to show workout history publicly';

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_public ON profiles(public_profile, show_on_leaderboard)
  WHERE public_profile = TRUE AND show_on_leaderboard = TRUE;

-- ============================================================================
-- 2. SAMPLE DATA FOR DEMO (Remove in production)
-- ============================================================================

-- Note: This is demo data for the landing page
-- In production, replace with real user data or remove

-- Insert sample users (only if not exists)
INSERT INTO profiles (id, username, display_name, public_profile, show_on_leaderboard, total_xp, level, workout_count, created_at)
SELECT
  gen_random_uuid(),
  'demo_user_' || generate_series,
  CASE generate_series
    WHEN 1 THEN 'Sarah "IronQueen" Martinez'
    WHEN 2 THEN 'Mike "BeastMode" Chen'
    WHEN 3 THEN 'Emma "PowerLift" Johnson'
    WHEN 4 THEN 'Alex "Cardio King" Thompson'
    WHEN 5 THEN 'Lisa "FitFury" Anderson'
    WHEN 6 THEN 'David "Gains" Williams'
    WHEN 7 THEN 'Sophie "Shredder" Brown'
    WHEN 8 THEN 'Jake "Muscle" Davis'
    WHEN 9 THEN 'Nina "Athlete" Wilson'
    WHEN 10 THEN 'Chris "Titan" Moore'
  END,
  TRUE, -- public_profile
  TRUE, -- show_on_leaderboard
  CASE generate_series
    WHEN 1 THEN 15420
    WHEN 2 THEN 14850
    WHEN 3 THEN 13990
    WHEN 4 THEN 12750
    WHEN 5 THEN 11680
    WHEN 6 THEN 10920
    WHEN 7 THEN 9840
    WHEN 8 THEN 8750
    WHEN 9 THEN 7680
    WHEN 10 THEN 6590
  END, -- total_xp
  CASE generate_series
    WHEN 1 THEN 42
    WHEN 2 THEN 40
    WHEN 3 THEN 38
    WHEN 4 THEN 35
    WHEN 5 THEN 32
    WHEN 6 THEN 30
    WHEN 7 THEN 27
    WHEN 8 THEN 24
    WHEN 9 THEN 21
    WHEN 10 THEN 18
  END, -- level
  CASE generate_series
    WHEN 1 THEN 487
    WHEN 2 THEN 456
    WHEN 3 THEN 423
    WHEN 4 THEN 390
    WHEN 5 THEN 352
    WHEN 6 THEN 318
    WHEN 7 THEN 285
    WHEN 8 THEN 251
    WHEN 9 THEN 218
    WHEN 10 THEN 187
  END, -- workout_count
  NOW() - (generate_series || ' days')::INTERVAL
FROM generate_series(1, 10)
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- 3. LEADERBOARD VIEWS
-- ============================================================================

-- Top users by total XP
CREATE OR REPLACE VIEW leaderboard_xp AS
SELECT
  id,
  username,
  display_name,
  avatar_image_url,
  total_xp,
  level,
  workout_count,
  created_at,
  ROW_NUMBER() OVER (ORDER BY total_xp DESC, created_at ASC) AS rank
FROM profiles
WHERE public_profile = TRUE
  AND show_on_leaderboard = TRUE
  AND total_xp > 0
ORDER BY total_xp DESC, created_at ASC;

-- Top users by level
CREATE OR REPLACE VIEW leaderboard_level AS
SELECT
  id,
  username,
  display_name,
  avatar_image_url,
  level,
  total_xp,
  workout_count,
  created_at,
  ROW_NUMBER() OVER (ORDER BY level DESC, total_xp DESC, created_at ASC) AS rank
FROM profiles
WHERE public_profile = TRUE
  AND show_on_leaderboard = TRUE
  AND level > 0
ORDER BY level DESC, total_xp DESC, created_at ASC;

-- Top users by workout count
CREATE OR REPLACE VIEW leaderboard_workouts AS
SELECT
  id,
  username,
  display_name,
  avatar_image_url,
  workout_count,
  total_xp,
  level,
  created_at,
  ROW_NUMBER() OVER (ORDER BY workout_count DESC, created_at ASC) AS rank
FROM profiles
WHERE public_profile = TRUE
  AND show_on_leaderboard = TRUE
  AND workout_count > 0
ORDER BY workout_count DESC, created_at ASC;

-- ============================================================================
-- 4. HISCORES FUNCTIONS
-- ============================================================================

-- Get top N users for landing page widget
CREATE OR REPLACE FUNCTION get_top_users(
  limit_count INTEGER DEFAULT 5,
  leaderboard_type TEXT DEFAULT 'xp' -- 'xp', 'level', or 'workouts'
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_image_url TEXT,
  total_xp INTEGER,
  level INTEGER,
  workout_count INTEGER,
  rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  CASE leaderboard_type
    WHEN 'xp' THEN
      SELECT * FROM leaderboard_xp LIMIT limit_count;
    WHEN 'level' THEN
      SELECT * FROM leaderboard_level LIMIT limit_count;
    WHEN 'workouts' THEN
      SELECT * FROM leaderboard_workouts LIMIT limit_count;
    ELSE
      SELECT * FROM leaderboard_xp LIMIT limit_count;
  END CASE;
END;
$$;

-- Get user's rank on a specific leaderboard
CREATE OR REPLACE FUNCTION get_user_rank(
  user_id UUID,
  leaderboard_type TEXT DEFAULT 'xp'
)
RETURNS TABLE (
  rank BIGINT,
  total_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_users AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        ORDER BY
          CASE leaderboard_type
            WHEN 'xp' THEN total_xp
            WHEN 'level' THEN level
            WHEN 'workouts' THEN workout_count
          END DESC,
          created_at ASC
      ) AS user_rank
    FROM profiles
    WHERE public_profile = TRUE
      AND show_on_leaderboard = TRUE
      AND (
        (leaderboard_type = 'xp' AND total_xp > 0) OR
        (leaderboard_type = 'level' AND level > 0) OR
        (leaderboard_type = 'workouts' AND workout_count > 0)
      )
  )
  SELECT
    ru.user_rank,
    (SELECT COUNT(*) FROM ranked_users)::BIGINT AS total_users
  FROM ranked_users ru
  WHERE ru.id = user_id;
END;
$$;

-- Get recent activity feed (for landing page)
-- Note: This is a placeholder. In production, you'd query actual workout logs
CREATE OR REPLACE FUNCTION get_recent_activity(
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  username TEXT,
  display_name TEXT,
  avatar_image_url TEXT,
  activity_type TEXT, -- 'level_up', 'workout', 'achievement', 'pr'
  activity_text TEXT,
  xp_earned INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Placeholder: Return sample activity
  -- In production, query actual workout_logs, achievements, etc.
  RETURN QUERY
  SELECT
    p.username,
    p.display_name,
    p.avatar_image_url,
    'level_up'::TEXT AS activity_type,
    'Reached level ' || p.level::TEXT AS activity_text,
    100 AS xp_earned,
    p.updated_at
  FROM profiles p
  WHERE p.public_profile = TRUE
    AND p.show_on_leaderboard = TRUE
  ORDER BY p.updated_at DESC
  LIMIT limit_count;
END;
$$;

-- ============================================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Allow anyone to read public leaderboard data
CREATE POLICY "Public profiles visible to all"
  ON profiles FOR SELECT
  USING (public_profile = TRUE);

-- Allow users to update their own privacy settings
CREATE POLICY "Users can update own privacy"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(total_xp DESC)
  WHERE public_profile = TRUE AND show_on_leaderboard = TRUE;

CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level DESC)
  WHERE public_profile = TRUE AND show_on_leaderboard = TRUE;

CREATE INDEX IF NOT EXISTS idx_profiles_workouts ON profiles(workout_count DESC)
  WHERE public_profile = TRUE AND show_on_leaderboard = TRUE;

-- ============================================================================
-- 7. COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_top_users IS 'Get top N users for leaderboards (public data only)';
COMMENT ON FUNCTION get_user_rank IS 'Get a specific user''s rank on a leaderboard';
COMMENT ON FUNCTION get_recent_activity IS 'Get recent public activity feed for landing page';

COMMENT ON VIEW leaderboard_xp IS 'Leaderboard ranked by total XP';
COMMENT ON VIEW leaderboard_level IS 'Leaderboard ranked by level';
COMMENT ON VIEW leaderboard_workouts IS 'Leaderboard ranked by workout count';
