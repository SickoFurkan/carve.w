-- Create meals table
-- Stores meal logs with nutritional information

CREATE TYPE public.meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Meal details
  meal_type public.meal_type NOT NULL,
  name TEXT,
  notes TEXT,

  -- Nutritional information (all optional)
  calories INTEGER,
  protein DECIMAL(10, 2),
  carbs DECIMAL(10, 2),
  fat DECIMAL(10, 2),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT calories_non_negative CHECK (calories IS NULL OR calories >= 0),
  CONSTRAINT protein_non_negative CHECK (protein IS NULL OR protein >= 0),
  CONSTRAINT carbs_non_negative CHECK (carbs IS NULL OR carbs >= 0),
  CONSTRAINT fat_non_negative CHECK (fat IS NULL OR fat >= 0)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON public.meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_created_at ON public.meals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meals_user_created ON public.meals(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON public.meals(user_id, DATE(created_at));

-- Enable Row Level Security
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view only their own meals
CREATE POLICY "Users can view own meals"
  ON public.meals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own meals
CREATE POLICY "Users can insert own meals"
  ON public.meals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own meals
CREATE POLICY "Users can update own meals"
  ON public.meals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own meals
CREATE POLICY "Users can delete own meals"
  ON public.meals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at on meals
DROP TRIGGER IF EXISTS on_meal_updated ON public.meals;
CREATE TRIGGER on_meal_updated
  BEFORE UPDATE ON public.meals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.meals IS 'Meal logs with nutritional tracking';
COMMENT ON COLUMN public.meals.meal_type IS 'Type of meal: breakfast, lunch, dinner, or snack';
COMMENT ON COLUMN public.meals.name IS 'Optional name/description of the meal';
COMMENT ON COLUMN public.meals.calories IS 'Total calories in the meal';
COMMENT ON COLUMN public.meals.protein IS 'Protein in grams';
COMMENT ON COLUMN public.meals.carbs IS 'Carbohydrates in grams';
COMMENT ON COLUMN public.meals.fat IS 'Fat in grams';
