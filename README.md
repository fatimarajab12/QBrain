# QBrain - AI-Powered SRS Analysis & Test Case Generation Platform

<div align="center">

![QBrain Logo](https://img.shields.io/badge/QBrain-AI%20Assistant-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**An intelligent platform for analyzing SRS documents and automatically extracting features and generating test cases using AI**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [AI & RAG](#-how-ai--rag-works) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-documentation)

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-green.svg)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-purple.svg)](https://openai.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [How AI & RAG Works](#-how-ai--rag-works)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**QBrain** is an intelligent platform that leverages **RAG (Retrieval Augmented Generation)** and **AI** technologies to analyze **SRS (Software Requirements Specification)** documents and automatically extract features and generate test cases.

### Problem Statement
- Manual SRS analysis is time-consuming and error-prone
- Feature extraction from SRS documents is complex and expensive
- Manual test case creation is slow and inconsistent
- Tracking coverage and maintaining consistency is challenging

### Solution
- Automated SRS analysis using AI
- Automatic feature extraction with intelligent classification
- AI-powered test case generation based on features
- Comprehensive coverage analysis and section tracking

---

## ✨ Features

### 🤖 AI-Powered Capabilities
- ✅ **Automatic Feature Extraction** from SRS using GPT-4o-mini
- ✅ **SRS Type Detection** (IEEE 830, Agile, Enterprise) with high accuracy
- ✅ **Intelligent Test Case Generation** based on feature types
- ✅ **Section Coverage Analysis** to ensure completeness
- ✅ **Smart Chatbot** for answering SRS-related questions

### 📊 Project Management
- ✅ **Multi-Project Support** with isolated workspaces
- ✅ **Feature Tracking** with metadata and scores
- ✅ **Test Case Management** with Gherkin conversion
- ✅ **Bug Tracking** and issue management
- ✅ **Performance Metrics** and analytics

### 🔍 Advanced RAG System
- ✅ **Semantic Search** using OpenAI embeddings
- ✅ **Multi-Query Retrieval** for comprehensive coverage
- ✅ **Section-Based Organization** of context
- ✅ **Adaptive Prompting** based on SRS type

### 🎨 Modern User Interface
- ✅ **React 18** with TypeScript
- ✅ **Tailwind CSS** + **shadcn/ui** components
- ✅ **Fully Responsive** design
- ✅ **Dark Mode** support
- ✅ **Real-time Updates** with React Query

### 📄 Document Processing
- ✅ **PDF & TXT Support** for SRS documents
- ✅ **Google Document AI** integration for high-quality extraction
- ✅ **Intelligent Chunking** with overlap for context preservation
- ✅ **Vector Storage** in Supabase with pgvector

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Primary database (Projects, Features, Test Cases, Bugs) |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication & authorization |
| **bcrypt** | Password hashing |
| **Multer** | File upload handling |
| **Nodemailer/Brevo** | Email service |

### AI & Machine Learning
| Technology | Purpose |
|------------|---------|
| **LangChain** | LLM framework & chain orchestration |
| **OpenAI API** | GPT-4o-mini, text-embedding-3-small |
| **Supabase** | Vector database (pgvector extension) |
| **RAG** | Retrieval Augmented Generation pattern |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | High-quality UI components |
| **React Router** | Client-side routing |
| **TanStack Query** | Data fetching & caching |
| **React Hook Form** | Form state management |
| **Zod** | Schema validation |

### Document Processing
| Technology | Purpose |
|------------|---------|
| **Google Document AI** | Advanced PDF text extraction |
| **pdf-parse** | PDF parsing fallback |
| **RecursiveCharacterTextSplitter** | Intelligent text chunking |

---

## 🏗️ Architecture

```
QBrain/
├── backend/                    # Backend Server
│   ├── ai/                     # AI & RAG Services
│   │   ├── embeddings.js       # Embedding generation
│   │   └── ragService/         # RAG service modules
│   │       ├── featureExtraction.js  # Feature extraction logic
│   │       ├── analysis.js           # Test case generation
│   │       ├── query.js              # RAG query handling
│   │       ├── retrieval.js          # Context retrieval
│   │       ├── srsDetection.js       # SRS type detection
│   │       ├── sections.js           # Section grouping
│   │       ├── prompts.js            # Adaptive prompts
│   │       └── utils.js              # Utility functions
│   ├── controllers/            # Route controllers
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API route definitions
│   ├── services/               # Business logic layer
│   ├── vector/                 # Vector store integration
│   └── utils/                  # Helper utilities
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── hooks/             # Custom React hooks
│   │   └── types/             # TypeScript type definitions
│   └── ...
│
└── diagrams/                   # System architecture diagrams
```

---

## 🤖 How AI & RAG Works

### 1. RAG (Retrieval Augmented Generation)

**RAG** is a technique that combines:
- **Retrieval**: Finding relevant information from a vector store
- **Augmentation**: Adding this information to the prompt
- **Generation**: Generating a response from an LLM based on context

#### Workflow:

```
User Query/Request
    ↓
1. Generate Query Embedding
    ↓
2. Semantic Search in Vector Store
    ↓
3. Retrieve Relevant Chunks
    ↓
4. Combine Chunks into Context
    ↓
5. Send Context + Prompt to LLM
    ↓
6. Generate Response
    ↓
Return Result
```

### 2. Feature Extraction Workflow

```
1. Upload SRS Document
   ↓
2. Extract Text (PDF/TXT via Document AI)
   ↓
3. Chunk Document (1000 chars, 200 overlap)
   ↓
4. Generate Embeddings (text-embedding-3-small)
   ↓
5. Store in Supabase Vector Store
   ↓
6. Detect SRS Type (IEEE 830/Agile/Enterprise)
   ↓
7. Comprehensive Retrieval (8 specialized queries)
   ↓
8. Group Chunks by Sections
   ↓
9. Create Adaptive Prompt (based on SRS type)
   ↓
10. Call LLM (GPT-4o-mini)
   ↓
11. Parse & Enhance Features
   ↓
12. Analyze Section Coverage
   ↓
13. Return Features with Metadata
```

### 3. AI Components Deep Dive

#### A. Embeddings (`embeddings.js`)
- **Purpose**: Convert text to numerical vectors
- **Model**: `text-embedding-3-small` (1536 dimensions)
- **Features**:
  - Text cleaning before embedding
  - Vector normalization for better cosine similarity
  - Batch processing support
  - Retry mechanism with exponential backoff

```javascript
const embedding = await generateEmbedding(text);
// Returns: [0.123, -0.456, 0.789, ...] (1536 numbers)
```

#### B. SRS Detection (`srsDetection.js`)
- **Purpose**: Automatically detect SRS document type
- **Method**: 
  - Keyword matching (70% weight)
  - Structural pattern matching (30% weight)
- **Supported Types**: IEEE 830, Agile, Enterprise
- **Output**: Detected type with confidence score

#### C. Retrieval (`retrieval.js`)
- **Simple Retrieval**: Single query for quick results
- **Comprehensive Retrieval**: 8 specialized queries covering:
  - FUNCTIONAL, DATA, INTERFACE, QUALITY
  - CONSTRAINT, REPORT, NOTIFICATION, WORKFLOW
- **Query Expansion**: Adds related terms for better recall

#### D. Feature Extraction (`featureExtraction.js`)
- Retrieves comprehensive context from vector store
- Organizes context by sections
- Creates adaptive prompts based on SRS type
- Calls LLM to extract features
- Enhances features with metadata, scores, and section info

#### E. Test Case Generation (`analysis.js`)
- Retrieves context from specific sections
- Creates feature-type-specific prompts
- Generates test cases using LLM
- Validates and enhances test cases
- Supports Gherkin conversion

### 4. LangChain Integration

LangChain provides:
- **ChatOpenAI**: LLM management and invocation
- **OpenAIEmbeddings**: Embedding generation
- **PromptTemplate**: Prompt management and formatting
- **createRetrievalChain**: RAG chain orchestration
- **SupabaseVectorStore**: Vector store integration
- **RecursiveCharacterTextSplitter**: Intelligent text chunking

---

## 🚀 Installation

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or cloud)
- Supabase account
- OpenAI API key
- Google Cloud account (optional, for Document AI)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/QBrain.git
cd QBrain
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
MONGO_URI=mongodb://localhost:27017/qbrain
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
EMAIL_SERVICE=brevo  # or nodemailer
BREVO_API_KEY=your-brevo-api-key  # if using Brevo
GOOGLE_APPLICATION_CREDENTIALS=./gcp-key.json  # for Document AI
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Database Setup

