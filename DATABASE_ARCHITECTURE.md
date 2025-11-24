# Database Architecture - Complete Guide

## Overview

This project uses a **dual-database architecture**:
- **MongoDB**: Primary database for all application data (Projects, Features, Test Cases, Bugs, Users)
- **Supabase (pgvector)**: Vector database exclusively for embeddings storage and semantic search

---

## MongoDB - Application Data

### Purpose
MongoDB stores all structured application data including projects, features, test cases, bugs, and user information.

### Connection
- **File**: `backend/config/database.js`
- **Connection String**: `MONGODB_URI` in `.env`
- **ORM**: Mongoose

### Database Schema

#### 1. Users Collection (`users`)
**File**: `backend/models/User.js`

```javascript
{
  _id: ObjectId,
  name: String (required, 2-50 chars),
  email: String (required, unique, lowercase),
  password: String (required, hashed with bcrypt),
  isVerified: Boolean (default: false),
  lastLogin: Date,
  loginCount: Number (default: 0),
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email` (unique)
- `emailVerificationToken`
- `passwordResetToken`

**Methods**:
- `comparePassword(candidatePassword)` - Compare password with hash
- `generateEmailVerificationToken()` - Generate verification token
- `generatePasswordResetToken()` - Generate reset token

---

#### 2. Projects Collection (`projects`)
**File**: `backend/models/Project.js`

