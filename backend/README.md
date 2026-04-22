# QBrain Backend

A robust Node.js/Express backend server for QBrain - an AI-powered SRS analysis and test case generation platform. Built with Express.js, MongoDB, and integrated with OpenAI, Supabase, and Google Cloud services.

## 📋 Table of Contents

- [Overview](#-overview)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [API Endpoints](#-api-endpoints)
- [Database Models](#-database-models)
- [AI System](#-ai-system)
- [Running the Server](#-running-the-server)
- [Testing](#-testing)
- [Deployment](#-deployment)

---

## 🎯 Overview

QBrain Backend provides:

- **RESTful API**: Comprehensive REST API for all application operations
- **AI Integration**: OpenAI GPT-4o-mini for feature extraction and test case generation
- **RAG System**: Retrieval Augmented Generation using Supabase vector database
- **Document Processing**: PDF/TXT parsing with Google Document AI
- **Authentication**: JWT-based authentication and authorization
- **File Uploads**: Multer middleware for handling file uploads (SRS documents, bug attachments)
- **Email Service**: Brevo/Nodemailer integration for email notifications
- **Usage Tracking**: API request metrics and performance monitoring
- **Error Handling**: Centralized error handling middleware

---

## 📦 Prerequisites

Before installing the backend, ensure you have:

### Required Software

- **Node.js**: >= 18.0.0 ([Download](https://nodejs.org/))
- **npm**: >= 9.0.0 (comes with Node.js)
- **MongoDB**: 
  - Local MongoDB installation ([Download](https://www.mongodb.com/try/download/community))
  - OR MongoDB Atlas account ([Sign up](https://www.mongodb.com/cloud/atlas))

### Required Services & APIs

1. **OpenAI API Key**
   - Sign up at [OpenAI](https://platform.openai.com/)
   - Create API key from [API Keys](https://platform.openai.com/api-keys)
   - Requires credits/payment method

2. **Supabase Account**
   - Sign up at [Supabase](https://supabase.com/)
   - Create a new project
   - Get project URL and service role key
   - Enable pgvector extension

3. **Google Cloud Platform** (Optional but recommended)
   - Create account at [Google Cloud](https://cloud.google.com/)
   - Enable Document AI API
   - Create a processor
   - Download service account key (JSON)

4. **Brevo Account** (for email service)
   - Sign up at [Brevo](https://www.brevo.com/)
   - Get SMTP credentials
   - OR use Nodemailer with your SMTP provider

---

## 🚀 Installation

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js (web framework)
- Mongoose (MongoDB ODM)
- LangChain (AI framework)
- OpenAI (AI models)
- Supabase (vector database)
- Multer (file uploads)
- JWT (authentication)
- Winston (logging)
- And more...

### 3. Create Environment File

Create a `.env` file in the `backend` directory:

```bash
touch .env
```

### 4. Configure Environment Variables

See [Configuration](#-configuration) section below for detailed environment variable setup.

### 5. Setup Database

#### MongoDB Setup

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas**
1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGO_URI` in `.env`

#### Supabase Setup

1. Create project at [Supabase](https://supabase.com/)
2. Run SQL migration (from project root):
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   
   CREATE TABLE IF NOT EXISTS project_vectors (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     content TEXT NOT NULL,
     embedding vector(1536),
     metadata JSONB,
     project_id TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   CREATE INDEX ON project_vectors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
   
   CREATE OR REPLACE FUNCTION match_project_vectors(
     query_embedding vector(1536),
     match_threshold float DEFAULT 0.7,
     match_count int DEFAULT 10,
     filter_project_id TEXT DEFAULT NULL
   )
   RETURNS TABLE (
     id UUID,
     content TEXT,
     metadata JSONB,
     similarity float,
     project_id TEXT
   )
   LANGUAGE plpgsql
   AS $$
   BEGIN
     RETURN QUERY
     SELECT
       project_vectors.id,
       project_vectors.content,
       project_vectors.metadata,
       1 - (project_vectors.embedding <=> query_embedding) as similarity,
       project_vectors.project_id
     FROM project_vectors
     WHERE (filter_project_id IS NULL OR project_vectors.project_id = filter_project_id)
       AND 1 - (project_vectors.embedding <=> query_embedding) > match_threshold
     ORDER BY project_vectors.embedding <=> query_embedding
     LIMIT match_count;
   END;
   $$;
   ```

### 6. Verify Installation

```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Check npm version
npm --version   # Should be >= 9.0.0

# Verify dependencies installed
npm list --depth=0
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
APP_URL=http://localhost:5000
FRONTEND_URL=http://localhost:8080

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/qbrain
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/qbrain?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# OpenAI API (Required for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini

# Supabase Vector Database (Required for RAG)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Cloud Document AI (Optional but recommended for better PDF parsing)
GCP_PROJECT_ID=your-gcp-project-id
GCP_KEY_FILE=./gcp-key.json
DOCUMENT_AI_PROCESSOR_ID=your-processor-id
DOCUMENT_AI_LOCATION=us

# Email Service Configuration
# Option 1: Brevo (Recommended)
EMAIL_SERVICE=brevo
BREVO_API_KEY=your-brevo-api-key
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USERNAME=your-brevo-email@example.com
BREVO_SMTP_PASSWORD=your-brevo-smtp-password

# Option 2: Nodemailer (Generic SMTP)
# EMAIL_SERVICE=nodemailer
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

### Important Notes

1. **JWT_SECRET**: Use a strong, random secret in production. Never commit this to version control.
2. **MongoDB URI**: Ensure MongoDB is accessible from your server location.
3. **OpenAI API Key**: Keep your API key secure. It will be charged based on usage.
4. **Supabase Keys**: Service role key has admin access. Keep it secure.
5. **GCP Key File**: Place the JSON key file in the `backend` directory as `gcp-key.json`.

### File Upload Configuration

File uploads are configured in routes using Multer:

- **SRS Documents**: Stored in `uploads/` directory
- **Bug Attachments**: Stored in `uploads/bugs/` directory
- **Max File Size**: 500MB (configurable)
- **Allowed Types**: PDF, TXT for SRS; All types for bug attachments

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────┐
│         Express.js Application              │
│  (RESTful API, Middleware, Routes)          │
└────────────┬────────────────────────────────┘
             │
     ┌───────┴────────┬───────────────┐
     │                │               │
┌────▼────┐    ┌─────▼─────┐   ┌─────▼──────┐
│ MongoDB │    │ Supabase  │   │  OpenAI    │
│(Primary)│    │ (Vector)  │   │    API     │
└─────────┘    └───────────┘   └────────────┘
     │                │               │
     └────────────────┴───────────────┘
                      │
            ┌─────────▼──────────┐
            │  Google Cloud      │
            │  Document AI       │
            │  (PDF Processing)  │
            └────────────────────┘
```

### Request Flow

```
Client Request
    ↓
Express Middleware
    ├── CORS
    ├── Body Parser
    ├── Usage Tracking
    └── Authentication (if required)
    ↓
Route Handler
    ↓
Controller
    ├── Input Validation
    ├── Business Logic
    └── Service Layer
        ├── Database Operations (MongoDB)
        ├── AI Operations (OpenAI + RAG)
        └── File Operations
    ↓
Response
```

---

## 📁 Project Structure

```
backend/
├── ai/                        # AI & RAG System
│   ├── chatbot/               # Chatbot functionality
│   │   ├── index.js
│   │   ├── prompts.js
│   │   ├── query.js
│   │   └── utils.js
│   ├── config/                # AI configuration
│   │   ├── constants.js       # 8 comprehensive SRS queries
│   │   ├── llmClient.js       # LLM client factory
│   │   └── models.config.js   # Model configurations
│   ├── ingestion/             # Document processing
│   │   ├── documentParser.js  # PDF/TXT parsing
│   │   └── embeddings.js      # Embedding generation
│   ├── rag/                   # RAG system
│   │   ├── index.js
│   │   └── query.js
│   ├── reasoning/             # AI reasoning
│   │   ├── featureExtraction.js
│   │   ├── testCaseGeneration.js
│   │   ├── gherkinConversion.js
│   │   ├── sectionMatching.js
│   │   ├── jsonUtils.js
│   │   └── prompts/
│   └── retrieval/             # Context retrieval
│       ├── retrievalCore.js
│       ├── retrievalStrategies.js
│       └── sectionsCore.js
│
├── config/                    # Configuration files
│   ├── database.js            # MongoDB connection
│   └── nodemailer.config.js   # Email service config
│
├── controllers/               # Route controllers
│   ├── admin.controller.js    # Admin operations
│   ├── aiController.js        # AI feature extraction
│   ├── auth.controller.js     # Authentication
│   ├── bugsController.js      # Bug management
│   ├── chatbotController.js   # Chatbot queries
│   ├── featuresController.js  # Feature management
│   ├── projectsController.js  # Project management
│   └── testCasesController.js # Test case management
│
├── middleware/                # Express middleware
│   ├── auth.middleware.js     # JWT authentication
│   ├── errorHandler.middleware.js # Error handling
│   └── usageMetrics.middleware.js # Usage tracking
│
├── models/                    # MongoDB schemas
│   ├── ApiRequestMetric.js    # API metrics
│   ├── Bug.js                 # Bug model
│   ├── DailyActiveUser.js     # User activity
│   ├── Feature.js             # Feature model
│   ├── PerformanceMetric.js   # Performance tracking
│   ├── Project.js             # Project model
│   ├── TestCase.js            # Test case model
│   └── User.js                # User model
│
├── routes/                    # API routes
│   ├── admin.routes.js
│   ├── ai.routes.js
│   ├── auth.routes.js
│   ├── bugs.routes.js
│   ├── chatbot.routes.js
│   ├── features.routes.js
│   ├── projects.routes.js
│   └── testCases.routes.js
│
├── services/                  # Business logic layer
│   ├── bugService.js
│   ├── documentProcessingValidator.js
│   ├── featureService.js
│   ├── performanceMetricsService.js
│   ├── projectService.js
│   └── testCaseService.js
│
├── utils/                     # Utility functions
│   ├── AppError.js            # Custom error class
│   ├── emailService.js        # Email sending
│   ├── emailTemplates.js      # Email templates
│   └── textProcessing.js      # Text utilities
│
├── vector/                    # Vector store
│   └── vectorStore.js         # Supabase integration
│
├── uploads/                   # Uploaded files
│   ├── srs-*.pdf              # SRS documents
│   └── bugs/                  # Bug attachments
│
├── logs/                      # Application logs
│   ├── combined-*.log
│   ├── error-*.log
│   └── http-*.log
│
├── test/                      # Test files
│   └── unit/
│       ├── fixtures/
│       ├── helpers/
│       ├── reasoning/
│       ├── retrieval/
│       └── utils/
│
├── scripts/                   # Utility scripts
│   └── promote-admin.js       # Admin promotion
│
├── server.js                  # Application entry point
├── package.json               # Dependencies
└── jest.config.mjs            # Jest configuration
```

---

## 🔧 How It Works

### 1. Application Startup

```javascript
// server.js
1. Load environment variables (.env)
2. Initialize Express application
3. Connect to MongoDB
4. Setup middleware (CORS, body parser, etc.)
5. Register routes
6. Setup error handling
7. Start server on configured PORT
```

### 2. Request Handling

```
1. Client sends HTTP request
2. CORS middleware processes request
3. Body parser extracts request data
4. Usage tracking middleware logs request
5. Authentication middleware verifies JWT (if protected route)
6. Route handler processes request
7. Controller validates input
8. Service layer executes business logic
9. Database operations (MongoDB)
10. AI operations (if needed) - OpenAI + RAG
11. Response sent back to client
```

### 3. Authentication Flow

```
1. User submits credentials (login/signup)
2. Server validates credentials
3. If valid:
   - Create JWT token
   - Hash password (bcrypt)
   - Save to MongoDB
   - Send JWT in response
4. Client stores JWT (localStorage)
5. Subsequent requests include JWT in Authorization header
6. Middleware verifies JWT
7. Request proceeds if valid
```

### 4. AI Feature Extraction Flow

```
1. User uploads SRS document
2. Document parsed (Google Document AI or pdf-parse)
3. Text chunked into 2000-character chunks
4. Embeddings generated (OpenAI text-embedding-3-small)
5. Embeddings stored in Supabase vector database
6. User requests feature extraction
7. RAG system retrieves relevant context (8 parallel queries)
8. Context sent to GPT-4o-mini
9. Features extracted and returned
10. Features saved to MongoDB
```

### 5. File Upload Flow

```
1. Client sends multipart/form-data with file
2. Multer middleware processes upload
3. File saved to uploads/ directory
4. File metadata stored in database
5. File path returned to client
```

---

## 📡 API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/verify-email/:token` - Verify email address

### Projects (`/api/projects`)

- `GET /api/projects` - Get all projects (authenticated)
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/upload-srs` - Upload SRS document
- `POST /api/projects/:id/share` - Share project with user

### Features (`/api/features`)

- `GET /api/features/project/:projectId` - Get all features for project
- `POST /api/features` - Create feature
- `GET /api/features/:id` - Get feature by ID
- `PUT /api/features/:id` - Update feature
- `DELETE /api/features/:id` - Delete feature
- `PATCH /api/features/:id/priority` - Update feature priority

### AI Operations (`/api/ai`)

- `POST /api/ai/extract-features/:projectId` - Extract features from SRS
- `POST /api/ai/generate-test-cases/:featureId` - Generate test cases for feature

### Test Cases (`/api/test-cases`)

- `GET /api/test-cases/project/:projectId` - Get all test cases for project
- `GET /api/test-cases/feature/:featureId` - Get test cases for feature
- `POST /api/test-cases` - Create test case
- `PUT /api/test-cases/:id` - Update test case
- `DELETE /api/test-cases/:id` - Delete test case
- `PATCH /api/test-cases/:id/status` - Update test case status
- `PATCH /api/test-cases/:id/priority` - Update test case priority
- `POST /api/test-cases/bulk` - Bulk create test cases

### Bugs (`/api/bugs`)

- `GET /api/bugs/project/:projectId` - Get all bugs for project
- `GET /api/bugs/feature/:featureId` - Get bugs for feature
- `POST /api/bugs` - Create bug (with file upload support)
- `GET /api/bugs/:id` - Get bug by ID
- `PUT /api/bugs/:id` - Update bug
- `DELETE /api/bugs/:id` - Delete bug
- `PATCH /api/bugs/:id/status` - Update bug status
- `POST /api/bugs/:id/attachments` - Upload bug attachment

### Chatbot (`/api/chatbot`)

- `POST /api/chatbot/query/:projectId` - Query chatbot with conversation history

### Admin (`/api/admin`)

- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/stats` - Get system statistics
- `PATCH /api/admin/users/:id` - Update user (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

---

## 🗄️ Database Models

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  emailVerified: Boolean,
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}
```

### Project Model

```javascript
{
  name: String,
  description: String,
  owner: ObjectId (User),
  sharedWith: [ObjectId (User)],
  srsFilePath: String,
  srsStatus: String (pending/processing/processed),
  features: [ObjectId (Feature)],
  status: String (active/archived)
}
```

### Feature Model

```javascript
{
  name: String,
  description: String,
  featureType: String,
  priority: String,
  status: String,
  projectId: ObjectId,
  matchedSections: [String],
  relevanceScore: Number,
  rankingScore: Number,
  confidence: Number,
  acceptanceCriteria: [String]
}
```

### TestCase Model

```javascript
{
  title: String,
  description: String,
  steps: [String],
  expectedResult: String,
  priority: String,
  status: String,
  featureId: ObjectId,
  projectId: ObjectId,
  gherkin: String,
  sectionReferences: [String]
}
```

### Bug Model

```javascript
{
  title: String,
  description: String,
  severity: String,
  priority: String,
  status: String,
  featureId: ObjectId,
  projectId: ObjectId,
  reportedBy: ObjectId (User),
  attachments: [String],
  attachmentDetails: [Object],
  stepsToReproduce: [String],
  expectedBehavior: String,
  actualBehavior: String,
  environment: Object
}
```

---

## 🤖 AI System

### Overview

The AI system uses RAG (Retrieval Augmented Generation) to provide context-aware AI responses. See main [README.md](../README.md) for detailed RAG system documentation.

### Key Components

1. **Document Ingestion**: PDF/TXT parsing and chunking
2. **Embedding Generation**: OpenAI text-embedding-3-small
3. **Vector Storage**: Supabase with pgvector
4. **Retrieval**: 8 parallel queries for comprehensive coverage
5. **Reasoning**: GPT-4o-mini for feature extraction and test generation

### AI Workflows

**Feature Extraction:**
1. Comprehensive retrieval (8 queries)
2. Section grouping
3. Adaptive prompting
4. LLM feature extraction
5. Feature enhancement and scoring

**Test Case Generation:**
1. Context retrieval (section-aware or comprehensive)
2. Feature-type-specific prompting
3. LLM test case generation
4. Gherkin conversion
5. Storage and indexing

---

## ▶️ Running the Server

### Development Mode

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server on file changes.

### Production Mode

```bash
npm start
```

### Using PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start server
pm2 start server.js --name qbrain-backend

# View logs
pm2 logs qbrain-backend

# Restart server
pm2 restart qbrain-backend

# Stop server
pm2 stop qbrain-backend
```

### Verify Server is Running

```bash
# Check if server responds
curl http://localhost:5000/api/health

# Or visit in browser
http://localhost:5000
```

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Unit Tests Only

```bash
npm run test:unit
```

### Test Structure

```
test/
└── unit/
    ├── reasoning/      # AI reasoning tests
    ├── retrieval/      # RAG retrieval tests
    └── utils/          # Utility function tests
```

---

## 🚢 Deployment

### Environment Setup

1. Set `NODE_ENV=production` in `.env`
2. Update database URIs for production
3. Configure production API keys
4. Set up proper CORS origins
5. Configure SSL/HTTPS

### Production Checklist

- [ ] Strong JWT_SECRET
- [ ] MongoDB connection string secured
- [ ] API keys secured (never commit to git)
- [ ] CORS configured for production frontend URL
- [ ] File upload limits configured
- [ ] Logging configured
- [ ] Error handling tested
- [ ] Rate limiting enabled
- [ ] HTTPS enabled
- [ ] Environment variables secured

### Recommended Hosting

- **Backend**: Heroku, DigitalOcean, AWS EC2, Railway
- **Database**: MongoDB Atlas
- **Vector DB**: Supabase
- **File Storage**: AWS S3, Google Cloud Storage (for production)

---

## 📝 Available Scripts

```bash
# Start server (development)
npm run dev

# Start server (production)
npm start

# Run tests
npm test

# Run tests (watch mode)
npm run test:watch

# Promote user to admin
npm run promote-admin
```

---

## 🔍 Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB is running
mongod --version

# Check connection string format
# Local: mongodb://localhost:27017/qbrain
# Atlas: mongodb+srv://user:pass@cluster.mongodb.net/qbrain
```

### OpenAI API Issues

- Verify API key is correct
- Check API quota/credits
- Verify model name is correct (gpt-4o-mini)

### Supabase Issues

- Verify project URL and service role key
- Check pgvector extension is enabled
- Verify table structure matches migration

### File Upload Issues

- Check `uploads/` directory exists and has write permissions
- Verify Multer configuration
- Check file size limits

---

## 📚 Related Documentation

- [Main README](../README.md) - Overall project documentation
- [Frontend README](../frontend/README.md) - Frontend documentation
- [OpenAI API Docs](https://platform.openai.com/docs) - OpenAI documentation
- [Supabase Docs](https://supabase.com/docs) - Supabase documentation
- [Mongoose Docs](https://mongoosejs.com/docs) - MongoDB ODM documentation

---

## 📄 License

MIT License - See main project LICENSE file for details.

---

