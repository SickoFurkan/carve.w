-- Create daily_steps table for manual step tracking
CREATE TABLE IF NOT EXISTS daily_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  steps INTEGER NOT NULL CHECK (steps >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Add index for user_id and date queries
CREATE INDEX idx_daily_steps_user_date ON daily_steps(user_id, date DESC);

-- Enable RLS
ALTER TABLE daily_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own steps
CREATE POLICY "Users can view own steps"
  ON daily_steps
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own steps
CREATE POLICY "Users can insert own steps"
  ON daily_steps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own steps
CREATE POLICY "Users can update own steps"
  ON daily_steps
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own steps
CREATE POLICY "Users can delete own steps"
  ON daily_steps
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_daily_steps_updated_at
  BEFORE UPDATE ON daily_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
