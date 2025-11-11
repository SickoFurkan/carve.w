-- Create activity_feed table
-- Stores social activity events for the feed

CREATE TYPE public.activity_type AS ENUM ('workout', 'pr', 'achievement', 'level_up', 'meal');

CREATE TABLE IF NOT EXISTS public.activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Activity details
  activity_type public.activity_type NOT NULL,
  activity_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT activity_data_valid CHECK (jsonb_typeof(activity_data) = 'object')
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user_created ON public.activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON public.activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_public ON public.activity_feed(is_public, created_at DESC) WHERE is_public = true;

-- GIN index on JSONB for flexible querying
CREATE INDEX IF NOT EXISTS idx_activity_data ON public.activity_feed USING GIN (activity_data);

-- Enable Row Level Security
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own activities
CREATE POLICY "Users can view own activities"
  ON public.activity_feed
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view public activities from their friends
CREATE POLICY "Users can view friend public activities"
  ON public.activity_feed
  FOR SELECT
  USING (
    is_public = true
    AND user_id IN (
      SELECT friend_user_id FROM public.get_friend_ids(auth.uid())
    )
  );

-- Users can insert their own activities
CREATE POLICY "Users can insert own activities"
  ON public.activity_feed
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own activities
CREATE POLICY "Users can update own activities"
  ON public.activity_feed
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own activities
CREATE POLICY "Users can delete own activities"
  ON public.activity_feed
  FOR DELETE
  USING (auth.uid() = user_id);

-- Helper function to create activity feed entry
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

-- Helper function to get friend feed (highlights only)
CREATE OR REPLACE FUNCTION public.get_friend_highlights(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  activity_id UUID,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  activity_type public.activity_type,
  activity_data JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
    SELECT
      a.id AS activity_id,
      a.user_id,
      p.username,
      p.display_name,
      p.avatar_url,
      a.activity_type,
      a.activity_data,
      a.created_at
    FROM public.activity_feed a
    JOIN public.profiles p ON a.user_id = p.id
    WHERE a.is_public = true
      AND a.user_id IN (SELECT friend_user_id FROM public.get_friend_ids(p_user_id))
      AND a.activity_type IN ('pr', 'achievement', 'level_up')
    ORDER BY a.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get full friend feed (all activities)
CREATE OR REPLACE FUNCTION public.get_friend_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  activity_id UUID,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  activity_type public.activity_type,
  activity_data JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
    SELECT
      a.id AS activity_id,
      a.user_id,
      p.username,
      p.display_name,
      p.avatar_url,
      a.activity_type,
      a.activity_data,
      a.created_at
    FROM public.activity_feed a
    JOIN public.profiles p ON a.user_id = p.id
    WHERE a.is_public = true
      AND a.user_id IN (SELECT friend_user_id FROM public.get_friend_ids(p_user_id))
    ORDER BY a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.activity_feed IS 'Activity feed entries for social features';
COMMENT ON COLUMN public.activity_feed.activity_type IS 'Type of activity: workout, pr, achievement, level_up, or meal';
COMMENT ON COLUMN public.activity_feed.activity_data IS 'Flexible JSONB data specific to activity type';
COMMENT ON COLUMN public.activity_feed.is_public IS 'Whether activity is visible to friends';
COMMENT ON FUNCTION public.create_activity IS 'Create a new activity feed entry';
COMMENT ON FUNCTION public.get_friend_highlights IS 'Get friend activity highlights (PRs, achievements, level-ups only)';
COMMENT ON FUNCTION public.get_friend_feed IS 'Get full friend activity feed (all activity types)';
