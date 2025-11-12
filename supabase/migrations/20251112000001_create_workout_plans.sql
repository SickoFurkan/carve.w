-- Drop existing workout_plans table if it exists (untracked legacy table)
DROP TABLE IF EXISTS public.workout_plans CASCADE;

-- Create or replace the handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create workout_plans table for weekly schedule widget
CREATE TABLE public.workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  workout_type TEXT CHECK (workout_type IN ('strength', 'cardio', 'rest')),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'completed', 'skipped')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Add index for user_id and date queries
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_date ON public.workout_plans(user_id, date DESC);

-- Enable RLS
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view own workout plans
CREATE POLICY "Users can view own workout plans"
  ON public.workout_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own workout plans
CREATE POLICY "Users can insert own workout plans"
  ON public.workout_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own workout plans
CREATE POLICY "Users can update own workout plans"
  ON public.workout_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own workout plans
CREATE POLICY "Users can delete own workout plans"
  ON public.workout_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS on_workout_plans_updated ON public.workout_plans;
CREATE TRIGGER on_workout_plans_updated
  BEFORE UPDATE ON public.workout_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
