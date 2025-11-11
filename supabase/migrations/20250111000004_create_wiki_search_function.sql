-- Wiki Search Function: Bilingual full-text search with ranking
-- Searches both English and Dutch content with weighted relevance

CREATE OR REPLACE FUNCTION search_wiki_articles(
  search_query TEXT,
  search_language TEXT DEFAULT 'auto' -- 'auto', 'en', or 'nl'
)
RETURNS TABLE (
  slug TEXT,
  title TEXT,
  category TEXT,
  summary TEXT,
  tags TEXT[],
  evidence_rating TEXT,
  view_count INTEGER,
  rank_en REAL,
  rank_nl REAL,
  combined_rank REAL
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_articles AS (
    SELECT
      a.slug,
      a.title,
      a.category,
      a.summary,
      a.tags,
      a.evidence_rating,
      a.view_count,
      ts_rank(a.search_vector_en, plainto_tsquery('english', search_query)) AS rank_en,
      ts_rank(a.search_vector_nl, plainto_tsquery('dutch', search_query)) AS rank_nl
    FROM wiki_articles a
    WHERE a.is_published = TRUE
      AND (
        a.search_vector_en @@ plainto_tsquery('english', search_query) OR
        a.search_vector_nl @@ plainto_tsquery('dutch', search_query)
      )
  )
  SELECT
    r.slug,
    r.title,
    r.category,
    r.summary,
    r.tags,
    r.evidence_rating,
    r.view_count,
    r.rank_en,
    r.rank_nl,
    CASE
      WHEN search_language = 'en' THEN r.rank_en
      WHEN search_language = 'nl' THEN r.rank_nl
      ELSE GREATEST(r.rank_en, r.rank_nl) -- Auto: use best match
    END AS combined_rank
  FROM ranked_articles r
  ORDER BY combined_rank DESC, r.view_count DESC NULLS LAST
  LIMIT 50; -- Allow pagination support
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION search_wiki_articles(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION search_wiki_articles(TEXT, TEXT) TO authenticated;

-- Function: Get popular articles for "Populair Vandaag" sidebar
-- Returns top 5 articles by today's views, falls back to all-time popular
CREATE OR REPLACE FUNCTION get_popular_today(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  slug TEXT,
  title TEXT,
  category TEXT,
  summary TEXT,
  today_views INTEGER,
  total_views INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.slug,
    a.title,
    a.category,
    a.summary,
    COALESCE(v.view_count, 0) AS today_views,
    a.view_count AS total_views
  FROM wiki_articles a
  LEFT JOIN wiki_article_views v
    ON a.slug = v.article_slug
    AND v.view_date = CURRENT_DATE
  WHERE a.is_published = TRUE
  ORDER BY today_views DESC, total_views DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_popular_today(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_popular_today(INTEGER) TO authenticated;

-- Function: Get articles by category
CREATE OR REPLACE FUNCTION get_articles_by_category(
  article_category TEXT,
  sort_by TEXT DEFAULT 'newest', -- 'newest', 'popular', 'alphabetical'
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  slug TEXT,
  title TEXT,
  category TEXT,
  summary TEXT,
  tags TEXT[],
  evidence_rating TEXT,
  view_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.slug,
    a.title,
    a.category,
    a.summary,
    a.tags,
    a.evidence_rating,
    a.view_count,
    a.created_at,
    a.updated_at
  FROM wiki_articles a
  WHERE a.category = article_category
    AND a.is_published = TRUE
  ORDER BY
    CASE
      WHEN sort_by = 'newest' THEN a.created_at
    END DESC,
    CASE
      WHEN sort_by = 'popular' THEN a.view_count
    END DESC,
    CASE
      WHEN sort_by = 'alphabetical' THEN a.title
    END ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_articles_by_category(TEXT, TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_articles_by_category(TEXT, TEXT, INTEGER) TO authenticated;
