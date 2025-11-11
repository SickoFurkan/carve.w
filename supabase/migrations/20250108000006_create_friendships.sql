-- Create friendships table
-- Manages friend relationships between users

CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted', 'blocked');

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.friendship_status NOT NULL DEFAULT 'pending',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id),
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_accepted ON public.friendships(user_id, friend_id) WHERE status = 'accepted';

-- Enable Row Level Security
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view friendships where they are either user or friend
CREATE POLICY "Users can view own friendships"
  ON public.friendships
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can insert friendships where they are the user
CREATE POLICY "Users can create friend requests"
  ON public.friendships
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update friendships where they are the friend (to accept/decline)
-- or where they are the user (to cancel request)
CREATE POLICY "Users can update friendships"
  ON public.friendships
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can delete friendships where they are involved
CREATE POLICY "Users can delete friendships"
  ON public.friendships
  FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Trigger to update updated_at on friendships
DROP TRIGGER IF EXISTS on_friendship_updated ON public.friendships;
CREATE TRIGGER on_friendship_updated
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Helper function to check if two users are friends
CREATE OR REPLACE FUNCTION public.are_friends(uid1 UUID, uid2 UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((user_id = uid1 AND friend_id = uid2)
           OR (user_id = uid2 AND friend_id = uid1))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get accepted friends for a user
CREATE OR REPLACE FUNCTION public.get_friend_ids(uid UUID)
RETURNS TABLE(friend_user_id UUID) AS $$
BEGIN
  RETURN QUERY
    SELECT friend_id FROM public.friendships
    WHERE user_id = uid AND status = 'accepted'
    UNION
    SELECT user_id FROM public.friendships
    WHERE friend_id = uid AND status = 'accepted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE public.friendships IS 'Friend relationships between users';
COMMENT ON COLUMN public.friendships.user_id IS 'User who initiated the friendship';
COMMENT ON COLUMN public.friendships.friend_id IS 'User who received the friend request';
COMMENT ON COLUMN public.friendships.status IS 'Status: pending (awaiting acceptance), accepted, or blocked';
COMMENT ON FUNCTION public.are_friends IS 'Check if two users are friends (bidirectional)';
COMMENT ON FUNCTION public.get_friend_ids IS 'Get all friend IDs for a user (bidirectional)';
