-- Migration: Create weekly friend leaderboard function
-- Created: 2025-11-12
-- Description: Function to get weekly XP leaderboard for user and friends

-- Drop old function if exists
DROP FUNCTION IF EXISTS get_weekly_leaderboard(UUID);

-- Function to get friend leaderboard for current week
CREATE OR REPLACE FUNCTION get_weekly_friend_leaderboard(
  requesting_user_id UUID,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  display_name TEXT,
  level INTEGER,
  weekly_xp INTEGER,
  rank INTEGER,
  is_current_user BOOLEAN
) AS $$
DECLARE
  week_start TIMESTAMP := date_trunc('week', CURRENT_TIMESTAMP);
  week_end TIMESTAMP := week_start + INTERVAL '7 days';
BEGIN
  RETURN QUERY
  WITH user_weekly_xp AS (
    SELECT
      u.id AS user_id,
      -- Username: try to get from profiles, otherwise use 'user' + first 8 chars of id
      COALESCE(
        (SELECT p.username FROM profiles p WHERE p.id = u.id),
        'user' || SUBSTRING(u.id::TEXT FROM 1 FOR 8)
      ) AS username,
      -- Display name: use 'Anonymous User' instead of exposing email
      COALESCE(u.display_name, 'Anonymous User') AS display_name,
      -- Level: Calculate as FLOOR(weekly_xp / 100) + 1 (temporary until user_stats exists)
      -- We'll calculate this after getting weekly_xp
      0 AS placeholder_level,
      -- Calculate weekly XP: (completed workouts × 50) + (meals logged × 10)
      (
        COALESCE(
          (SELECT COUNT(*)::INTEGER
           FROM workouts w
           WHERE w.user_id = u.id
           AND w.created_at >= week_start
           AND w.created_at < week_end
          ), 0
        ) * 50 +
        COALESCE(
          (SELECT COUNT(*)::INTEGER
           FROM meals m
           WHERE m.user_id = u.id
           AND m.created_at >= week_start
           AND m.created_at < week_end
          ), 0
        ) * 10
      ) AS weekly_xp,
      (u.id = requesting_user_id) AS is_current_user
    FROM auth.users u
    WHERE u.id = requesting_user_id
    -- TODO: Add friends condition here when friendships are implemented:
    -- OR u.id IN (
    --   SELECT CASE
    --     WHEN f.user_id = requesting_user_id THEN f.friend_id
    --     ELSE f.user_id
    --   END
    --   FROM friendships f
    --   WHERE (f.user_id = requesting_user_id OR f.friend_id = requesting_user_id)
    --   AND f.status = 'accepted'
    -- )
  )
  SELECT
    uwx.user_id,
    uwx.username,
    uwx.display_name,
    (FLOOR(uwx.weekly_xp / 100) + 1)::INTEGER AS level,
    uwx.weekly_xp,
    RANK() OVER (ORDER BY uwx.weekly_xp DESC)::INTEGER AS rank,
    uwx.is_current_user
  FROM user_weekly_xp uwx
  ORDER BY uwx.weekly_xp DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_weekly_friend_leaderboard(UUID, INTEGER) TO authenticated;

-- Add comment to function
COMMENT ON FUNCTION get_weekly_friend_leaderboard(UUID, INTEGER) IS
'Returns weekly XP leaderboard for a user and their friends (top N limited by parameter).
Currently returns only the current user until friendship system is implemented.
XP calculation: (workouts × 50) + (meals × 10) for current week.
Level calculation: FLOOR(weekly_xp / 100) + 1 (temporary until user_stats table exists).
Username: Fetched from profiles table if exists, otherwise generated from user_id.
Display name: Uses display_name or "Anonymous User" instead of exposing email.';
