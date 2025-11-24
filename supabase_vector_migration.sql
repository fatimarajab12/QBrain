-- Supabase Vector Database Migration
-- Run this in Supabase SQL Editor to set up pgvector for embeddings storage

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create project_vectors table for storing embeddings
CREATE TABLE IF NOT EXISTS project_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 dimension (1536)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create index for vector similarity search (IVFFlat)
-- Note: This index works best with 100+ vectors
CREATE INDEX IF NOT EXISTS project_vectors_embedding_idx 
ON project_vectors 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. Create index for project_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_project_vectors_project_id 
ON project_vectors(project_id);

-- 5. Create index for created_at (optional, for sorting)
CREATE INDEX IF NOT EXISTS idx_project_vectors_created_at 
ON project_vectors(created_at DESC);

-- 6. Add comment
COMMENT ON TABLE project_vectors IS 'Stores document chunks with embeddings for RAG system. Each project has its own namespace via project_id.';

-- 7. Create RPC function for vector similarity search
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
  WHERE project_vectors.project_id = match_project_vectors.project_id_param
    AND 1 - (project_vectors.embedding <=> query_embedding) > match_threshold
  ORDER BY project_vectors.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 8. Grant necessary permissions (adjust based on your RLS setup)
-- If using RLS, you may want to add policies here
-- For now, we'll rely on Service Role Key in backend (bypasses RLS)

-- 9. Verify extension is enabled
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    RAISE EXCEPTION 'pgvector extension not enabled. Please enable it first.';
  END IF;
END $$;

-- 10. Verify table was created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'project_vectors'
ORDER BY ordinal_position;

