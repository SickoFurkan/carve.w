-- Create workouts table
-- Stores workout sessions

CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Workout details
  name TEXT NOT NULL,
  notes TEXT,
  duration_minutes INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT duration_positive CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_created_at ON public.workouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_user_created ON public.workouts(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view only their own workouts
CREATE POLICY "Users can view own workouts"
  ON public.workouts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own workouts
CREATE POLICY "Users can insert own workouts"
  ON public.workouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own workouts
CREATE POLICY "Users can update own workouts"
  ON public.workouts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own workouts
CREATE POLICY "Users can delete own workouts"
  ON public.workouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at on workouts
DROP TRIGGER IF EXISTS on_workout_updated ON public.workouts;
CREATE TRIGGER on_workout_updated
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create exercises table
-- Stores individual exercises within a workout

CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,

  -- Exercise details
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL DEFAULT 1,
  reps INTEGER,
  weight DECIMAL(10, 2),
  weight_unit TEXT NOT NULL DEFAULT 'lbs',
  is_pr BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT exercise_name_not_empty CHECK (char_length(trim(exercise_name)) > 0),
  CONSTRAINT sets_positive CHECK (sets > 0),
  CONSTRAINT reps_positive CHECK (reps IS NULL OR reps > 0),
  CONSTRAINT weight_non_negative CHECK (weight IS NULL OR weight >= 0),
  CONSTRAINT weight_unit_valid CHECK (weight_unit IN ('lbs', 'kg')),
  CONSTRAINT order_non_negative CHECK (order_index >= 0)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON public.exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_exercises_order ON public.exercises(workout_id, order_index);
CREATE INDEX IF NOT EXISTS idx_exercises_pr ON public.exercises(is_pr) WHERE is_pr = true;

-- Enable Row Level Security
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view exercises from their own workouts
CREATE POLICY "Users can view own exercises"
  ON public.exercises
  FOR SELECT
  USING (
    workout_id IN (
      SELECT id FROM public.workouts WHERE user_id = auth.uid()
    )
  );

-- Users can insert exercises to their own workouts
CREATE POLICY "Users can insert own exercises"
  ON public.exercises
  FOR INSERT
  WITH CHECK (
    workout_id IN (
      SELECT id FROM public.workouts WHERE user_id = auth.uid()
    )
  );

-- Users can update their own exercises
CREATE POLICY "Users can update own exercises"
  ON public.exercises
  FOR UPDATE
  USING (
    workout_id IN (
      SELECT id FROM public.workouts WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    workout_id IN (
      SELECT id FROM public.workouts WHERE user_id = auth.uid()
    )
  );

-- Users can delete their own exercises
CREATE POLICY "Users can delete own exercises"
  ON public.exercises
  FOR DELETE
  USING (
    workout_id IN (
      SELECT id FROM public.workouts WHERE user_id = auth.uid()
    )
  );

-- Comments for documentation
COMMENT ON TABLE public.workouts IS 'Workout sessions logged by users';
COMMENT ON COLUMN public.workouts.name IS 'Name/title of the workout';
COMMENT ON COLUMN public.workouts.notes IS 'Optional notes about the workout';
COMMENT ON COLUMN public.workouts.duration_minutes IS 'Optional workout duration in minutes';

COMMENT ON TABLE public.exercises IS 'Individual exercises within a workout';
COMMENT ON COLUMN public.exercises.exercise_name IS 'Name of the exercise (e.g., Bench Press, Squat)';
COMMENT ON COLUMN public.exercises.sets IS 'Number of sets performed';
COMMENT ON COLUMN public.exercises.reps IS 'Number of reps per set (optional)';
COMMENT ON COLUMN public.exercises.weight IS 'Weight used (optional)';
COMMENT ON COLUMN public.exercises.weight_unit IS 'Unit of weight (lbs or kg)';
COMMENT ON COLUMN public.exercises.is_pr IS 'Whether this exercise is a personal record';
COMMENT ON COLUMN public.exercises.order_index IS 'Order of exercise in workout (for sorting)';
