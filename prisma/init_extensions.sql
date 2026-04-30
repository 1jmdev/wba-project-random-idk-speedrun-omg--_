CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION search_normalize(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT trim(
    regexp_replace(
      lower(unaccent(coalesce(input, ''))),
      '[^a-z0-9]+',
      ' ',
      'g'
    )
  );
$$;

CREATE INDEX IF NOT EXISTS movie_title_en_search_trgm_idx
ON movie
USING gin (search_normalize(title_en) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS movie_title_cz_search_trgm_idx
ON movie
USING gin (search_normalize(title_cz) gin_trgm_ops);