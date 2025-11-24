# Project Structure - QBrain Backend & Frontend

This document lists all the files for the MongoDB + Supabase VectorDB + OpenAI integration.

## Architecture Overview

- **MongoDB**: Primary database for all application data (Projects, Features, Test Cases, Bugs)
- **Supabase pgvector**: Vector database for embeddings storage and semantic search only
- **OpenAI**: AI services for embeddings generation and RAG
## Backend Files

### Models (MongoDB)
- `backend/models/Project.js` - Project model with SRS document tracking
- `backend/models/Feature.js` - Feature model with AI generation tracking
- `backend/models/TestCase.js` - Test case model with steps and expected results
- `backend/models/Bug.js` - Bug model with AI analysis support

### Vector Database (Supabase pgvector)
- `backend/vector/vectorDB.js` - Main vector DB wrapper that routes to Supabase
- `backend/vector/supabaseVectorDB.js` - Supabase pgvector implementation for embeddings storage and search

**Vector DB Methods:**
- `storeDocumentChunks(projectId, chunks, embeddings, metadatas)` - Store chunks with embeddings
- `searchSimilar(projectId, queryText, nResults)` - Semantic search by text
- `searchByEmbedding(projectId, queryEmbedding, nResults)` - Search by embedding vector
- `deleteCollection(projectId)` - Delete all chunks for a project
- `getCollectionInfo(projectId)` - Get collection statistics

### AI Services
- `backend/ai/embeddings.js` - OpenAI embeddings generation (single & batch)
- `backend/ai/textChunker.js` - Text chunking utilities for RAG
- `backend/ai/ragService.js` - RAG service for querying, feature generation, test case generation, bug analysis

### Services (Business Logic)
- `backend/services/projectService.js` - Project CRUD + SRS upload/processing (uses MongoDB + Supabase Vector DB)
- `backend/services/featureService.js` - Feature CRUD + AI generation (uses MongoDB)
- `backend/services/testCaseService.js` - Test case CRUD + AI generation (uses MongoDB)
- `backend/services/bugService.js` - Bug CRUD + AI analysis (uses MongoDB)

### Controllers
- `backend/controllers/projectsController.js` - Project API handlers + file upload
- `backend/controllers/featuresController.js` - Feature API handlers
- `backend/controllers/testCasesController.js` - Test case API handlers
- `backend/controllers/bugsController.js` - Bug API handlers
- `backend/controllers/aiController.js` - AI/RAG query handlers

### Routes
- `backend/routes/projects.routes.js` - Project endpoints
- `backend/routes/features.routes.js` - Feature endpoints
- `backend/routes/testCases.routes.js` - Test case endpoints
- `backend/routes/bugs.routes.js` - Bug endpoints
- `backend/routes/ai.routes.js` - AI/RAG endpoints

### Server Configuration
- `backend/server.js` - Express server with all routes configured

## Frontend Files

### Services (API Clients)
- `vision-qa-suite/src/services/project.service.ts` - Project API service
- `vision-qa-suite/src/services/feature.service.ts` - Feature API service
- `vision-qa-suite/src/services/test-case.service.ts` - Test case API service
- `vision-qa-suite/src/services/ai.service.ts` - AI/RAG API service
- `vision-qa-suite/src/services/api.ts` - API client configured for backend

### React Components
- `vision-qa-suite/src/components/UploadSRS.tsx` - SRS document upload component
- `vision-qa-suite/src/components/AIChat.tsx` - AI chat interface for RAG queries
- `vision-qa-suite/src/components/GenerateFeatures.tsx` - AI feature generation component
- `vision-qa-suite/src/components/GenerateTestCases.tsx` - AI test case generation component

