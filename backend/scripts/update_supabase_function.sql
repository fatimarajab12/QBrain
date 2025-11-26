-- Update the match_project_vectors function to match LangChain's expected signature
-- Run this in your Supabase SQL Editor

-- Drop the old function if it exists (with old signature)
DROP FUNCTION IF EXISTS match_project_vectors(TEXT, vector, float, int);

-- Create the new function with LangChain-compatible signature
-- LangChain expects: match_project_vectors(filter, match_count, query_embedding)
CREATE OR REPLACE FUNCTION match_project_vectors(
  filter JSONB DEFAULT '{}',
  match_count INT DEFAULT 5,
  query_embedding vector(1536) DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  project_id_filter TEXT;
BEGIN
  -- Extract projectId from filter JSONB if provided
  project_id_filter := COALESCE(filter->>'projectId', NULL);
  
  RETURN QUERY
  SELECT
    pv.id,
    pv.content,
    pv.metadata,
    1 - (pv.embedding <=> query_embedding) AS similarity
  FROM project_vectors pv
  WHERE query_embedding IS NOT NULL
    AND (project_id_filter IS NULL OR pv.metadata->>'projectId' = project_id_filter)
  ORDER BY pv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION match_project_vectors TO authenticated;
GRANT EXECUTE ON FUNCTION match_project_vectors TO anon;
GRANT EXECUTE ON FUNCTION match_project_vectors TO service_role;

