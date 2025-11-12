-- Create user_goals table for nutrition targets
CREATE TABLE IF NOT EXISTS user_goals (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  -- Nutrition goals
  daily_calories INTEGER DEFAULT 2200 CHECK (daily_calories > 0),
  daily_protein_g INTEGER DEFAULT 150 CHECK (daily_protein_g > 0),
  daily_carbs_g INTEGER DEFAULT 220 CHECK (daily_carbs_g > 0),
  daily_fats_g INTEGER DEFAULT 73 CHECK (daily_fats_g > 0),
  daily_water_l DECIMAL DEFAULT 2.5 CHECK (daily_water_l > 0),
  -- Activity goals (optional)
  daily_steps INTEGER DEFAULT 10000 CHECK (daily_steps > 0),
  weekly_workouts INTEGER DEFAULT 4 CHECK (weekly_workouts > 0),
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own goals
CREATE POLICY "Users can view own goals"
  ON user_goals
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own goals
CREATE POLICY "Users can insert own goals"
  ON user_goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own goals
CREATE POLICY "Users can update own goals"
  ON user_goals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create default goals for existing users
INSERT INTO user_goals (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;
