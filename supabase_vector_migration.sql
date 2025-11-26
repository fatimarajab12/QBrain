-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create table project_vectors
CREATE TABLE IF NOT EXISTS project_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Index for similarity search
CREATE INDEX IF NOT EXISTS project_vectors_embedding_idx 
ON project_vectors 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. Index for project_id
CREATE INDEX IF NOT EXISTS idx_project_vectors_project_id 
ON project_vectors(project_id);

-- 5. Index for created_at
CREATE INDEX IF NOT EXISTS idx_project_vectors_created_at 
ON project_vectors(created_at DESC);

-- 6. RPC function for similarity search (LangChain compatible signature)
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
