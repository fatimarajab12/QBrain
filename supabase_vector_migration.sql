-- ============================================================================
-- Supabase Vector Database Migration Script
-- Purpose: Sets up vector database infrastructure for RAG (Retrieval Augmented Generation)
-- Description: Creates tables, indexes, and functions for storing and searching
--              document embeddings using OpenAI's text-embedding-ada-002 (1536 dimensions)
-- ============================================================================

-- Enable pgvector extension
-- This extension adds vector data type and similarity search operators to PostgreSQL
-- Required for storing and querying high-dimensional embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- Table: project_vectors
-- Purpose: Stores document chunks and their embeddings for semantic search
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_vectors (
  -- Unique identifier for each vector record (UUID ensures uniqueness)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Associates vectors with a specific project (used for filtering)
  project_id TEXT NOT NULL,
  
  -- The actual text content of the document chunk (retrieved for RAG context)
  content TEXT NOT NULL,
  
  -- 1536-dimensional embedding vector from OpenAI text-embedding-ada-002
  -- Used for similarity search to find relevant document chunks
  embedding vector(1536) NOT NULL,
  
  -- Flexible JSONB field for storing additional metadata
  -- Can store: source file name, chunk index, document type, etc.
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp when the vector was created (useful for sorting and tracking)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Index: project_vectors_embedding_idx
-- Purpose: Fast similarity search on embeddings using IVFFlat algorithm
-- ============================================================================
-- IVFFlat (Inverted File with Flat compression):
--   - Divides vector space into clusters for approximate nearest neighbor search
--   - Trades some accuracy for significant speed improvement
--   - Suitable for datasets with 100+ vectors
-- vector_cosine_ops: Operator class for cosine distance (good for text embeddings)
-- lists = 100: Number of clusters (rule of thumb: sqrt(total_vectors) / 2)
CREATE INDEX IF NOT EXISTS project_vectors_embedding_idx 
ON project_vectors 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================================================
-- Index: idx_project_vectors_project_id
-- Purpose: Fast filtering by project_id (B-tree index for equality searches)
-- ============================================================================
-- Speeds up queries that filter vectors by project
-- Without this index, filtering would require a full table scan
CREATE INDEX IF NOT EXISTS idx_project_vectors_project_id 
ON project_vectors(project_id);

-- ============================================================================
-- Index: idx_project_vectors_created_at
-- Purpose: Fast sorting by creation date (DESC = newest first)
-- ============================================================================
-- Enables efficient sorting and filtering by date
-- Useful for retrieving recent documents or chronological ordering
CREATE INDEX IF NOT EXISTS idx_project_vectors_created_at 
ON project_vectors(created_at DESC);

-- ============================================================================
-- Function: match_project_vectors
-- Purpose: Reusable function for similarity search with filtering capabilities
-- Parameters:
--   - filter: JSONB object containing filter criteria (e.g., {"projectId": "project_123"})
--   - match_count: Number of similar vectors to return (default: 5)
--   - query_embedding: The 1536-dimensional query vector to search for
-- Returns: Table with id, content, metadata, and similarity score (0-1, higher = more similar)
-- ============================================================================
CREATE OR REPLACE FUNCTION match_project_vectors(
  filter JSONB DEFAULT '{}',                    -- Flexible filter object (can contain projectId)
  match_count INT DEFAULT 5,                    -- Number of results to return
  query_embedding vector(1536) DEFAULT NULL     -- Query vector (1536 dimensions from OpenAI)
)
RETURNS TABLE (
  id UUID,          -- UUID of the matching vector
  content TEXT,     -- Text content of the document chunk
  metadata JSONB,   -- Associated metadata
  similarity FLOAT  -- Similarity score (0-1, where 1 is identical)
)
LANGUAGE plpgsql    -- Written in PostgreSQL procedural language
STABLE              -- Function doesn't modify data (allows query optimization)
AS $$
DECLARE
  -- Variable to store project ID extracted from filter
  project_id_filter TEXT;
BEGIN
  -- Extract projectId from JSONB filter object
  -- filter->>'projectId': Extracts projectId as text from JSON
  -- COALESCE: Returns projectId if present, NULL otherwise
  -- If NULL, function will search across all projects
  project_id_filter := COALESCE(filter->>'projectId', NULL);
  
  -- Return query results as a table
  RETURN QUERY
  SELECT
    pv.id,                                                    -- Vector record ID
    pv.content,                                               -- Document chunk text
    pv.metadata,                                              -- Associated metadata
    -- Calculate similarity score:
    --   <=> : Cosine distance operator (returns 0-2, where 0 = identical)
    --   1 - distance : Converts to similarity (0-1, where 1 = identical)
    --   Higher similarity = more relevant to query
    1 - (pv.embedding <=> query_embedding) AS similarity
  FROM project_vectors pv
  WHERE query_embedding IS NOT NULL                           -- Ensure query embedding is provided
    -- Filter by project if specified:
    --   If project_id_filter is NULL: return vectors from all projects
    --   If specified: only return vectors from that project
    --   pv.metadata->>'projectId': Extract projectId from metadata JSON
    AND (project_id_filter IS NULL OR pv.metadata->>'projectId' = project_id_filter)
  -- Order by cosine distance (ascending = most similar first)
  -- Uses IVFFlat index for fast approximate nearest neighbor search
  ORDER BY pv.embedding <=> query_embedding
  -- Limit results to specified number (top N most similar vectors)
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- Usage Example:
-- ============================================================================
-- SELECT * FROM match_project_vectors(
--   filter => '{"projectId": "project_123"}'::JSONB,
--   match_count => 10,
--   query_embedding => '[0.1, 0.2, ..., 0.9]'::vector(1536)
-- );
-- ============================================================================