```javascript
{
  _id: ObjectId,
  projectId: String (required, unique), // e.g., "project_abc123"
  name: String (required, max 200 chars),
  description: String (default: ""),
  userId: ObjectId (required, ref: "User", indexed),
  status: String (enum: ["active", "archived", "completed"], default: "active"),
  srsDocument: {
    fileName: String,
    filePath: String,
    uploadedAt: Date,
    processed: Boolean (default: false),
    chunksCount: Number (default: 0)
  },
  vectorCollectionName: String,
  metadata: Map (default: {}),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `userId` + `status` (compound)
- `projectId` (unique)

**Virtuals**:
- `featuresCount` - Count of related features

**Relationships**:
- `userId` → `User._id`
- Referenced by: `Feature.projectId`, `TestCase.projectId`, `Bug.projectId`

---

#### 3. Features Collection (`features`)
**File**: `backend/models/Feature.js`

```javascript
{
  _id: ObjectId,
  featureId: String (required, unique), // e.g., "feature_xyz789"
  name: String (required, max 200 chars),
  description: String (default: ""),
  projectId: ObjectId (required, ref: "Project", indexed),
  priority: String (enum: ["High", "Medium", "Low"], default: "Medium"),
  status: String (enum: ["pending", "in_progress", "completed", "blocked"], default: "pending"),
  isAIGenerated: Boolean (default: false),
  aiGenerationContext: String,
  acceptanceCriteria: [String] (default: []),
  metadata: Map (default: {}),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `projectId` + `status` (compound)
- `featureId` (unique)
- `priority`

**Virtuals**:
- `testCasesCount` - Count of related test cases

**Relationships**:
- `projectId` → `Project._id`
- Referenced by: `TestCase.featureId`, `Bug.featureId`

---

#### 4. Test Cases Collection (`testcases`)
**File**: `backend/models/TestCase.js`

```javascript
{
  _id: ObjectId,
  testCaseId: String (required, unique), // e.g., "test_123456"
  title: String (required, max 300 chars),
  description: String (default: ""),
  featureId: ObjectId (required, ref: "Feature", indexed),
  projectId: ObjectId (required, ref: "Project", indexed),
  steps: [String] (required, min 1),
  expectedResult: String (required),
  priority: String (enum: ["high", "medium", "low"], default: "medium"),
  status: String (enum: ["pending", "in_progress", "passed", "failed", "blocked"], default: "pending"),
  preconditions: [String] (default: []),
  postconditions: [String] (default: []),
  isAIGenerated: Boolean (default: false),
  aiGenerationContext: String,
  testData: Map (default: {}),
  metadata: Map (default: {}),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `featureId` + `status` (compound)
- `projectId`
- `testCaseId` (unique)
- `priority`

**Relationships**:
- `featureId` → `Feature._id`
- `projectId` → `Project._id`
- Referenced by: `Bug.testCaseId`

---

#### 5. Bugs Collection (`bugs`)
**File**: `backend/models/Bug.js`

```javascript
{
  _id: ObjectId,
  bugId: String (required, unique), // e.g., "bug_789abc"
  title: String (required, max 300 chars),
  description: String (required),
  projectId: ObjectId (required, ref: "Project", indexed),
  featureId: ObjectId (ref: "Feature", indexed, optional),
  testCaseId: ObjectId (ref: "TestCase", indexed, optional),
  severity: String (enum: ["critical", "high", "medium", "low"], default: "medium"),
  status: String (enum: ["open", "in_progress", "resolved", "closed", "rejected"], default: "open"),
  priority: String (enum: ["high", "medium", "low"], default: "medium"),
  reportedBy: ObjectId (required, ref: "User", indexed),
  assignedTo: ObjectId (ref: "User", optional),
  stepsToReproduce: [String] (default: []),
  actualResult: String,
  expectedResult: String,
  environment: String,
  attachments: [String] (default: []),
  aiAnalysis: {
    rootCause: String,
    relatedRequirements: [String],
    suggestedFix: String,
    analyzedAt: Date
  },
  metadata: Map (default: {}),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `projectId` + `status` (compound)
- `featureId`
- `bugId` (unique)
- `severity` + `priority` (compound)
- `reportedBy`

**Relationships**:
- `projectId` → `Project._id`
- `featureId` → `Feature._id` (optional)
- `testCaseId` → `TestCase._id` (optional)
- `reportedBy` → `User._id`
- `assignedTo` → `User._id` (optional)

---

### MongoDB Operations

All MongoDB operations are handled through Mongoose models and services:

**Service Files**:
- `backend/services/projectService.js` - Project CRUD operations
- `backend/services/featureService.js` - Feature CRUD operations
- `backend/services/testCaseService.js` - Test case CRUD operations
- `backend/services/bugService.js` - Bug CRUD operations

**Example Usage**:
```javascript
import { Project } from '../models/Project.js';

// Create
const project = new Project({ name: "Test", userId: "..." });
await project.save();

// Read
const project = await Project.findById(id);

// Update
await Project.findByIdAndUpdate(id, { name: "Updated" });

// Delete
await Project.findByIdAndDelete(id);
```

---

## Supabase - Vector Database (pgvector)

### Purpose
Supabase with pgvector extension stores document embeddings for semantic search and RAG (Retrieval Augmented Generation).

### Connection
- **File**: `backend/vector/supabaseVectorDB.js`
- **URL**: `SUPABASE_URL` in `.env`
- **Key**: `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- **Client**: `@supabase/supabase-js`

### Database Schema

#### Table: `project_vectors`

**Migration File**: `supabase_vector_migration.sql`

```sql
CREATE TABLE project_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,              -- MongoDB projectId (string)
  content TEXT NOT NULL,                 -- Document chunk text
  embedding vector(1536),                -- OpenAI ada-002 embedding (1536 dimensions)
  metadata JSONB DEFAULT '{}',           -- Additional metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes**:
- `project_vectors_embedding_idx` - IVFFlat index for vector similarity search
- `idx_project_vectors_project_id` - Index for project filtering
- `idx_project_vectors_created_at` - Index for sorting

**RPC Function**: `match_project_vectors`
- Performs cosine similarity search
- Parameters: `project_id_param`, `query_embedding`, `match_threshold`, `match_count`
- Returns: Similar chunks with similarity scores

---

### Vector Database Operations

**Main Interface**: `backend/vector/vectorDB.js`
**Implementation**: `backend/vector/supabaseVectorDB.js`

#### 1. Store Document Chunks
```javascript
await vectorDB.storeDocumentChunks(
  projectId,        // String from MongoDB (e.g., "project_abc123")
  chunks,           // Array of text strings
  embeddings,       // Array of embedding vectors (1536 dimensions each)
  metadatas         // Array of metadata objects
);
```

**Process**:
1. Receives chunks and embeddings from OpenAI
2. Maps to Supabase records with `project_id`, `content`, `embedding`, `metadata`
3. Inserts into `project_vectors` table
4. Returns success with chunks count

---

#### 2. Search Similar (by Text)
```javascript
const results = await vectorDB.searchSimilar(
  projectId,        // String from MongoDB
  queryText,        // User query text
  nResults          // Number of results (default: 5)
);
```

**Process**:
1. Generates embedding for query text using OpenAI
2. Searches Supabase using RPC function `match_project_vectors`
3. Returns array of similar chunks with metadata and distance scores

**Returns**:
```javascript
[
  {
    document: "chunk text...",
    metadata: { chunkIndex: 0, ... },
    distance: 0.15,  // Lower = more similar
    id: "uuid"
  },
  ...
]
```

---

#### 3. Search by Embedding
```javascript
const results = await vectorDB.searchByEmbedding(
  projectId,        // String from MongoDB
  queryEmbedding,  // Pre-generated embedding vector
  nResults         // Number of results
);
```

**Process**:
1. Uses provided embedding (no OpenAI call needed)
2. Searches Supabase using RPC function
3. Returns similar chunks

---

#### 4. Get Collection Info
```javascript
const info = await vectorDB.getCollectionInfo(projectId);
```

**Returns**:
```javascript
{
  projectId: "project_abc123",
  collectionName: "project_project_abc123",
  chunksCount: 45
}
```

---

#### 5. Delete Collection
```javascript
await vectorDB.deleteCollection(projectId);
```

**Process**:
1. Deletes all rows from `project_vectors` where `project_id = projectId`
2. Used when deleting a project

---

### Data Flow: SRS Upload → Vector Storage

1. **User uploads SRS** → `POST /api/projects/:id/upload-srs`
2. **Backend extracts text** → PDF/TXT parsing
3. **Text chunking** → `textChunker.js` splits into chunks (1000 chars, 200 overlap)
4. **Generate embeddings** → `embeddings.js` calls OpenAI API
5. **Store in Supabase** → `vectorDB.storeDocumentChunks()` saves to `project_vectors`
6. **Update MongoDB** → Project document updated with SRS metadata

---

### Data Flow: RAG Query

1. **User asks question** → `POST /api/ai/query`
2. **Generate query embedding** → OpenAI creates embedding for question
3. **Search Supabase** → `match_project_vectors` RPC function finds similar chunks
4. **Build context** → Top N chunks combined into context string
5. **Generate AI response** → OpenAI Chat API uses context to answer
6. **Return response** → User receives answer

---

## Database Relationships

### MongoDB Relationships (References)

```
User
  └── Projects (userId)
      ├── Features (projectId)
      │   └── Test Cases (featureId)
      ├── Test Cases (projectId)
      └── Bugs (projectId)
          ├── Feature (featureId, optional)
          └── Test Case (testCaseId, optional)
```

### Supabase Relationship

```
project_vectors
  └── project_id (TEXT) → References MongoDB Project.projectId (string)
```

**Note**: Supabase `project_id` is a TEXT field storing MongoDB's `projectId` string, not a foreign key.

---

## Environment Variables

### MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/qbrain
# or
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/qbrain
```

### Supabase
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VECTOR_DB_TYPE=supabase
```

---

## Setup Instructions

### MongoDB Setup

1. **Install MongoDB** (if local):
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 mongo
   
   # Or install locally
   # Follow MongoDB installation guide
   ```

2. **Connection**:
   - Update `MONGODB_URI` in `.env`
   - Connection handled in `backend/config/database.js`

### Supabase Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Get URL and service_role key

2. **Run Migration**:
   - In Supabase Dashboard → SQL Editor
   - Run `supabase_vector_migration.sql`
   - Verify `project_vectors` table created

3. **Configure**:
   - Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env`
   - Set `VECTOR_DB_TYPE=supabase`

---

## Data Storage Summary

| Data Type | Storage | Purpose |
|-----------|---------|---------|
| Users | MongoDB | User accounts and authentication |
| Projects | MongoDB | Project information and metadata |
| Features | MongoDB | Feature definitions and status |
| Test Cases | MongoDB | Test case data and results |
| Bugs | MongoDB | Bug reports and tracking |
| Document Chunks | Supabase | Text chunks from SRS documents |
| Embeddings | Supabase | Vector embeddings (1536 dimensions) |
| Metadata | Both | Project metadata in MongoDB, chunk metadata in Supabase |

---

## Best Practices

### MongoDB
- Use indexes for frequently queried fields
- Use references (ObjectId) for relationships
- Validate data at schema level
- Use transactions for multi-document operations

### Supabase
- Use RPC function for vector search (faster than direct queries)
- IVFFlat index works best with 100+ vectors
- Keep embeddings dimension consistent (1536 for ada-002)
- Use service_role key in backend (bypasses RLS)

---

## Troubleshooting

### MongoDB Issues
- **Connection failed**: Check `MONGODB_URI` format
- **Schema validation error**: Check model definitions
- **Slow queries**: Add indexes for frequently queried fields

### Supabase Issues
- **Table not found**: Run migration SQL
- **Extension error**: Run `CREATE EXTENSION vector;`
- **Permission denied**: Use service_role key, not anon key
- **Slow search**: Ensure IVFFlat index exists and has enough vectors

---

## Files Reference

### MongoDB Models
- `backend/models/User.js`
- `backend/models/Project.js`
- `backend/models/Feature.js`
- `backend/models/TestCase.js`
- `backend/models/Bug.js`

### MongoDB Services
- `backend/services/projectService.js`
- `backend/services/featureService.js`
- `backend/services/testCaseService.js`
- `backend/services/bugService.js`

### Supabase Vector DB
- `backend/vector/vectorDB.js` - Main interface
- `backend/vector/supabaseVectorDB.js` - Implementation
- `supabase_vector_migration.sql` - Database migration

### Configuration
- `backend/config/database.js` - MongoDB connection

