-- Wiki Article Views: Daily view tracking for "Populair Vandaag"
-- Tracks article views per day for trending articles sidebar

CREATE TABLE wiki_article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL REFERENCES wiki_articles(slug) ON DELETE CASCADE,
  view_date DATE NOT NULL DEFAULT CURRENT_DATE,
  view_count INTEGER DEFAULT 1,

  -- Ensure one row per article per day
  UNIQUE(article_slug, view_date)
);

-- Index for fast queries on recent views
CREATE INDEX idx_wiki_views_date ON wiki_article_views(view_date DESC);
CREATE INDEX idx_wiki_views_slug_date ON wiki_article_views(article_slug, view_date DESC);

-- Row Level Security (RLS)
ALTER TABLE wiki_article_views ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access
CREATE POLICY "Public can view article views"
ON wiki_article_views FOR SELECT
USING (TRUE);

-- Policy: Service role can insert/update (for view tracking API)
CREATE POLICY "Service role full access on views"
ON wiki_article_views FOR ALL
TO service_role
USING (TRUE);

-- Policy: Anonymous users can insert (for view tracking API)
CREATE POLICY "Anonymous users can track views"
ON wiki_article_views FOR INSERT
TO anon
WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can track views"
ON wiki_article_views FOR INSERT
TO authenticated
WITH CHECK (TRUE);

-- Function: Upsert daily view count (for "Populair Vandaag")
-- This increments the view count for today if it exists, or creates a new row
CREATE OR REPLACE FUNCTION upsert_daily_view(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO wiki_article_views (article_slug, view_date, view_count)
  VALUES (article_slug, CURRENT_DATE, 1)
  ON CONFLICT (article_slug, view_date)
  DO UPDATE SET view_count = wiki_article_views.view_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION upsert_daily_view(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION upsert_daily_view(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_daily_view(TEXT) TO service_role;
