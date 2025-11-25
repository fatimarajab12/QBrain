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

-- 6. RPC function for similarity search
CREATE OR REPLACE FUNCTION match_project_vectors(
  project_id_param TEXT,
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    project_vectors.id,
    project_vectors.content,
    project_vectors.metadata,
    1 - (project_vectors.embedding <=> query_embedding) AS similarity
  FROM project_vectors
  WHERE project_vectors.project_id = project_id_param
    AND 1 - (project_vectors.embedding <=> query_embedding) > match_threshold
  ORDER BY project_vectors.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
