-- Carve Travel: trips, days, activities, accommodations, conversations

-- ============================================
-- TRIPS
-- ============================================
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  total_budget DECIMAL(10, 2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'draft',
  travel_style TEXT,
  accommodation_preference TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT destination_not_empty CHECK (char_length(trim(destination)) > 0),
  CONSTRAINT budget_positive CHECK (total_budget IS NULL OR total_budget > 0),
  CONSTRAINT status_valid CHECK (status IN ('draft', 'planned', 'active', 'completed')),
  CONSTRAINT currency_valid CHECK (char_length(currency) = 3),
  CONSTRAINT dates_valid CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_user_created ON public.trips(user_id, created_at DESC);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trips"
  ON public.trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON public.trips FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON public.trips FOR DELETE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS on_trip_updated ON public.trips;
CREATE TRIGGER on_trip_updated
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- TRIP DAYS
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,

  day_number INTEGER NOT NULL,
  date DATE,
  title TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT day_number_positive CHECK (day_number > 0),
  UNIQUE (trip_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_trip_days_trip_id ON public.trip_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_days_order ON public.trip_days(trip_id, day_number);

ALTER TABLE public.trip_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip days"
  ON public.trip_days FOR SELECT
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trip days"
  ON public.trip_days FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own trip days"
  ON public.trip_days FOR UPDATE
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()))
  WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own trip days"
  ON public.trip_days FOR DELETE
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

-- ============================================
-- TRIP ACTIVITIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID NOT NULL REFERENCES public.trip_days(id) ON DELETE CASCADE,

  time_slot TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  estimated_cost DECIMAL(10, 2),
  cost_category TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT time_slot_valid CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT cost_positive CHECK (estimated_cost IS NULL OR estimated_cost >= 0),
  CONSTRAINT cost_category_valid CHECK (cost_category IS NULL OR cost_category IN ('food', 'activity', 'transport', 'shopping', 'other')),
  CONSTRAINT order_non_negative CHECK (order_index >= 0)
);

CREATE INDEX IF NOT EXISTS idx_trip_activities_day_id ON public.trip_activities(day_id);
CREATE INDEX IF NOT EXISTS idx_trip_activities_order ON public.trip_activities(day_id, order_index);

ALTER TABLE public.trip_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip activities"
  ON public.trip_activities FOR SELECT
  USING (day_id IN (
    SELECT td.id FROM public.trip_days td
    JOIN public.trips t ON td.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own trip activities"
  ON public.trip_activities FOR INSERT
  WITH CHECK (day_id IN (
    SELECT td.id FROM public.trip_days td
    JOIN public.trips t ON td.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own trip activities"
  ON public.trip_activities FOR UPDATE
  USING (day_id IN (
    SELECT td.id FROM public.trip_days td
    JOIN public.trips t ON td.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ))
  WITH CHECK (day_id IN (
    SELECT td.id FROM public.trip_days td
    JOIN public.trips t ON td.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own trip activities"
  ON public.trip_activities FOR DELETE
  USING (day_id IN (
    SELECT td.id FROM public.trip_days td
    JOIN public.trips t ON td.trip_id = t.id
    WHERE t.user_id = auth.uid()
  ));

-- ============================================
-- TRIP ACCOMMODATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  price_per_night DECIMAL(10, 2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  rating DECIMAL(2, 1),
  price_tier TEXT,
  booking_url TEXT,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  distance_to_center TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT acc_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT price_positive CHECK (price_per_night IS NULL OR price_per_night > 0),
  CONSTRAINT rating_valid CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  CONSTRAINT price_tier_valid CHECK (price_tier IS NULL OR price_tier IN ('budget', 'mid-range', 'luxury'))
);

CREATE INDEX IF NOT EXISTS idx_trip_accommodations_trip_id ON public.trip_accommodations(trip_id);

ALTER TABLE public.trip_accommodations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip accommodations"
  ON public.trip_accommodations FOR SELECT
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trip accommodations"
  ON public.trip_accommodations FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own trip accommodations"
  ON public.trip_accommodations FOR UPDATE
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()))
  WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own trip accommodations"
  ON public.trip_accommodations FOR DELETE
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

-- ============================================
-- TRIP CONVERSATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.trip_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,

  role TEXT NOT NULL,
  content TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT role_valid CHECK (role IN ('user', 'assistant')),
  CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_trip_conversations_trip_id ON public.trip_conversations(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_conversations_order ON public.trip_conversations(trip_id, created_at);

ALTER TABLE public.trip_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trip conversations"
  ON public.trip_conversations FOR SELECT
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own trip conversations"
  ON public.trip_conversations FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own trip conversations"
  ON public.trip_conversations FOR DELETE
  USING (trip_id IN (SELECT id FROM public.trips WHERE user_id = auth.uid()));

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE public.trips IS 'Travel plans created by users via AI';
COMMENT ON TABLE public.trip_days IS 'Individual days within a trip plan';
COMMENT ON TABLE public.trip_activities IS 'Activities/events scheduled for each day';
COMMENT ON TABLE public.trip_accommodations IS 'Accommodation suggestions for a trip';
COMMENT ON TABLE public.trip_conversations IS 'Chat history between user and AI for trip planning';
