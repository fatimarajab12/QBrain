# QBrain - AI-Powered SRS Analysis & Test Case Generation Platform

<div align="center">

![QBrain Logo](https://img.shields.io/badge/QBrain-AI%20Assistant-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**An intelligent platform for analyzing SRS documents and automatically extracting features and generating test cases using AI**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [AI & RAG](#-how-ai--rag-works) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-green.svg)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-purple.svg)](https://openai.com/)

</div>

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Architecture](#-architecture)
   - [Project Structure](#project-structure)
   - [System Architecture Layers](#system-architecture-layers)
5. [How RAG System Works](#-how-rag-system-works--كيف-يعمل-نظام-rag)
   - [Basic RAG Workflow](#-basic-rag-workflow--التدفق-الأساسي-لنظام-rag)
   - [Detailed RAG Architecture](#-detailed-rag-architecture--البنية-التفصيلية-لنظام-rag)
   - [Key Components Explained](#-key-components-explained--شرح-المكونات-الرئيسية)
   - [Performance Optimizations](#-performance-optimizations--تحسينات-الأداء)
6. [Installation](#-installation)
7. [Usage](#-usage)
8. [Documentation](#-documentation)
9. [Performance Metrics](#-performance-metrics)
10. [Security](#-security)
11. [Testing](#-testing)
12. [Contributing](#-contributing)
13. [License](#-license)

---

## 🎯 Overview

**QBrain** is an intelligent platform that leverages **RAG (Retrieval Augmented Generation)** and **AI** technologies to analyze **SRS (Software Requirements Specification)** documents and automatically extract features and generate test cases.

### Problem Statement
- Manual SRS analysis is time-consuming and error-prone
- Feature extraction from SRS documents is complex and expensive
- Manual test case creation is slow and inconsistent
- Tracking coverage and maintaining consistency is challenging

### Solution
- ✅ Automated SRS analysis using AI
- ✅ Automatic feature extraction with intelligent classification
- ✅ AI-powered test case generation based on features
- ✅ Comprehensive coverage analysis and section tracking
- ✅ Smart chatbot for answering SRS-related questions

---

## ✨ Features

### 🤖 AI-Powered Capabilities
- ✅ **Automatic Feature Extraction** from SRS using GPT-4o-mini
- ✅ **Comprehensive RAG System** with 8 parallel queries for complete coverage
- ✅ **Intelligent Test Case Generation** based on feature types (FUNCTIONAL, DATA, REPORT, etc.)
- ✅ **Section Coverage Analysis** to ensure completeness
- ✅ **Smart Chatbot** for answering SRS-related questions with context-aware responses
- ✅ **Automatic Gherkin Conversion** with AI or rule-based fallback
- ✅ **Section Matching** for feature-to-SRS section correlation

### 📊 Project Management
- ✅ **Multi-Project Support** with isolated workspaces
- ✅ **Feature Tracking** with metadata, scores, and reasoning
- ✅ **Test Case Management** with Gherkin conversion
- ✅ **Bug Tracking** and issue management
- ✅ **Performance Metrics** and analytics
- ✅ **Section Coverage Visualization**

### 🔍 Advanced RAG System
- ✅ **Semantic Search** using OpenAI embeddings (text-embedding-3-small)
- ✅ **Multi-Query Retrieval** (8 specialized queries covering all feature types)
- ✅ **Section-Based Organization** of context chunks
- ✅ **Adaptive Prompting** based on feature types and high-recall mode
- ✅ **Vector Storage** in Supabase with pgvector for fast similarity search

### 🎨 Modern User Interface
- ✅ **React 18** with TypeScript for type safety
- ✅ **Tailwind CSS** + **shadcn/ui** components for beautiful UI
- ✅ **Fully Responsive** design for all devices
- ✅ **Dark Mode** support
- ✅ **Real-time Updates** with TanStack Query
- ✅ **Modern Animations** with Framer Motion

### 📄 Document Processing
- ✅ **PDF & TXT Support** for SRS documents
- ✅ **Google Document AI** integration for high-quality extraction with OCR support
- ✅ **Intelligent Chunking** (2000 chars with 300 overlap) for context preservation
- ✅ **Batch Embedding Generation** for cost efficiency
- ✅ **Automatic PDF Splitting** for large documents (>15 pages)

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | >= 18.0.0 |
| **Express.js** | Web framework | 5.1.0 |
| **MongoDB** | Primary database (Projects, Features, Test Cases, Bugs) | 8.20.1 |
| **Mongoose** | ODM for MongoDB | 8.20.1 |
| **JWT** | Authentication & authorization | 9.0.2 |
| **bcryptjs** | Password hashing | 3.0.3 |
| **Multer** | File upload handling | 2.0.2 |
| **Brevo/Nodemailer** | Email service | 3.0.1 / 7.0.10 |

### AI & Machine Learning
| Technology | Purpose |
|------------|---------|
| **LangChain** | LLM framework & chain orchestration |
| **OpenAI API** | GPT-4o-mini (analysis), text-embedding-3-small (embeddings) |
| **Supabase** | Vector database (PostgreSQL + pgvector extension) |
| **RAG Pattern** | Retrieval Augmented Generation for context-aware responses |

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
| **Google Document AI** | Advanced PDF text extraction with OCR |
| **pdf-parse** | PDF parsing fallback |
| **pdf-lib** | PDF manipulation for splitting |
| **RecursiveCharacterTextSplitter** | Intelligent text chunking |

---

## 🏗️ Architecture

### Project Structure

```
QBrain/
├── backend/                           # Backend Server (Node.js/Express)
│   ├── ai/                            # AI & RAG Services
│   │   ├── chatbot/                   # Chatbot functionality
│   │   │   ├── index.js               # Main chatbot export
│   │   │   ├── prompts.js             # Chatbot prompts
│   │   │   ├── query.js               # Chatbot query handler
│   │   │   └── utils.js               # Chatbot utilities
│   │   ├── config/                    # Configuration
│   │   │   ├── llmClient.js           # LLM client factory
│   │   │   ├── models.config.js       # Model configurations
│   │   │   └── constants.js           # 8 comprehensive SRS queries
│   │   ├── ingestion/                 # Document processing
│   │   │   ├── documentParser.js      # PDF/TXT parsing 
│   │   │   └── embeddings.js          # Embedding generation (OpenAI)
│   │   ├── retrieval/                 # Context retrieval
│   │   │   ├── retrievalCore.js       # RAG context retrieval
│   │   │   ├── retrievalStrategies.js # Retrieval strategies
│   │   │   └── sectionsCore.js        # Section grouping & analysis
│   │   ├── reasoning/                 # AI reasoning & analysis
│   │   │   ├── featureExtraction.js   # Feature extraction logic
│   │   │   ├── testCaseGeneration.js  # Test case generation
│   │   │   ├── gherkinConversion.js   # Gherkin format conversion
│   │   │   ├── sectionMatching.js     # Section matching logic
│   │   │   ├── jsonUtils.js           # JSON parsing utilities
│   │   │   └── prompts/               # Prompt templates
│   │   │       └── index.js           # Prompt exports
│   │   └── rag/                       # Unified entry point
│   │       ├── index.js               # Export all functions
│   │       └── query.js               # RAG query handler (Chatbot)
│   ├── config/                        # Configuration files
│   │   ├── database.js                # MongoDB connection
│   │   └── nodemailer.config.js       # Email service configuration
│   ├── controllers/                   # Route controllers
│   │   ├── admin.controller.js        # Admin operations
│   │   ├── aiController.js            # AI feature extraction & test generation
│   │   ├── auth.controller.js         # Authentication (login, signup, reset)
│   │   ├── bugsController.js          # Bug CRUD operations
│   │   ├── chatbotController.js       # Chatbot endpoints
│   │   ├── featuresController.js      # Feature CRUD operations
│   │   ├── projectsController.js      # Project CRUD operations
│   │   └── testCasesController.js     # Test case CRUD operations
│   ├── models/                        # MongoDB schemas
│   │   ├── ApiRequestMetric.js        # API usage metrics
│   │   ├── Bug.js                     # Bug model
│   │   ├── DailyActiveUser.js         # Daily active users tracking
│   │   ├── Feature.js                 # Feature model
│   │   ├── PerformanceMetric.js       # Performance metrics
│   │   ├── Project.js                 # Project model
│   │   ├── TestCase.js                # Test case model
│   │   └── User.js                    # User model
│   ├── routes/                        # API route definitions
│   │   ├── admin.routes.js            # Admin routes
│   │   ├── ai.routes.js               # AI routes (feature extraction, test generation)
│   │   ├── auth.routes.js             # Authentication routes
│   │   ├── bugs.routes.js             # Bug routes
│   │   ├── chatbot.routes.js          # Chatbot routes
│   │   ├── features.routes.js         # Feature routes
│   │   ├── projects.routes.js         # Project routes
│   │   └── testCases.routes.js        # Test case routes
│   ├── services/                      # Business logic layer
│   │   ├── bugService.js              # Bug business logic
│   │   ├── documentProcessingValidator.js # Document validation
│   │   ├── featureService.js          # Feature business logic
│   │   ├── performanceMetricsService.js # Performance tracking
│   │   ├── projectService.js          # Project business logic
│   │   └── testCaseService.js         # Test case business logic
│   ├── middleware/                    # Express middleware
│   │   ├── auth.middleware.js         # JWT authentication
│   │   ├── errorHandler.middleware.js # Error handling
│   │   └── usageMetrics.middleware.js # Usage tracking
│   ├── utils/                         # Helper utilities
│   │   ├── AppError.js                # Custom error class
│   │   ├── emailService.js            # Email sending utilities
│   │   ├── emailTemplates.js          # Email templates
│   │   └── textProcessing.js          # Text processing helpers
│   ├── vector/                        # Vector store integration
│   │   └── vectorStore.js             # Supabase vector store wrapper
│   ├── test/                          # Test files
│   │   ├── data/                      # Test data
│   │   └── unit/                      # Unit tests
│   │       ├── fixtures/              # Test fixtures
│   │       │   ├── chunks.js
│   │       │   ├── factories.js
│   │       │   ├── index.js
│   │       │   ├── llm.js
│   │       │   └── testCase.js
│   │       ├── helpers/               # Test helpers
│   │       │   └── console.js
│   │       ├── reasoning/             # Reasoning tests
│   │       │   ├── featureExtraction.test.js
│   │       │   ├── gherkinConversion.test.js
│   │       │   └── testCaseGeneration.test.js
│   │       ├── retrieval/             # Retrieval tests
│   │       │   ├── retrievalCore.test.js
│   │       │   └── sectionsCore.test.js
│   │       └── utils/                 # Utils tests
│   │           ├── jsonUtils.test.js
│   │           └── textProcessing.test.js
│   ├── scripts/                       # Utility scripts
│   │   └── promote-admin.js           # Admin promotion script
│   ├── uploads/                       # Uploaded files directory
│   ├── logs/                          # Application logs
│   ├── server.js                      # Express server entry point
│   ├── package.json                   # Backend dependencies
│   └── jest.config.mjs                # Jest configuration
│
├── frontend/                          # React Frontend
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── ui/                    # shadcn/ui components
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── collapsible.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── loading-button.tsx      # Custom loading button
│   │   │   │   ├── loading-spinner.tsx     # Custom loading spinner
│   │   │   │   ├── page-loading.tsx        # Page loading component
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   └── ... (more shadcn/ui components)
│   │   │   ├── custom/                 # Custom components
│   │   │   │   ├── DotGrid.tsx        # Background grid component
│   │   │   │   └── Orb.tsx            # Orb animation component
│   │   │   ├── ProjectChatBot/        # Chatbot component
│   │   │   │   ├── components/
│   │   │   │   │   ├── ChatButton.tsx
│   │   │   │   │   ├── ChatHeader.tsx
│   │   │   │   │   ├── ChatInput.tsx
│   │   │   │   │   ├── ChatWindow.tsx
│   │   │   │   │   └── MessageList.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useChatApi.ts
│   │   │   │   │   └── useChatMessages.ts
│   │   │   │   ├── constants.ts
│   │   │   │   ├── index.tsx
│   │   │   │   └── types.ts
│   │   │   ├── shared/                # Shared components
│   │   │   │   ├── PrefetchLink.tsx
│   │   │   │   └── SuspenseFallback.tsx
│   │   │   ├── AdminRoute.tsx         # Admin route protection
│   │   │   ├── AppSidebar.tsx         # Main sidebar navigation
│   │   │   ├── ErrorBoundary.tsx      # Error boundary component
│   │   │   ├── ErrorBoundaryNavigation.tsx
│   │   │   ├── Logo.tsx               # Application logo
│   │   │   └── icons/                 # Icon components
│   │   ├── pages/                     # Page components
│   │   │   ├── admin-dashboard/       # Admin dashboard
│   │   │   │   ├── components/
│   │   │   │   │   ├── AdminHeader.tsx
│   │   │   │   │   ├── DeleteUserDialog.tsx
│   │   │   │   │   ├── LoadingState.tsx
│   │   │   │   │   ├── OverviewTab.tsx
│   │   │   │   │   ├── StatsCards.tsx
│   │   │   │   │   ├── SystemHealthTab.tsx
│   │   │   │   │   ├── UserFilters.tsx
│   │   │   │   │   ├── UserManagementTab.tsx
│   │   │   │   │   └── UserTable.tsx
│   │   │   │   └── hooks/
│   │   │   │       ├── useAdminData.ts
│   │   │   │       ├── useUserActions.ts
│   │   │   │       ├── useUserFilters.ts
│   │   │   │       └── useUserSelection.ts
│   │   │   ├── AdminDashboard.tsx     # Admin dashboard page
│   │   │   ├── auth/                  # Authentication pages
│   │   │   │   ├── AuthLayout.tsx     # Auth layout wrapper
│   │   │   │   ├── ForgotPassword.tsx # Password reset request
│   │   │   │   ├── Login.tsx          # Login page
│   │   │   │   ├── ResetPassword.tsx  # Password reset
│   │   │   │   └── Signup.tsx         # Registration page
│   │   │   ├── AuthPage.tsx           # Auth page wrapper
│   │   │   ├── bug-details/           # Bug details page
│   │   │   │   ├── components/
│   │   │   │   │   ├── BugAttachments.tsx      # Bug file attachments
│   │   │   │   │   ├── BugBadges.tsx
│   │   │   │   │   ├── BugBasicInfo.tsx
│   │   │   │   │   ├── BugDeleteDialog.tsx
│   │   │   │   │   ├── BugEnvironment.tsx
│   │   │   │   │   ├── BugExpectedActual.tsx
│   │   │   │   │   ├── BugHeader.tsx
│   │   │   │   │   ├── BugLabels.tsx
│   │   │   │   │   ├── BugPeople.tsx
│   │   │   │   │   ├── BugResolution.tsx
│   │   │   │   │   ├── BugStepsToReproduce.tsx
│   │   │   │   │   ├── BugTimeline.tsx
│   │   │   │   │   ├── ErrorState.tsx
│   │   │   │   │   └── LoadingState.tsx
│   │   ├── BugDetails.tsx             # Bug details page
│   │   │   ├── ChatPage.tsx           # Chat page
│   │   │   ├── dashboard/             # Dashboard components
│   │   │   │   ├── CreateProjectDialog.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   └── ProjectCard.tsx
│   │   │   ├── Dashboard.tsx          # Main dashboard page
│   │   │   ├── feature-details/       # Feature details page
│   │   │   │   ├── components/
│   │   │   │   │   ├── FeatureAcceptanceCriteria.tsx
│   │   │   │   │   ├── FeatureHeader.tsx
│   │   │   │   │   ├── FeatureHeaderBack.tsx
│   │   │   │   │   ├── FeatureInfoCard.tsx
│   │   │   │   │   ├── FeaturePrioritySelector.tsx
│   │   │   │   │   ├── FeatureTabs.tsx
│   │   │   │   │   ├── FeatureTechnicalDetails.tsx
│   │   │   │   │   ├── LoadingState.tsx
│   │   │   │   │   ├── TestCasesContent.tsx
│   │   │   │   │   └── TestCasesToolbar.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useFeatureBugs.ts
│   │   │   │   │   ├── useFeatureData.ts
│   │   │   │   │   ├── useFeatureDetailsState.ts
│   │   │   │   │   └── useTestCaseFilters.ts
│   │   │   │   ├── AITestCaseGenerationDialog.tsx
│   │   │   │   ├── BugsTab.tsx
│   │   │   │   ├── CreateTestCaseDialog.tsx
│   │   │   │   ├── EditTestCaseDialog.tsx
│   │   │   │   ├── StatsGrid.tsx
│   │   │   │   └── TestCaseCard.tsx
│   │   │   ├── FeatureDetails.tsx     # Feature details page
│   │   │   ├── Index.tsx              # Landing page
│   │   │   ├── NotFound.tsx           # 404 page
│   │   │   ├── profile/               # Profile page components
│   │   │   │   ├── AccountInfoCard.tsx
│   │   │   │   ├── PersonalInfoTab.tsx
│   │   │   │   └── UserAvatarCard.tsx
│   │   │   ├── Profile.tsx            # User profile page
│   │   │   ├── project-details/       # Project details page
│   │   │   │   ├── components/
│   │   │   │   │   ├── FeaturesContent.tsx
│   │   │   │   │   ├── FeaturesToolbar.tsx
│   │   │   │   │   ├── LoadingState.tsx
│   │   │   │   │   ├── ProjectHeader.tsx
│   │   │   │   │   └── ProjectTabs.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useBugHandlers.ts
│   │   │   │   │   ├── useFeatureFilters.ts
│   │   │   │   │   ├── useFeatureFiltersState.ts
│   │   │   │   │   └── useProjectData.ts
│   │   │   │   ├── AIGenerationDialog.tsx
│   │   │   │   ├── BugTab.tsx
│   │   │   │   ├── CreateBugDialog.tsx
│   │   │   │   ├── CreateFeatureDialog.tsx
│   │   │   │   ├── EditBugDialog.tsx
│   │   │   │   ├── EditFeatureDialog.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── FeatureCard.tsx
│   │   │   │   ├── FeaturesTable.tsx
│   │   │   │   ├── ShareProjectDialog.tsx
│   │   │   │   ├── StatusDropdown.tsx
│   │   │   │   └── TestCasesPage.tsx
│   │   │   └── ProjectDetails.tsx     # Project details page
│   │   ├── services/                  # API service layer
│   │   │   ├── api.ts                 # Base API configuration & interceptors
│   │   │   ├── api.test.ts            # API tests
│   │   │   ├── admin.service.ts       # Admin API calls
│   │   │   ├── auth.service.ts        # Authentication API calls
│   │   │   ├── bug.service.ts         # Bug API calls
│   │   │   ├── feature.service.ts     # Feature API calls
│   │   │   ├── project.service.ts     # Project API calls
│   │   │   ├── test-case.service.ts   # Test case API calls
│   │   │   └── user.service.ts        # User API calls
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── use-auth.ts            # Authentication hook
│   │   │   ├── use-mobile.tsx         # Mobile detection hook
│   │   │   ├── use-toast.ts           # Toast notifications hook
│   │   │   ├── useBug.ts              # Single bug hook
│   │   │   ├── useBugs.ts             # Bugs management hook
│   │   │   ├── useFeatures.ts         # Features management hook
│   │   │   ├── useNavigation.ts       # Navigation utilities
│   │   │   ├── useProjects.ts         # Projects management hook
│   │   │   ├── useProjectTestCases.ts # Project-level test cases hook
│   │   │   ├── useTestCases.ts        # Test cases management hook
│   │   │   └── useUserProfile.ts      # User profile hook
│   │   ├── types/                     # TypeScript type definitions
│   │   │   ├── auth.ts                # Authentication types
│   │   │   ├── bug.ts                 # Bug types
│   │   │   ├── feature.ts             # Feature types
│   │   │   ├── project.ts             # Project types
│   │   │   ├── test-case.ts           # Test case types
│   │   │   └── user.ts                # User types
│   │   ├── utils/                     # Utility functions
│   │   │   ├── admin-helpers.ts       # Admin utilities
│   │   │   ├── array-helpers.ts       # Array manipulation
│   │   │   ├── auth-helpers.ts        # Auth utilities
│   │   │   ├── bug-helpers.tsx        # Bug utilities
│   │   │   ├── feature-helpers.ts     # Feature utilities
│   │   │   ├── logger.ts              # Logging utilities
│   │   │   ├── navigation.ts          # Navigation helpers
│   │   │   ├── test-case-helpers.ts   # Test case utilities
│   │   │   └── user-helpers.ts        # User utilities
│   │   ├── config/                    # Configuration files
│   │   │   └── routes.tsx             # Route definitions
│   │   ├── layouts/                   # Layout components
│   │   │   └── AppLayout.tsx          # Main application layout
│   │   ├── lib/                       # Library utilities
│   │   │   └── utils.ts               # General utility functions (cn, etc.)
│   │   ├── App.tsx                    # Root App component
│   │   ├── main.tsx                   # Application entry point
│   │   ├── index.css                  # Global styles
│   │   └── vite-env.d.ts             # Vite type definitions
│   ├── public/                        # Static assets
│   ├── package.json                   # Frontend dependencies
│   └── vite.config.ts                 # Vite configuration
│
└── supabase_vector_migration.sql      # Supabase vector database schema
```

### System Architecture Layers

The QBrain system is built on 4 core layers that work together to provide intelligent SRS analysis:

#### 1. **Ingestion Layer** (`backend/ai/ingestion/`)
   - **Purpose**: Process and prepare documents for AI analysis
   - **Components**:
     - `documentParser.js`: Extract text from PDF/TXT files (Google Document AI or pdf-parse)
     - `embeddings.js`: Convert text chunks to vector embeddings (OpenAI text-embedding-3-small)
   - **Output**: Vector embeddings stored in Supabase

#### 2. **Retrieval Layer** (`backend/ai/retrieval/`)
   - **Purpose**: Find relevant context from SRS documents
   - **Components**:
     - `retrievalCore.js`: Execute 8 parallel semantic searches
     - `sectionsCore.js`: Group chunks by SRS sections, analyze coverage
     - `retrievalStrategies.js`: Advanced retrieval strategies
   - **Output**: Ranked, weighted context chunks organized by sections

#### 3. **Reasoning Layer** (`backend/ai/reasoning/`)
   - **Purpose**: AI-powered analysis and generation
   - **Components**:
     - `featureExtraction.js`: Extract features from SRS using RAG
     - `testCaseGeneration.js`: Generate test cases for features
     - `gherkinConversion.js`: Convert test cases to Gherkin format
     - `sectionMatching.js`: Match features to SRS sections
     - `jsonUtils.js`: Parse and validate LLM JSON responses
   - **Output**: Structured features and test cases with metadata

#### 4. **Config Layer** (`backend/ai/config/`)
   - **Purpose**: Centralized AI configuration
   - **Components**:
     - `llmClient.js`: LLM client factory (OpenAI, etc.)
     - `models.config.js`: Model configurations (GPT-4o-mini, embeddings)
     - `constants.js`: 8 comprehensive SRS queries with weights
   - **Output**: Configured AI clients ready for use

---

## 🤖 How RAG System Works

### 📚 Overview

QBrain uses **RAG (Retrieval Augmented Generation)** - a sophisticated AI architecture that combines vector search with LLM reasoning to provide accurate, context-aware responses based on your project's SRS documents.

Instead of relying solely on LLM knowledge, the system retrieves relevant information from your project's SRS documents, augments the prompt with this context, and generates responses using LLM based on the retrieved context.

### 🔄 Basic RAG Workflow

```
User Query/Request
    ↓
1. Query Expansion (expand related terms)
   │   Add synonyms and related terms for better retrieval
    ↓
2. Generate Query Embedding (text-embedding-3-small)
   │   Convert query text to 1536-dimensional vector
    ↓
3. Vector Similarity Search (Supabase + pgvector)
   │   Semantic search in vector database
   │   Using cosine similarity to find similar chunks
    ↓
4. Retrieve Top K Relevant Chunks
   │   Get the most relevant text chunks from SRS
    ↓
5. Weight & Rank Chunks (by category, priority, relevance)
   │   Apply category weights and prioritize important chunks
    ↓
6. Build Context from Retrieved Chunks
   │   Combine chunks into coherent context string
    ↓
7. Create Adaptive Prompt (context + instructions)
   │   Build prompt with context and task instructions
    ↓
8. Send to LLM (GPT-4o-mini with dynamic temperature)
   │   Generate response using AI model
    ↓
9. Generate & Return Response
   │   Return final answer to user
```

### 🔍 Detailed RAG Architecture

#### 1️⃣ **Document Ingestion Layer**

```
📄 SRS Document Upload
    ↓
📖 Text Extraction
   - Google Document AI (OCR support)
   - OR pdf-parse (fallback)
    ↓
✂️ Intelligent Chunking
   - Size: 2000 characters
   - Overlap: 300 characters (preserve context)
   - Method: RecursiveCharacterTextSplitter
    ↓
🔢 Embedding Generation
   - Model: text-embedding-3-small
   - Dimensions: 1536
   - Normalization: Yes (better similarity)
   - Batch processing for efficiency
    ↓
💾 Vector Storage (Supabase + pgvector)
   - Table: project_vectors
   - Index: IVFFlat (fast similarity search)
   - Metadata: projectId, sectionId, etc.
```

**Key Files:**
- `backend/ai/ingestion/documentParser.js` - PDF/TXT parsing
- `backend/ai/ingestion/embeddings.js` - Embedding generation
- `backend/vector/vectorStore.js` - Vector database operations

---

#### 2️⃣ **Comprehensive Retrieval System**

**The Magic of 8 Parallel Queries:**

Instead of a single search query, QBrain uses **8 specialized parallel queries** that target different semantic areas of the SRS document to ensure comprehensive coverage and maximum feature discovery:

```javascript
COMPREHENSIVE_SRS_QUERIES = [
  {
    query: "functional requirement feature shall must system behavior use case",
    category: "FUNCTIONAL",
    weight: 1.0  // Highest priority
  },
  {
    query: "workflow process step procedure lifecycle state transition",
    category: "WORKFLOW",
    weight: 0.9
  },
  {
    query: "interface user interface UI API integration",
    category: "INTERFACE",
    weight: 0.8
  },
  {
    query: "quality performance security usability reliability",
    category: "QUALITY",
    weight: 0.8
  },
  {
    query: "constraint assumption dependency limitation restriction rule",
    category: "CONSTRAINT",
    weight: 0.5  // Lower priority
  },
  {
    query: "data dictionary field table column attribute",
    category: "DATA",
    weight: 0.7
  },
  {
    query: "report document format output statement",
    category: "REPORT",
    weight: 0.5
  },
  {
    query: "notification alert message communication email SMS",
    category: "NOTIFICATION",
    weight: 0.85
  }
]
```

**Retrieval Process:**

```
1. Execute 8 Queries in PARALLEL (Promise.all)
   │   All queries run simultaneously for maximum efficiency
    ↓
2. For Each Query:
   - Expand query terms (add synonyms)
   - Convert to embedding vector
   - Search vector store (cosine similarity)
   - Retrieve top K chunks (default: 5-7 per query)
   - Enrich with category & weight metadata
    ↓
3. Merge All Results (8 queries × 5 chunks = 40 chunks)
   │   Combine all retrieved chunks from all queries
    ↓
4. Deduplication
   - Hash by first 100 characters
   - Remove duplicate chunks
   - Keep highest relevance version
    ↓
5. Category-Based Weighting
   - FUNCTIONAL: weight 1.0 (highest priority)
   - WORKFLOW: weight 0.9
   - NOTIFICATION: weight 0.85
   - INTERFACE/QUALITY: weight 0.8
   - DATA: weight 0.7
   - CONSTRAINT/REPORT: weight 0.5 (lower priority)
    ↓
6. Sort by Adjusted Relevance
   adjustedRelevance = baseRelevance × categoryWeight
    ↓
7. Group by SRS Sections
   - Extract section numbers (e.g., "3.2.1")
   - Group chunks by section
   - Track section coverage
```

**Why 8 Queries?**

- **Better Coverage**: Single query might miss important information
- **Semantic Diversity**: Each query targets different aspect
- **Weighted Results**: Priority-based ranking (FUNCTIONAL > CONSTRAINT)
- **Section Awareness**: Maintains document structure

**Key Files:**
- `backend/ai/retrieval/retrievalCore.js` - Core retrieval logic
- `backend/ai/config/constants.js` - 8 query definitions
- `backend/ai/retrieval/sectionsCore.js` - Section grouping

---

#### 3️⃣ **Feature Extraction Workflow**

```
1. Upload SRS Document
   │   User uploads PDF or TXT file
    ↓
2. Process Document (Ingestion Layer)
   │   Extract text, chunk, and generate embeddings
    ↓
3. Comprehensive Retrieval (8 parallel queries)
   │   Execute 8 specialized queries simultaneously
   - Gets 40+ chunks (5 per query)
   - Deduplicates to ~25-30 unique chunks
    ↓
4. Group Chunks by SRS Sections
   │   Organize chunks by document structure
   - Extract section numbers: "3.2.1", "4.5.2", etc.
   - Create section-based context
    ↓
5. Build Context String
   │   Format chunks into structured context
   Format:
   [Section 3.2.1]
   chunk text...
   
   [Section 4.5.2]
   chunk text...
   
   [Other Content]
   ungrouped chunks...
    ↓
6. Create Adaptive Prompt (High-Recall Mode)
   │   Build prompt optimized for comprehensive extraction
   - Instructions for comprehensive extraction
   - JSON output format
   - Feature type classification
   - Acceptance criteria generation
    ↓
7. Call LLM (GPT-4o-mini, temperature: 0.3)
   │   Generate features using AI
   - Low temperature for consistent extraction
   - JSON mode for structured output
    ↓
8. Parse JSON Response
   │   Extract and validate feature data
   - Extract features array
   - Validate structure
    ↓
9. Enhance Features
   │   Add metadata and scores to features
   - Match chunks to features (keyword matching)
   - Calculate relevance scores
   - Extract matched sections
   - Generate reasoning text
   - Calculate ranking scores
    ↓
10. Clean & Deduplicate
    │   Remove duplicates and filter low-quality features
    - Remove duplicates (normalize names)
    - Filter low-quality features
    - Aggregate data fields into data models
    - Remove infrastructure-only features
    ↓
11. Section Coverage Analysis
    │   Analyze which SRS sections were covered
    - Calculate coverage percentage
    - Identify missing sections
    - Generate recommendations
    ↓
12. Save to MongoDB
    │   Persist features to database
```

**Key Files:**
- `backend/ai/reasoning/featureExtraction.js` - Main extraction logic
- `backend/ai/reasoning/prompts/index.js` - Prompt templates

---

#### 4️⃣ **Test Case Generation Workflow**

```
1. Select Feature
   │   User selects a feature to generate tests for
    ↓
2. Context Retrieval Strategy
   │   Choose optimal retrieval method based on feature
   
   IF feature has matchedSections:
      → Retrieve from specific sections (section-aware)
   ELSE IF useComprehensiveRetrieval:
      → Use 8-query comprehensive retrieval
   ELSE:
      → Query by feature description
    ↓
3. Feature-Type-Specific Prompt
   │   Create prompt optimized for feature type
   
   FUNCTIONAL → Focus on use cases, user actions
   DATA → Focus on data validation, CRUD operations
   WORKFLOW → Focus on state transitions, steps
   QUALITY → Focus on performance, security tests
   NOTIFICATION → Focus on delivery, content verification
    ↓
4. Build Context String
   │   Combine retrieved chunks into context
   - Include section references
   - Combine all retrieved chunks
    ↓
5. Call LLM (GPT-4o-mini, temperature: 0.3, JSON mode)
   │   Generate comprehensive test cases
   - Generate happy path scenarios
   - Generate negative test cases
   - Generate edge cases
   - Assign priorities (P0, P1, P2, P3)
    ↓
6. Parse & Validate Test Cases
   │   Extract and validate test case structure
    ↓
7. Enhance Test Cases
   │   Add metadata and enrich test cases
   - Link to feature
   - Add section references
   - Calculate relevance scores
    ↓
8. Generate Gherkin Format (AI or rule-based)
   │   Convert to BDD format
   - Given-When-Then structure
   - Feature, Scenario, Steps
    ↓
9. Save to MongoDB
   │   Persist test cases to database
    ↓
10. Store in Vector Store (for chatbot)
    │   Store embeddings for future retrieval
    - Embed test case content
    - Add metadata (featureId, priority, etc.)
```

**Key Files:**
- `backend/ai/reasoning/testCaseGeneration.js` - Test case generation
- `backend/ai/reasoning/gherkinConversion.js` - Gherkin conversion

---

#### 5️⃣ **Chatbot RAG Workflow**

```
1. User Question
   │   User asks a question about the SRS
    ↓
2. Conversation History (Optional)
   │   Use previous conversation for context
   - Last 10 messages
   - Maintains context across questions
    ↓
3. Query Expansion & Variations
   │   Enhance query for better retrieval
   - Expand query with synonyms
   - Create 3 query variations
   - Add category detection
    ↓
4. Multi-Query Retrieval
   │   Retrieve from multiple query variations
   - Execute all 3 variations
   - Retrieve nResults × 2 chunks (for deduplication)
   - Deduplicate by text hash
    ↓
5. Category-Based Weighting
   │   Apply weights based on question category
   - Detect question category
   - Apply category weight
   - Boost priority-based chunks (High > Medium > Low)
   - Boost critical test cases
    ↓
6. Sort & Filter
   │   Rank and select best chunks
   - Sort by adjusted relevance
   - Prioritize critical tests
   - Take top nResults chunks
    ↓
7. Build Context with Metadata
   │   Format context with rich metadata
   Format:
   [Section: 3.2.1 | Feature: Login | Priority: High]
   chunk content...
   
   [Section: 4.5.2 | Test Case: Verify Password]
   test case content...
    ↓
8. Dynamic Temperature Selection
   │   Adjust creativity based on question type
   - Precise questions → 0.6 (more accurate)
   - Explanatory questions → 0.8 (more natural)
   - Default → 0.8 (balanced, friendly)
    ↓
9. Build Prompt with History
   │   Create comprehensive prompt
   - System prompt (SRS context rules)
   - User prompt (question + history + context)
    ↓
10. Call LLM (GPT-4o-mini)
    │   Generate conversational response
    - Generate natural, conversational response
    - Cite section numbers
    - Reference specific features/test cases
    ↓
11. Return Response
    │   Return answer to user
```

**Key Features:**
- ✅ **Context-Aware**: Uses project-specific SRS content
- ✅ **History Support**: Maintains conversation context
- ✅ **Section Citations**: References specific SRS sections
- ✅ **Category Detection**: Optimizes retrieval by question type
- ✅ **Weighted Results**: Prioritizes important information

**Key Files:**
- `backend/ai/chatbot/query.js` - Chatbot RAG logic
- `backend/ai/rag/query.js` - Simple RAG query handler

---

### 🎯 Key Components Explained

#### **Vector Store (Supabase + pgvector)**

```javascript
// Similarity Search Process
1. Query Text → Embedding Vector (1536 dimensions)
2. Cosine Similarity Search in PostgreSQL
3. Filter by projectId (project isolation)
4. Return top K most similar chunks
```

**Why Supabase + pgvector?**
- ✅ Fast similarity search (IVFFlat index)
- ✅ PostgreSQL reliability
- ✅ Project-scoped filtering
- ✅ Metadata support (JSONB)

#### **Embedding Model (text-embedding-3-small)**

- **Dimensions**: 1536
- **Cost**: $0.02 per 1M tokens (very cheap!)
- **Quality**: Excellent for semantic search
- **Normalization**: Yes (improves cosine similarity)

#### **LLM Model (GPT-4o-mini)**

- **For Reasoning**: temperature 0.3 (consistent, accurate)
- **For Chatbot**: temperature 0.6-0.8 (natural, friendly)
- **Cost**: $0.15 per 1M input tokens
- **JSON Mode**: Enabled for structured outputs

---

### 📊 Performance Optimizations

1. **Parallel Queries**: 8 queries executed simultaneously
2. **Batch Embeddings**: Generate embeddings in batches
3. **Caching**: Vector store caches embeddings
4. **Deduplication**: Prevents duplicate chunks
5. **Weighted Ranking**: Prioritizes important information
6. **Section Grouping**: Organized context structure

---

### 🔐 Project Isolation

Each project has isolated vector storage:
- All chunks tagged with `projectId`
- Similarity search filtered by `projectId`
- No cross-project data leakage
- Secure multi-tenant architecture

### Test Case Generation Workflow

```
1. Select Feature
   ↓
2. Retrieve Context:
   - From matched sections (if available)
   - OR comprehensive retrieval
   - OR feature description-based search
   ↓
3. Build Feature-Type-Specific Prompt
   ↓
4. Call LLM (GPT-4o-mini, JSON mode)
   ↓
5. Generate Test Cases
   ↓
6. Enhance & Validate
   ↓
7. Save to MongoDB
   ↓
8. Generate Gherkin (AI or rule-based)
   ↓
9. Store in Vector Store (for chatbot)
```

### Key AI Components

#### 1. Embeddings (`ai/ingestion/embeddings.js`)
- **Model**: `text-embedding-3-small` (1536 dimensions)
- **Cost**: $0.02 per 1M tokens
- **Features**:
  - Text cleaning before embedding
  - Vector normalization for better cosine similarity
  - Batch processing support
  - Retry mechanism with exponential backoff

#### 2. Comprehensive Retrieval (`ai/retrieval/retrievalCore.js`)
- **8 Parallel Queries** covering all feature types
- **Query Expansion** for better recall
- **Deduplication** based on text content
- **Section Grouping** for organized context

#### 3. Feature Extraction (`ai/reasoning/featureExtraction.js`)
- Retrieves comprehensive context (8 categories)
- Organizes context by sections
- Creates adaptive prompts (high-recall mode)
- Enhances features with metadata and scores
- Analyzes section coverage

#### 4. Test Case Generation (`ai/reasoning/testCaseGeneration.js`)
- Feature-type-specific prompts
- Section-aware context retrieval
- JSON mode for structured output
- Automatic Gherkin conversion

#### 5. Vector Store (`vector/vectorStore.js`)
- Supabase + pgvector for fast similarity search
- Stores embeddings with metadata
- Project-scoped filtering
- Automatic embedding generation for new documents

### LangChain Integration

LangChain provides:
- **ChatOpenAI**: LLM management and invocation
- **OpenAIEmbeddings**: Embedding generation
- **PromptTemplate**: Prompt management and formatting
- **RetrievalChain**: RAG chain orchestration
- **SupabaseVectorStore**: Vector store integration
- **RecursiveCharacterTextSplitter**: Intelligent text chunking

---

## 🚀 Installation

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** (local or Atlas cloud)
- **Supabase** account (for vector storage)
- **OpenAI API** key
- **Google Cloud** account (optional, for Document AI)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/QBrain.git
cd QBrain
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your actual API keys:
# - OPENAI_API_KEY (required)
# - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (required)
# - MONGO_URI (required)
# - JWT_SECRET (required)
# - GCP credentials (optional, for Document AI)
# - Email service credentials (optional)
```

**Quick Setup**: If you want to use shared API keys (for development/testing only):
1. Open `backend/.env.example`
2. Replace placeholder values with actual API keys
3. Copy to `.env`: `cp .env.example .env`
4. Adjust any settings as needed

⚠️ **Security Note**: For production, use separate API keys per environment and never commit `.env` files.

### 3. Frontend Setup

```bash
cd frontend
npm install

# Copy environment template
cp .env.example .env

# Edit .env if needed (default usually works):
# VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Database Setup

#### MongoDB

```bash
# Start MongoDB locally (if using local instance)
mongod

# Or use MongoDB Atlas cloud service
# Update MONGO_URI in .env with your Atlas connection string
```

#### Supabase Vector Store

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Enable pgvector extension:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

3. Run the migration script (`supabase_vector_migration.sql`):
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
CREATE INDEX ON project_vectors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create function for similarity search
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

# Start backend (with PM2 or similar)
cd backend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 📖 Usage

### 1. Create Account
1. Navigate to sign-up page
2. Enter name, email, and password
3. Verify email address (check inbox)
4. Log in with credentials

### 2. Create Project
1. Click "Create Project" button
2. Enter project name and description
3. (Optional) Upload SRS document (PDF or TXT)
4. Project is created and ready

### 3. Upload & Process SRS
1. Navigate to project details
2. Click "Upload SRS" if not uploaded during creation
3. Select PDF or TXT file
4. Wait for processing (automatic chunking and embedding)
5. Status updates to "Processed" when complete

### 4. Extract Features
1. Click "Generate Features (AI)" button
2. Wait for AI processing (30-60 seconds)
3. Review extracted features with:
   - Feature types (FUNCTIONAL, DATA, REPORT, etc.)
   - Priority levels
   - Matched SRS sections
   - Confidence scores
   - Section coverage analysis

### 5. Generate Test Cases
1. Select a feature
2. Click "Generate Test Cases (AI)" button
3. Review AI-generated test cases:
   - Happy path scenarios
   - Negative test cases
   - Edge cases
   - Priority assignments
4. Test cases are automatically saved with Gherkin format

### 6. Use Chatbot
1. Navigate to project chatbot
2. Ask questions about the SRS
3. Get accurate answers based on document context
4. Answers reference specific SRS sections

### 7. Manage Bugs
1. Navigate to Bugs tab in project
2. Create bugs linked to features
3. Track bug status and assignments
4. View bug analytics

---

## 📖 Documentation

### Comprehensive Documentation

For detailed explanations of the AI system, see:

- **[AI_SYSTEM_EXPLANATION.md](./AI_SYSTEM_EXPLANATION.md)** - Complete AI system documentation (Arabic)
  - Full workflow explanations
  - Component details
  - Technical deep dives
  - Best practices

- **[AI_QUICK_GUIDE.md](./AI_QUICK_GUIDE.md)** - Quick reference guide (Arabic)
  - Key concepts
  - Quick workflows
  - Important notes
  - Cost information

---

## 📊 Performance Metrics

### Processing Times
- **SRS Processing**: 30-60 seconds (depending on document size)
- **Feature Extraction**: 30-60 seconds per SRS (with 8 parallel queries)
- **Test Case Generation**: 10-20 seconds per feature
- **Gherkin Conversion**: 2-5 seconds per test case

### Accuracy & Coverage
- **Section Coverage**: 75-85% average coverage
- **Feature Extraction Accuracy**: High (validated by section matching)
- **Test Case Quality**: Comprehensive (happy path + negative + edge cases)

### Cost Estimates (OpenAI API)
- **Embeddings** (text-embedding-3-small): $0.02 per 1M tokens
- **GPT-4o-mini**: $0.15 per 1M input tokens
- **Average Cost per SRS**: $0.10 - $0.50 (depending on size)
- **Cost per Feature Extraction**: ~$0.05 - $0.15
- **Cost per Test Case Generation**: ~$0.01 - $0.03

---

## 🔒 Security

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ HTTP-only cookies for token storage
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Email verification required
- ✅ Password reset with secure tokens

### Data Security
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Environment variable protection

### API Security
- ✅ Rate limiting (recommended in production)
- ✅ Request size limits (500MB for file uploads)
- ✅ File type validation (PDF/TXT only)
- ✅ Row Level Security (RLS) on Supabase

### Best Practices
- ✅ Never commit `.env` files
- ✅ Use strong JWT secrets
- ✅ Rotate API keys regularly
- ✅ Monitor API usage
- ✅ Implement logging and monitoring

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

### Manual Testing Checklist
- [ ] User authentication (sign up, sign in, email verification)
- [ ] Project creation and management
- [ ] SRS upload and processing
- [ ] Feature extraction
- [ ] Test case generation
- [ ] Gherkin conversion
- [ ] Chatbot queries
- [ ] Bug tracking

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow existing code style
- Add JSDoc comments for complex functions

### Code Style
- Use ESLint and Prettier
- Follow existing naming conventions
- Keep functions focused and small
- Add error handling
- Include input validation

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
- [Google Document AI](https://cloud.google.com/document-ai) - For PDF processing
- [Vercel](https://vercel.com/) - For deployment inspiration




---




