# Backend & AI Architecture - Complete Guide

## 📋 Overview

This document explains the complete backend architecture including Express.js API, AI services, RAG system, **Chatbot with Orchestration Layer**, and how everything integrates.

**Last Updated**: November 2024  
**Version**: 2.0 (Includes Chatbot Architecture)

### 🎯 Key Features

- ✅ **Express.js REST API** - Full CRUD operations
- ✅ **MongoDB** - Primary database for application data
- ✅ **Supabase pgvector** - Vector database for embeddings
- ✅ **OpenAI Integration** - Embeddings and RAG
- ✅ **Chatbot System** - Intelligent conversation with orchestration
- ✅ **Scoring & Ranking** - Enhanced RAG results
- ✅ **Caching Layer** - Cost reduction and performance
- ✅ **Agent Framework** - LLM agents with tools
- ✅ **Confidence Scoring** - Transparent response quality

### 📚 Quick Navigation

- [Backend Structure](#-backend-structure)
- [Routes Layer](#routes-layer)
- [Controllers Layer](#controllers-layer)
- [Services Layer](#services-layer)
- [AI Services](#ai-services-layer)
- [Chatbot Services](#-chatbot-services-layer--new)
- [Vector Database](#vector-database-integration)
- [Workflows](#complete-workflow-examples)

---

## Backend Structure

### Architecture Layers

```
┌─────────────────────────────────────┐
│         Express Routes              │  (API Endpoints)
├─────────────────────────────────────┤
│         Controllers                 │  (Request Handlers)
├─────────────────────────────────────┤
│    Orchestration Layer (NEW)       │  (Chatbot Management)
├─────────────────────────────────────┤
│         Services                    │  (Business Logic)
├─────────────────────────────────────┤
│    Models (MongoDB) + Vector DB    │  (Data Layer)
├─────────────────────────────────────┤
│         AI Services                 │  (OpenAI + RAG)
├─────────────────────────────────────┤
│    Chatbot Services (NEW)          │  (Scoring, Caching, Agent)
└─────────────────────────────────────┘
```

---

## Express Server

### Main File: `backend/server.js`

**Responsibilities**:
- Initialize Express app
- Configure middleware (CORS, JSON parsing)
- Connect to MongoDB
- Register all routes
- Start HTTP server

**Key Components**:
```javascript
import express from "express";
import connectDB from "./config/database.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
connectDB();

// Routes
app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/features", featuresRouter);
app.use("/api/test-cases", testCasesRouter);
app.use("/api/bugs", bugsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/chat", chatbotRouter);  // NEW: Chatbot routes
```

---

## Routes Layer

### Route Files

#### 1. Projects Routes (`backend/routes/projects.routes.js`)
```javascript
POST   /api/projects                    - Create project
GET    /api/projects                    - Get user projects
GET    /api/projects/:id                - Get project by ID
PUT    /api/projects/:id                - Update project
DELETE /api/projects/:id                - Delete project
POST   /api/projects/:id/upload-srs     - Upload SRS document
GET    /api/projects/:id/stats          - Get project statistics
```

#### 2. Features Routes (`backend/routes/features.routes.js`)
```javascript
POST   /api/features                                    - Create feature
GET    /api/features/:id                                - Get feature by ID
GET    /api/features/projects/:projectId/features       - Get project features
PUT    /api/features/:id                                - Update feature
DELETE /api/features/:id                                - Delete feature
POST   /api/features/projects/:projectId/generate-features - Generate features (AI)
POST   /api/features/bulk                               - Bulk create features
```

#### 3. Test Cases Routes (`backend/routes/testCases.routes.js`)
```javascript
POST   /api/test-cases                                    - Create test case
GET    /api/test-cases/:id                                - Get test case by ID
GET    /api/test-cases/features/:featureId/test-cases     - Get feature test cases
GET    /api/test-cases/projects/:projectId/test-cases    - Get project test cases
PUT    /api/test-cases/:id                                - Update test case
DELETE /api/test-cases/:id                                - Delete test case
POST   /api/test-cases/features/:featureId/generate-test-cases - Generate test cases (AI)
POST   /api/test-cases/bulk                               - Bulk create test cases
```

#### 4. Bugs Routes (`backend/routes/bugs.routes.js`)
```javascript
POST   /api/bugs                        - Create bug
GET    /api/bugs/:id                    - Get bug by ID
GET    /api/bugs/projects/:projectId/bugs - Get project bugs
PUT    /api/bugs/:id                    - Update bug
DELETE /api/bugs/:id                    - Delete bug
POST   /api/bugs/:id/analyze            - Analyze bug with AI
```

#### 5. AI Routes (`backend/routes/ai.routes.js`)
```javascript
POST   /api/ai/query                    - Query RAG system
POST   /api/ai/context                  - Get RAG context
GET    /api/ai/vector-info/:projectId   - Get vector collection info
```

#### 6. Chatbot Routes (`backend/routes/chatbot.routes.js`) ⭐ NEW
```javascript
POST   /api/chat/message                - Send message to chatbot
GET    /api/chat/conversation/:id       - Get conversation history
DELETE /api/chat/conversation/:id       - Delete conversation
GET    /api/chat/cache/stats            - Get cache statistics
```

---

## Controllers Layer

### Controller Files

#### 1. Projects Controller (`backend/controllers/projectsController.js`)

**Functions**:
- `createProject(req, res)` - Create new project
- `getProject(req, res)` - Get project by ID
- `getUserProjects(req, res)` - Get all user projects
- `updateProject(req, res)` - Update project
- `deleteProject(req, res)` - Delete project
- `uploadSRS(req, res)` - Handle SRS file upload
- `getProjectStats(req, res)` - Get project statistics

**File Upload**:
- Uses `multer` middleware
- Stores files in `backend/uploads/`
- Supports PDF and TXT files
- Max file size: 10MB

---

#### 2. Features Controller (`backend/controllers/featuresController.js`)

**Functions**:
- `createFeature(req, res)` - Create feature
- `getFeature(req, res)` - Get feature by ID
- `getProjectFeatures(req, res)` - Get all features for project
- `updateFeature(req, res)` - Update feature
- `deleteFeature(req, res)` - Delete feature
- `generateFeatures(req, res)` - Generate features using AI
- `bulkCreateFeatures(req, res)` - Bulk create features

---

#### 3. Test Cases Controller (`backend/controllers/testCasesController.js`)

**Functions**:
- `createTestCase(req, res)` - Create test case
- `getTestCase(req, res)` - Get test case by ID
- `getFeatureTestCases(req, res)` - Get test cases for feature
- `getProjectTestCases(req, res)` - Get test cases for project
- `updateTestCase(req, res)` - Update test case
- `deleteTestCase(req, res)` - Delete test case
- `generateTestCases(req, res)` - Generate test cases using AI
- `bulkCreateTestCases(req, res)` - Bulk create test cases

---

#### 4. Bugs Controller (`backend/controllers/bugsController.js`)

**Functions**:
- `createBug(req, res)` - Create bug
- `getBug(req, res)` - Get bug by ID
- `getProjectBugs(req, res)` - Get bugs for project
- `updateBug(req, res)` - Update bug
- `deleteBug(req, res)` - Delete bug
- `analyzeBug(req, res)` - Analyze bug using AI

---

#### 5. AI Controller (`backend/controllers/aiController.js`)

**Functions**:
- `queryAI(req, res)` - Query RAG system with question
- `getContext(req, res)` - Get RAG context without generating response
- `getVectorInfo(req, res)` - Get vector collection information

---

#### 6. Chatbot Controller (`backend/controllers/chatbotController.js`) ⭐ NEW

**Functions**:
- `sendMessage(req, res)` - Process chatbot message with orchestration
- `getConversation(req, res)` - Get conversation history
- `deleteConversation(req, res)` - Delete conversation
- `getCacheStats(req, res)` - Get caching statistics

**Features**:
- Intent detection
- Confidence scoring
- Caching support
- Conversation memory

---

## Services Layer

### Service Files

#### 1. Project Service (`backend/services/projectService.js`)

**Dependencies**:
- `Project` model (MongoDB)
- `vectorDB` (Supabase)
- `generateEmbeddingsBatch` (OpenAI)
- `smartChunkText` (Text chunking)
- `pdf-parse` (PDF extraction)

**Key Functions**:

**`createProject(projectData)`**
- Creates project in MongoDB
- Generates unique `projectId` using nanoid
- Returns created project

**`getProjectById(projectId)`**
- Finds project by MongoDB `_id` or `projectId` string
- Populates user information
- Returns project object

**`getUserProjects(userId)`**
- Finds all projects for a user
- Sorted by creation date (newest first)
- Returns array of projects

**`updateProject(projectId, updateData)`**
- Updates project fields
- Validates data
- Returns updated project

**`deleteProject(projectId)`**
- Deletes project from MongoDB
- Deletes associated vector collection from Supabase
- Returns success status

**`uploadAndProcessSRS(projectId, filePath, fileName)`**
- Extracts text from PDF/TXT file
- Chunks text using `smartChunkText()` (1000 chars, 200 overlap)
- Generates embeddings using `generateEmbeddingsBatch()`
- Stores chunks and embeddings in Supabase via `vectorDB.storeDocumentChunks()`
- Updates project document with SRS metadata
- Returns processing result

**`getProjectStats(projectId)`**
- Counts features, test cases, bugs
- Gets vector collection info from Supabase
- Returns statistics object

---

#### 2. Feature Service (`backend/services/featureService.js`)

**Dependencies**:
- `Feature` model (MongoDB)
- `generateFeaturesFromRAG` (AI service)

**Key Functions**:

**`createFeature(featureData)`**
- Creates feature in MongoDB
- Generates unique `featureId`
- Returns created feature

**`getFeatureById(featureId)`**
- Finds feature by ID
- Populates project information
- Returns feature object

**`getProjectFeatures(projectId)`**
- Finds all features for a project
- Sorted by priority and creation date
- Returns array of features

**`updateFeature(featureId, updateData)`**
- Updates feature fields
- Returns updated feature

**`deleteFeature(featureId)`**
- Deletes feature
- Deletes associated test cases
- Returns success status

**`generateFeaturesFromSRS(projectId, options)`**
- Verifies SRS is processed
- Calls `generateFeaturesFromRAG()` from AI service
- Saves generated features to MongoDB
- Marks features as AI-generated
- Returns array of created features

**`bulkCreateFeatures(projectId, featuresData)`**
- Creates multiple features at once
- Returns array of created features

---

#### 3. Test Case Service (`backend/services/testCaseService.js`)

**Dependencies**:
- `TestCase` model (MongoDB)
- `generateTestCasesFromRAG` (AI service)

**Key Functions**:

**`createTestCase(testCaseData)`**
- Creates test case in MongoDB
- Generates unique `testCaseId`
- Validates steps array
- Returns created test case

**`getTestCaseById(testCaseId)`**
- Finds test case by ID
- Populates feature and project information
- Returns test case object

**`getFeatureTestCases(featureId)`**
- Finds all test cases for a feature
- Sorted by priority and creation date
- Returns array of test cases

**`getProjectTestCases(projectId)`**
- Finds all test cases for a project
- Returns array of test cases

**`updateTestCase(testCaseId, updateData)`**
- Updates test case fields
- Returns updated test case

**`deleteTestCase(testCaseId)`**
- Deletes test case
- Returns success status

**`generateTestCasesForFeature(featureId, options)`**
- Gets feature information
- Verifies SRS is processed
- Builds feature description for context
- Calls `generateTestCasesFromRAG()` from AI service
- Saves generated test cases to MongoDB
- Returns array of created test cases

**`bulkCreateTestCases(featureId, testCasesData)`**
- Creates multiple test cases at once
- Returns array of created test cases

---

#### 4. Bug Service (`backend/services/bugService.js`)

**Dependencies**:
- `Bug` model (MongoDB)
- `analyzeBugWithRAG` (AI service)

**Key Functions**:

**`createBug(bugData)`**
- Creates bug in MongoDB
- Generates unique `bugId`
- Sets `reportedBy` from auth
- Returns created bug

**`getBugById(bugId)`**
- Finds bug by ID
- Populates project, feature, test case, users
- Returns bug object

**`getProjectBugs(projectId, filters)`**
- Finds bugs for project
- Supports filtering by status, severity, featureId
- Returns array of bugs

**`updateBug(bugId, updateData)`**
- Updates bug fields
- Returns updated bug

**`deleteBug(bugId)`**
- Deletes bug
- Returns success status

**`analyzeBug(bugId)`**
- Gets bug information
- Verifies SRS is processed
- Builds bug description
- Calls `analyzeBugWithRAG()` from AI service
- Updates bug with AI analysis
- Returns updated bug

---

## AI Services Layer

### AI Service Files

#### 1. Embeddings Service (`backend/ai/embeddings.js`)

**Purpose**: Generate embeddings using OpenAI API

**Dependencies**:
- `openai` package
- `OPENAI_API_KEY` environment variable

**Functions**:

**`generateEmbedding(text, model = "text-embedding-ada-002")`**
- Generates embedding for single text
- Uses OpenAI `embeddings.create()` API
- Returns array of 1536 numbers (embedding vector)
- Model: `text-embedding-ada-002` (default)

**`generateEmbeddingsBatch(texts, model = "text-embedding-ada-002")`**
- Generates embeddings for multiple texts
- More efficient than calling single embedding multiple times
- Returns array of embedding vectors
- Filters out empty texts

**`getEmbeddingDimensions(model)`**
- Returns dimension count for embedding model
- `text-embedding-ada-002`: 1536
- `text-embedding-3-small`: 1536
- `text-embedding-3-large`: 3072

**Usage Example**:
```javascript
import { generateEmbedding, generateEmbeddingsBatch } from './ai/embeddings.js';

// Single embedding
const embedding = await generateEmbedding("Hello world");

// Batch embeddings
const embeddings = await generateEmbeddingsBatch(["Text 1", "Text 2"]);
```

---

#### 2. Text Chunker Service (`backend/ai/textChunker.js`)

**Purpose**: Split large documents into smaller chunks for embedding

**Functions**:

**`splitTextIntoChunks(text, chunkSize = 1000, overlap = 200)`**
- Splits text into chunks with overlap
- Tries to break at sentence boundaries
- Returns array of text chunks
- Filters out empty chunks

**`splitTextByParagraphs(text, maxChunkSize = 1000)`**
- Splits text by paragraphs (double newlines)
- Combines paragraphs until max size
- Returns array of chunks

**`splitTextBySentences(text, maxChunkSize = 1000)`**
- Splits text by sentences (periods, exclamation, question marks)
- Combines sentences until max size
- Returns array of chunks

**`smartChunkText(text, chunkSize = 1000, overlap = 200)`**
- Smart chunking that preserves structure
- First tries paragraph-based chunking
- If chunks too large, splits by sentences
- Applies overlap if needed
- Returns array of chunks

**Usage Example**:
```javascript
import { smartChunkText } from './ai/textChunker.js';

const chunks = smartChunkText(largeText, 1000, 200);
// Returns: ["chunk 1...", "chunk 2...", ...]
```

---

#### 3. RAG Service (`backend/ai/ragService.js`)

**Purpose**: Retrieval Augmented Generation - Search vector DB and generate AI responses

**Dependencies**:
- `vectorDB` (Supabase)
- `generateEmbedding` (OpenAI)
- `openai` (Chat API)

**Functions**:

**`queryRAG(projectId, question, nResults = 5)`**
- Main RAG query function
- **Step 1**: Searches Supabase Vector DB for similar chunks
- **Step 2**: Builds context from retrieved chunks
- **Step 3**: Sends context + question to OpenAI Chat API
- **Step 4**: Returns AI-generated response
- Returns: String (AI response)

**`getRAGContext(projectId, query, nResults = 5)`**
- Gets context chunks without generating response
- Searches vector DB
- Returns formatted context array
- Returns: Array of context objects with text, metadata, relevance

**`generateFeaturesFromRAG(projectId, options = {})`**
- Generates features from SRS using RAG
- **Step 1**: Searches vector DB for requirements-related chunks
- **Step 2**: Builds context from chunks
- **Step 3**: Sends context to OpenAI with feature generation prompt
- **Step 4**: Parses JSON response
- **Step 5**: Returns array of feature objects
- Returns: Array of feature objects

**`generateTestCasesFromRAG(projectId, featureDescription, options = {})`**
- Generates test cases for a feature using RAG
- **Step 1**: Searches vector DB for relevant requirements
- **Step 2**: Builds context from chunks
- **Step 3**: Sends feature description + context to OpenAI
- **Step 4**: Parses JSON response
- **Step 5**: Returns array of test case objects
- Returns: Array of test case objects

**`analyzeBugWithRAG(projectId, bugDescription)`**
- Analyzes bug and finds related requirements
- **Step 1**: Searches vector DB for related chunks
- **Step 2**: Builds context
- **Step 3**: Sends bug description + context to OpenAI
- **Step 4**: Parses analysis response
- Returns: Object with rootCause, relatedRequirements, suggestedFix

**Usage Example**:
```javascript
import { queryRAG, generateFeaturesFromRAG } from './ai/ragService.js';

// Query RAG
const answer = await queryRAG("project_123", "What are the payment requirements?", 5);

// Generate features
const features = await generateFeaturesFromRAG("project_123", { nContextChunks: 10 });
```

---

## 🤖 Chatbot Services Layer ⭐ NEW

### Chatbot Service Files

The chatbot system includes multiple layers for intelligent conversation management:

#### 1. Orchestration Service (`backend/services/chatbot/orchestrationService.js`)

**Purpose**: Central coordinator for chatbot interactions

**Responsibilities**:
- Intent detection and routing
- Service selection (RAG, LLM, Agent)
- Conversation memory management
- Failover logic

**Key Functions**:

**`processMessage(projectId, message, conversationId)`**
- Main entry point for chatbot messages
- Detects intent using `intentService`
- Routes to appropriate handler
- Saves to conversation memory

**`handleQuestion(projectId, message, conversationHistory, intent)`**
- Processes questions about the project
- Uses RAG orchestrator for context retrieval
- Uses LLM orchestrator for answer generation
- Includes failover to general LLM if RAG fails

**`handleCreateFeature(projectId, message, conversationHistory, intent)`**
- Creates features from user stories
- Uses Agent Service if available
- Falls back to RAG + LLM

**`handleCreateTestCases(projectId, message, conversationHistory, intent)`**
- Creates test cases for features
- Uses Agent Service or RAG + LLM

**Intent Types**:
- `QUESTION` - Questions about project
- `CREATE_FEATURE` - Create new feature
- `CREATE_TEST_CASES` - Create test cases
- `UPDATE_FEATURE` - Update feature
- `LOOKUP_FEATURE` - Find feature
- `LOOKUP_TEST_CASE` - Find test case
- `GENERAL_CHAT` - General conversation

---

#### 2. Intent Service (`backend/services/chatbot/intentService.js`)

**Purpose**: Detect user intent from messages

**Functions**:

**`detectIntent(message)`**
- Quick keyword-based detection (fast, cheap)
- LLM-based detection for complex cases
- Returns intent type, confidence, and extracted data

**Detection Methods**:
- Keyword matching (fast)
- LLM classification (accurate)

**Extracted Data**:
- User stories
- Feature names/IDs
- Test case titles

---

#### 3. RAG Orchestrator (`backend/services/chatbot/ragOrchestrator.js`)

**Purpose**: Enhanced RAG search with scoring and ranking

**Functions**:

**`search(projectId, query, options)`**
- Performs similarity search
- Applies scoring and ranking
- Filters by minimum score
- Caches results
- Returns context, sources, and confidence

**Options**:
- `nResults` - Number of results (default: 5)
- `sourcePriority` - Priority array (e.g., ["Feature", "TestCase", "SRS"])
- `metadataFilter` - Filter by metadata
- `minScore` - Minimum score threshold (default: 0.3)
- `useCache` - Enable caching (default: true)

---

#### 4. LLM Orchestrator (`backend/services/chatbot/llmOrchestrator.js`)

**Purpose**: Manages LLM interactions for chatbot

**Functions**:

**`generateAnswer({ question, context, conversationHistory, sources })`**
- Generates answers to questions
- Uses conversation history for context
- Calculates confidence score
- Returns answer with confidence

**`generateFeature({ userStory, context, existingFeatures })`**
- Generates feature from user story
- Uses lower temperature (0.3) for JSON generation
- Returns feature object and response

**`generateTestCases({ featureDescription, context, existingTestCases })`**
- Generates test cases for feature
- Returns array of test cases

**`generateGeneralResponse({ message, conversationHistory })`**
- Handles general chat
- Returns friendly response

---

#### 5. Scoring Service (`backend/services/chatbot/scoringService.js`)

**Purpose**: Score and rank RAG results

**Scoring Factors**:
- **Semantic Score** (40%) - Vector similarity
- **Source Priority** (25%) - Feature > TestCase > SRS
- **Recency Score** (15%) - Newer documents = higher score
- **Metadata Match** (20%) - Filter matching

**Source Priorities**:
- Feature: 1.0 (highest)
- TestCase: 0.8
- SRS: 0.6
- Bug: 0.4
- Other: 0.2

**Functions**:
- `calculateTotalScore()` - Calculate weighted score
- `rankDocuments()` - Sort by score
- `filterByThreshold()` - Filter low scores
- `calculateConfidence()` - Calculate result confidence

---

#### 6. Caching Service (`backend/services/chatbot/cachingService.js`)

**Purpose**: Reduce costs with intelligent caching

**Cache Types**:
- **Question Cache** (TTL: 1 hour) - User questions and answers
- **RAG Cache** (TTL: 30 min) - RAG search results
- **Feature Cache** (TTL: 2 hours) - Feature data
- **TestCase Cache** (TTL: 2 hours) - Test case data
- **Embedding Cache** (TTL: 24 hours) - Expensive embeddings

**Benefits**:
- 100% cost reduction for repeated queries
- Faster response times
- Reduced load on Vector DB

**Functions**:
- `getCachedAnswer()` / `cacheAnswer()`
- `getCachedRAG()` / `cacheRAG()`
- `getCachedFeature()` / `cacheFeature()`
- `invalidateFeature()` - Clear cache on update
- `clearProjectCache()` - Clear all project caches

---

#### 7. Conversation Memory (`backend/services/chatbot/conversationMemory.js`)

**Purpose**: Store conversation history for context

**Functions**:
- `getHistory(conversationId)` - Get conversation history
- `addMessage(conversationId, message)` - Add message
- `clearHistory(conversationId)` - Delete conversation

**Storage**:
- In-memory (NodeCache)
- TTL: 24 hours
- Max 20 messages per conversation

---

#### 8. Agent Service (`backend/services/agent/agentService.js`)

**Purpose**: LLM Agent Framework with Tools

**Tools Available**:
1. **searchVectorDB** - Search project knowledge base
2. **createFeature** - Create new feature
3. **createTestCase** - Create test case
4. **updateFeature** - Update feature
5. **lookupFeature** - Get feature details
6. **lookupTestCase** - Get test case details

**Functions**:
- `initialize()` - Initialize agent with tools
- `executeTool(toolName, params)` - Execute tool directly
- `isAvailable()` - Check if agent is ready

**Note**: Currently uses simplified tool execution. Full agent framework can be integrated later.

---

## Vector Database Integration

### Vector Store Files

#### 1. Vector Store (`backend/vector/vectorStore.js`) ⭐ UPDATED

**Purpose**: Main interface for vector operations using Supabase pgvector

**Dependencies**:
- `@supabase/supabase-js`
- `@langchain/community` (for SupabaseVectorStore)
- `generateEmbedding` (for text-to-embedding conversion)

**Key Functions**:

**`addDocuments(projectId, documents, embeddings)`**
- Adds documents with embeddings to Supabase
- Stores in `project_vectors` table
- Handles metadata JSONB

**`similaritySearch(projectId, query, k = 5)`**
- Searches for similar documents using cosine similarity
- Uses LangChain's SupabaseVectorStore
- Returns documents with scores

**`getRetriever(projectId, k = 5)`**
- Creates LangChain retriever for RAG
- Filters by projectId
- Returns retriever interface

**`upsertDocument(projectId, document, embedding, metadataFilter)`**
- Updates or inserts document
- Deletes old versions before inserting new one
- Ensures no duplicates

**`deleteDocumentsByMetadata(projectId, metadataFilter)`**
- Deletes documents matching metadata filter
- Used for updating features/test cases

**`deleteProject(projectId)`**
- Deletes all vectors for a project
- Used when deleting project

**`getProjectInfo(projectId)`**
- Gets vector count for project
- Returns project statistics

**Key Features**:
- ✅ Automatic embedding generation
- ✅ Metadata filtering
- ✅ Update/delete operations
- ✅ LangChain integration

---

## Complete Workflow Examples

### Workflow 1: Upload SRS and Generate Features

```
1. User uploads SRS
   → POST /api/projects/:id/upload-srs
   → projectsController.uploadSRS()

2. Controller calls service
   → projectService.uploadAndProcessSRS()

3. Service processes file
   → Extract text (pdf-parse)
   → Chunk text (smartChunkText)
   → Generate embeddings (generateEmbeddingsBatch)
   → Store in Supabase (vectorDB.storeDocumentChunks)
   → Update MongoDB project

4. User generates features
   → POST /api/features/projects/:id/generate-features
   → featuresController.generateFeatures()

5. Controller calls service
   → featureService.generateFeaturesFromSRS()

6. Service uses AI
   → ragService.generateFeaturesFromRAG()
   → Searches Supabase Vector DB
   → Generates features with OpenAI
   → Saves to MongoDB
```

---

### Workflow 2: AI Chat Query

```
1. User asks question
   → POST /api/ai/query
   → aiController.queryAI()

2. Controller calls RAG service
   → ragService.queryRAG()

3. RAG service:
   → Searches Supabase (vectorDB.searchSimilar)
   → Builds context from chunks
   → Sends to OpenAI Chat API
   → Returns answer

4. Controller returns response
   → JSON with question and answer
```

---

### Workflow 3: Generate Test Cases

```
1. User selects feature
   → POST /api/test-cases/features/:id/generate-test-cases
   → testCasesController.generateTestCases()

2. Controller calls service
   → testCaseService.generateTestCasesForFeature()

3. Service uses AI
   → ragService.generateTestCasesFromRAG()
   → Gets feature description
   → Searches Supabase for context
   → Generates test cases with OpenAI
   → Saves to MongoDB
```

---

### Workflow 4: Chatbot Message ⭐ NEW

```
1. User sends message
   → POST /api/chat/message
   → chatbotController.sendMessage()

2. Check cache
   → cachingService.getCachedAnswer()
   → If found, return cached response

3. Orchestration Service
   → orchestrationService.processMessage()
   → intentService.detectIntent()
   → conversationMemory.getHistory()

4. RAG Orchestrator (if question)
   → ragOrchestrator.search()
   → scoringService.rankDocuments()
   → cachingService.cacheRAG()

5. LLM Orchestrator
   → llmOrchestrator.generateAnswer()
   → Calculates confidence

6. Save to memory
   → conversationMemory.addMessage()
   → cachingService.cacheAnswer()

7. Return response
   → JSON with answer, confidence, sourcesUsed
```

---

### Workflow 5: Create Feature via Chatbot ⭐ NEW

```
1. User: "As a user, I want to export test cases"
   → POST /api/chat/message
   → Intent: CREATE_FEATURE

2. Orchestration Service
   → handleCreateFeature()
   → Extracts user story

3. Agent Service (if available)
   → agentService.executeTool("createFeature")
   → Creates feature in MongoDB + Vector DB

4. Or RAG + LLM
   → ragOrchestrator.search() (finds similar features)
   → llmOrchestrator.generateFeature()
   → featureService.createFeature()

5. Return response
   → Feature created with confidence score
```

---

## Environment Variables

### Required Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/qbrain

# Supabase (Vector DB)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
VECTOR_DB_TYPE=supabase

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Server
PORT=5000
JWT_SECRET=your_secret_key
```

---

## File Structure Summary

```
backend/
├── server.js                    # Express server entry point
├── config/
│   └── database.js              # MongoDB connection
├── routes/                      # API route definitions
│   ├── projects.routes.js
│   ├── features.routes.js
│   ├── testCases.routes.js
│   ├── bugs.routes.js
│   ├── ai.routes.js
│   └── chatbot.routes.js       # ⭐ NEW: Chatbot routes
├── controllers/                 # Request handlers
│   ├── projectsController.js
│   ├── featuresController.js
│   ├── testCasesController.js
│   ├── bugsController.js
│   ├── aiController.js
│   └── chatbotController.js    # ⭐ NEW: Chatbot controller
├── services/                    # Business logic
│   ├── projectService.js
│   ├── featureService.js
│   ├── testCaseService.js
│   ├── bugService.js
│   ├── chatbot/                 # ⭐ NEW: Chatbot services
│   │   ├── orchestrationService.js
│   │   ├── intentService.js
│   │   ├── ragOrchestrator.js
│   │   ├── llmOrchestrator.js
│   │   ├── scoringService.js
│   │   ├── cachingService.js
│   │   └── conversationMemory.js
│   └── agent/                   # ⭐ NEW: Agent framework
│       └── agentService.js
├── models/                      # MongoDB models
│   ├── User.js
│   ├── Project.js
│   ├── Feature.js
│   ├── TestCase.js
│   └── Bug.js
├── ai/                          # AI services
│   ├── embeddings.js           # OpenAI embeddings
│   ├── textChunker.js          # Text chunking
│   └── ragService.js           # RAG system
├── vector/                      # Vector database
│   └── vectorStore.js          # ⭐ UPDATED: Supabase pgvector
└── middleware/                  # Middleware
    ├── auth.middleware.js      # ⭐ UPDATED: Authentication
    └── validation.middleware.js
```

---

## Key Design Patterns

### 1. Service Layer Pattern
- Controllers handle HTTP requests/responses
- Services contain business logic
- Models handle data persistence

### 2. Dependency Injection
- Services import models and other services
- Easy to test and mock

### 3. Singleton Pattern
- `vectorStore` is a singleton instance
- `cachingService` is a singleton instance
- `agentService` is a singleton instance

### 4. RAG Pattern
- Retrieve: Search vector DB for relevant context
- Augment: Add context to prompt
- Generate: Use AI to generate response

### 5. Orchestration Pattern ⭐ NEW
- Central coordinator manages interactions
- Routes requests to appropriate services
- Handles failover and error recovery
- Manages conversation state

### 6. Scoring & Ranking Pattern ⭐ NEW
- Multiple scoring factors (semantic, source, recency, metadata)
- Weighted combination for final score
- Confidence calculation for transparency

---

## Error Handling

All services and controllers use try-catch blocks:
- Log errors to console
- Return appropriate HTTP status codes
- Provide error messages to clients
- Don't expose sensitive information

---

## Testing Recommendations

### Unit Tests
- Test each service function independently
- Mock MongoDB and Supabase calls
- Test AI service functions with mock responses

### Integration Tests
- Test complete workflows (upload SRS → generate features)
- Test API endpoints
- Verify data persistence

### E2E Tests
- Test full user flows
- Test error scenarios
- Test AI generation accuracy

---

## Performance Considerations

### MongoDB
- Use indexes for frequently queried fields
- Use `select()` to limit returned fields
- Use pagination for large result sets

### Supabase Vector DB
- IVFFlat index improves search performance (100+ vectors)
- Batch embeddings generation is faster
- Cache frequently accessed data

### OpenAI
- Batch embeddings when possible
- Use appropriate model (ada-002 for embeddings, gpt-4o-mini for chat)
- Set reasonable token limits

---

## Security Considerations

### API Security
- Use authentication middleware (currently commented out)
- Validate input data
- Sanitize user inputs
- Rate limiting for AI endpoints

### Database Security
- Use environment variables for credentials
- Service role key for backend (bypasses RLS)
- Anon key for frontend (respects RLS)
- Don't expose sensitive data in responses

---

## Future Enhancements

### Potential Improvements
- ✅ Caching layer (In-memory LRU) - **IMPLEMENTED**
- ✅ Orchestration layer - **IMPLEMENTED**
- ✅ Scoring & Ranking - **IMPLEMENTED**
- ✅ Agent Framework - **IMPLEMENTED**
- ✅ Conversation Memory - **IMPLEMENTED**
- ⏳ Redis caching (for distributed systems)
- ⏳ Background jobs for long-running AI tasks
- ⏳ WebSocket support for real-time updates
- ⏳ Rate limiting
- ⏳ Request logging and monitoring
- ⏳ API versioning

---

## Troubleshooting Guide

### Common Issues

**1. MongoDB Connection Failed**
- Check `MONGODB_URI` format
- Verify MongoDB is running
- Check network connectivity

**2. Supabase Connection Failed**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check Supabase project is active
- Verify migration ran successfully

**3. OpenAI API Errors**
- Check `OPENAI_API_KEY` is valid
- Verify API quota/limits
- Check network connectivity

**4. Vector Search Returns No Results**
- Verify SRS was uploaded and processed
- Check embeddings were stored in Supabase
- Verify `project_id` matches

**5. AI Generation Fails**
- Check OpenAI API key and quota
- Verify context chunks are retrieved
- Check prompt format

---

## Files Reference

### Routes
- `backend/routes/projects.routes.js`
- `backend/routes/features.routes.js`
- `backend/routes/testCases.routes.js`
- `backend/routes/bugs.routes.js`
- `backend/routes/ai.routes.js`

### Controllers
- `backend/controllers/projectsController.js`
- `backend/controllers/featuresController.js`
- `backend/controllers/testCasesController.js`
- `backend/controllers/bugsController.js`
- `backend/controllers/aiController.js`

### Services
- `backend/services/projectService.js`
- `backend/services/featureService.js`
- `backend/services/testCaseService.js`
- `backend/services/bugService.js`

### AI Services
- `backend/ai/embeddings.js`
- `backend/ai/textChunker.js`
- `backend/ai/ragService.js`

### Vector DB
- `backend/vector/vectorStore.js` ⭐ UPDATED

### Chatbot Services ⭐ NEW
- `backend/services/chatbot/orchestrationService.js`
- `backend/services/chatbot/intentService.js`
- `backend/services/chatbot/ragOrchestrator.js`
- `backend/services/chatbot/llmOrchestrator.js`
- `backend/services/chatbot/scoringService.js`
- `backend/services/chatbot/cachingService.js`
- `backend/services/chatbot/conversationMemory.js`
- `backend/services/agent/agentService.js`

### Chatbot Controller & Routes ⭐ NEW
- `backend/controllers/chatbotController.js`
- `backend/routes/chatbot.routes.js`

