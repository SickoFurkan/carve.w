-- Wiki Articles Table: Single source of truth for wiki content
-- Stores full markdown content, pre-rendered HTML, and bilingual search vectors

CREATE TABLE wiki_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,

  -- Metadata
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'en', -- 'en' or 'nl'

  -- Content (Single Source of Truth)
  content_markdown TEXT NOT NULL, -- Canonical source (full markdown)
  content_html TEXT, -- Pre-rendered HTML cache (optional)
  search_text TEXT, -- Plain text for search indexing

  -- Search Vectors (Bilingual Full-Text Search)
  search_vector_en TSVECTOR, -- English search vector
  search_vector_nl TSVECTOR, -- Dutch search vector

  -- Evidence & Credibility
  evidence_rating TEXT CHECK (evidence_rating IN ('well-established', 'emerging-research', 'expert-consensus')),
  author TEXT,
  reviewers TEXT[] DEFAULT '{}',
  summary TEXT, -- Brief summary (auto-extracted or manual)

  -- Analytics
  view_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,

  -- Admin Flags
  needs_update BOOLEAN DEFAULT FALSE, -- Flag for outdated content

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_wiki_articles_category ON wiki_articles(category);
CREATE INDEX idx_wiki_articles_published ON wiki_articles(is_published);
CREATE INDEX idx_wiki_articles_view_count ON wiki_articles(view_count DESC);
CREATE INDEX idx_wiki_articles_created ON wiki_articles(created_at DESC);

-- GIN indexes for full-text search (bilingual)
CREATE INDEX idx_wiki_search_en ON wiki_articles USING GIN(search_vector_en);
CREATE INDEX idx_wiki_search_nl ON wiki_articles USING GIN(search_vector_nl);

-- Trigger function to auto-update search vectors on insert/update
CREATE OR REPLACE FUNCTION wiki_update_search_vectors()
RETURNS TRIGGER AS $$
BEGIN
  -- English search vector (weighted: title > summary > tags > content)
  NEW.search_vector_en :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.search_text, '')), 'D');

  -- Dutch search vector (weighted: title > summary > tags > content)
  NEW.search_vector_nl :=
    setweight(to_tsvector('dutch', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('dutch', COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('dutch', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C') ||
    setweight(to_tsvector('dutch', COALESCE(NEW.search_text, '')), 'D');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search vectors on insert/update
CREATE TRIGGER wiki_articles_search_update
BEFORE INSERT OR UPDATE ON wiki_articles
FOR EACH ROW EXECUTE FUNCTION wiki_update_search_vectors();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wiki_articles_updated_at
BEFORE UPDATE ON wiki_articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE wiki_articles ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access for published articles
CREATE POLICY "Public can view published articles"
ON wiki_articles FOR SELECT
USING (is_published = TRUE);

-- Policy: Authenticated users can view all articles (including unpublished)
CREATE POLICY "Authenticated users can view all articles"
ON wiki_articles FOR SELECT
TO authenticated
USING (TRUE);

-- Policy: Service role can do everything (for sync script)
CREATE POLICY "Service role full access"
ON wiki_articles FOR ALL
TO service_role
USING (TRUE);

-- Function: Increment view count (atomic operation)
CREATE OR REPLACE FUNCTION increment_view_count(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE wiki_articles
  SET view_count = view_count + 1
  WHERE slug = article_slug;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anonymous users (for view tracking)
GRANT EXECUTE ON FUNCTION increment_view_count(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION increment_view_count(TEXT) TO authenticated;