## API Endpoints

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - Get user projects
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/upload-srs` - Upload and process SRS (stores in Supabase Vector DB)
- `GET /api/projects/:id/stats` - Get project statistics

### Features
- `POST /api/features` - Create feature
- `GET /api/features/:id` - Get feature by ID
- `GET /api/features/projects/:projectId/features` - Get project features
- `PUT /api/features/:id` - Update feature
- `DELETE /api/features/:id` - Delete feature
- `POST /api/features/projects/:projectId/generate-features` - Generate features from SRS (uses Supabase Vector DB)
- `POST /api/features/bulk` - Bulk create features

### Test Cases
- `POST /api/test-cases` - Create test case
- `GET /api/test-cases/:id` - Get test case by ID
- `GET /api/test-cases/features/:featureId/test-cases` - Get feature test cases
- `GET /api/test-cases/projects/:projectId/test-cases` - Get project test cases
- `PUT /api/test-cases/:id` - Update test case
- `DELETE /api/test-cases/:id` - Delete test case
- `POST /api/test-cases/features/:featureId/generate-test-cases` - Generate test cases (uses Supabase Vector DB)
- `POST /api/test-cases/bulk` - Bulk create test cases

### Bugs
- `POST /api/bugs` - Create bug
- `GET /api/bugs/:id` - Get bug by ID
- `GET /api/bugs/projects/:projectId/bugs` - Get project bugs
- `PUT /api/bugs/:id` - Update bug
- `DELETE /api/bugs/:id` - Delete bug
- `POST /api/bugs/:id/analyze` - Analyze bug with AI (uses Supabase Vector DB)

### AI/RAG
- `POST /api/ai/query` - Query RAG system (searches Supabase Vector DB)
- `POST /api/ai/context` - Get RAG context (searches Supabase Vector DB)
- `GET /api/ai/vector-info/:projectId` - Get vector collection info from Supabase

## Environment Variables Required

### Backend (.env)
```
# MongoDB (Primary Database)
MONGODB_URI=your_mongodb_connection_string

# Supabase (Vector Database Only)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VECTOR_DB_TYPE=supabase

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Server
PORT=5000
JWT_SECRET=your_jwt_secret
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Setup Instructions

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up Supabase Vector Database**
   ```bash
   # In Supabase Dashboard → SQL Editor
   # Run: supabase_vector_migration.sql
   ```
   This creates:
   - `project_vectors` table
   - pgvector extension
   - Indexes for performance
   - RPC function for similarity search

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env` in backend
   - Add your MongoDB URI, Supabase credentials, OpenAI API key

4. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

5. **Start Frontend**
   ```bash
   cd vision-qa-suite
   npm run dev
   ```

## Database Architecture

### MongoDB (Application Data)
- **projects** - Project information
- **features** - Feature definitions
- **test_cases** - Test case data
- **bugs** - Bug reports

### Supabase (Vector Embeddings Only)
- **project_vectors** - Document chunks with embeddings
  - `id` (UUID)
  - `project_id` (TEXT) - MongoDB projectId
  - `content` (TEXT) - Document chunk text
  - `embedding` (vector(1536)) - OpenAI embedding
  - `metadata` (JSONB) - Additional metadata

## Workflow

1. **Upload SRS**: 
   - User uploads SRS document
   - Backend extracts text → chunks → generates embeddings
   - Stores in **Supabase** `project_vectors` table
   - Updates project metadata in **MongoDB**

2. **Generate Features**: 
   - AI searches **Supabase Vector DB** for relevant chunks
   - Generates features using RAG
   - Saves features to **MongoDB**

3. **Generate Test Cases**: 
   - AI searches **Supabase Vector DB** for context
   - Generates test cases using RAG
   - Saves test cases to **MongoDB**

4. **AI Chat**: 
   - User asks question
   - Backend searches **Supabase Vector DB** for relevant context
   - AI generates answer based on retrieved context

5. **Bug Analysis**: 
   - AI searches **Supabase Vector DB** for related requirements
   - Analyzes bug and finds root cause
   - Updates bug in **MongoDB**

## Notes

- All files use ES modules (import/export)
- **MongoDB**: Used for all application data (projects, features, test cases, bugs)
- **Supabase**: Used ONLY for vector embeddings storage and semantic search
- Auth middleware is commented out - uncomment when ready
- File uploads are stored in `backend/uploads/`
- Vector data is stored in Supabase `project_vectors` table
- Each project has its own namespace via `project_id` (MongoDB projectId string)

## Key Files for Vector Database

- `backend/vector/vectorDB.js` - Main interface (routes to Supabase)
- `backend/vector/supabaseVectorDB.js` - Supabase pgvector implementation
- `supabase_vector_migration.sql` - Database migration script

## Testing Vector Database

```javascript
// Store embeddings
await vectorDB.storeDocumentChunks(
  "project_abc123",
  ["chunk1", "chunk2"],
  [[...embeddings...]],
  [{}]
);

// Search
const results = await vectorDB.searchSimilar(
  "project_abc123",
  "query text",
  5
);

// Get info
const info = await vectorDB.getCollectionInfo("project_abc123");
```
