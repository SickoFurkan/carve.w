-- Wiki Citations: Store article sources for credibility
-- Links articles to their peer-reviewed sources and references

CREATE TABLE wiki_citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL REFERENCES wiki_articles(slug) ON DELETE CASCADE,

  -- Citation Details
  citation_number INTEGER NOT NULL, -- Order in article (1, 2, 3...)
  authors TEXT NOT NULL,
  year INTEGER,
  title TEXT NOT NULL,
  publication TEXT NOT NULL, -- Journal, book, website, etc.
  url TEXT, -- Optional link to source

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by article
CREATE INDEX idx_wiki_citations_article ON wiki_citations(article_slug);
CREATE INDEX idx_wiki_citations_number ON wiki_citations(article_slug, citation_number);

-- Row Level Security (RLS)
ALTER TABLE wiki_citations ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access
CREATE POLICY "Public can view citations"
ON wiki_citations FOR SELECT
USING (TRUE);

-- Policy: Service role full access (for sync script)
CREATE POLICY "Service role full access on citations"
ON wiki_citations FOR ALL
TO service_role
USING (TRUE);