#### MongoDB
```bash
# Start MongoDB (if local)
mongod

# Or use MongoDB Atlas cloud service
```

#### Supabase
1. Create a new Supabase project
2. Run the migration script:
```sql
-- Create project_vectors table
CREATE TABLE IF NOT EXISTS project_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  project_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON project_vectors USING ivfflat (embedding vector_cosine_ops);
```

### 5. Run Application

#### Development Mode
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

#### Production Mode
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
npm start
```

---

## 📖 Usage

### 1. Create Account
- Navigate to sign-up page
- Enter email and password
- Verify email address
- Log in

### 2. Create Project
- Click "Create Project"
- Enter project name and description
- Upload SRS document (PDF or TXT)

### 3. Extract Features
- Wait for SRS processing to complete
- Click "Extract Features" button
- Review extracted features with metadata
- Check section coverage analysis

### 4. Generate Test Cases
- Select a feature
- Click "Generate Test Cases"
- Review AI-generated test cases
- Optionally convert to Gherkin format

### 5. Use Chatbot
- Navigate to project chatbot
- Ask questions about the SRS
- Get accurate answers based on document context

### 6. Manage Bugs
- Create bugs linked to features
- Track bug status and assignments
- View bug analytics

---

## 📚 API Documentation

### Authentication Endpoints

#### Sign Up
```http
POST /api/auth/sign-up
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Sign In
```http
POST /api/auth/sign-in
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Verify Email
```http
GET /api/auth/verify-email?token=verification-token
```

### Project Endpoints

#### Get All Projects
```http
GET /api/projects
Authorization: Bearer <token>
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description"
}
```

#### Upload SRS
```http
POST /api/projects/:id/upload-srs
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <SRS document>
```

#### Extract Features
```http
POST /api/projects/:id/extract-features
Authorization: Bearer <token>
```

### Feature Endpoints

#### Get Features
```http
GET /api/projects/:projectId/features
Authorization: Bearer <token>
```

#### Create Feature
```http
POST /api/projects/:projectId/features
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "User Login",
  "description": "User authentication feature",
  "featureType": "FUNCTIONAL",
  "priority": "High"
}
```

### Test Case Endpoints

#### Generate Test Cases
```http
POST /api/features/:featureId/test-cases/generate
Authorization: Bearer <token>
```

#### Get Test Cases
```http
GET /api/features/:featureId/test-cases
Authorization: Bearer <token>
```

### AI Endpoints

#### Query RAG
```http
POST /api/ai/query
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "project-id",
  "question": "What are the authentication requirements?",
  "nResults": 5
}
```

#### Get Context
```http
POST /api/ai/context
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "project-id",
  "query": "authentication requirements",
  "nResults": 10
}
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 📊 Performance Metrics

- **Feature Extraction**: 30-60 seconds per SRS
- **Test Case Generation**: 10-20 seconds per feature
- **Coverage Analysis**: 75-85% average coverage
- **SRS Type Detection**: 85-95% accuracy
- **Cost per SRS**: $0.10 - $0.50 (using GPT-4o-mini)

---

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Row Level Security (RLS) on Supabase
- Input validation with Zod
- CORS configuration
- Environment variable protection

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Fatima Rajab** - *Initial work and development*

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) - For GPT models and embeddings
- [LangChain](https://langchain.com/) - For LLM framework
- [Supabase](https://supabase.com/) - For vector database
- [shadcn/ui](https://ui.shadcn.com/) - For beautiful UI components
- [Vercel](https://vercel.com/) - For deployment inspiration

---





