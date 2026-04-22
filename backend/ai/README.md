# QBrain AI System

The AI system is the core intelligence layer of QBrain, implementing a sophisticated RAG (Retrieval Augmented Generation) architecture for analyzing SRS documents, extracting features, and generating test cases.

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Directory Structure](#-directory-structure)
- [Core Components](#-core-components)
- [How It Works](#-how-it-works)
- [Configuration](#-configuration)
- [Usage Examples](#-usage-examples)
- [Workflows](#-workflows)
- [Best Practices](#-best-practices)

---

## 🎯 Overview

The AI system provides:

- **RAG (Retrieval Augmented Generation)**: Context-aware AI responses based on project SRS documents
- **Feature Extraction**: Automatically extract features from SRS documents using AI
- **Test Case Generation**: Generate comprehensive test cases for extracted features
- **Chatbot**: Intelligent Q&A system that answers questions about SRS documents
- **Document Processing**: PDF/TXT parsing and intelligent chunking
- **Vector Embeddings**: Semantic search using OpenAI embeddings

---

## 🏗️ Architecture

### System Layers

```
┌─────────────────────────────────────────┐
│         Reasoning Layer                 │
│  (Feature Extraction, Test Generation)  │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Retrieval Layer                 │
│  (8 Parallel Queries, Section Grouping) │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Ingestion Layer                 │
│  (Document Parsing, Embedding Generation)│
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Vector Store                    │
│  (Supabase + pgvector)                  │
└─────────────────────────────────────────┘
```

### Data Flow

```
SRS Document
    ↓
Document Parser (PDF/TXT)
    ↓
Text Chunking (2000 chars, 300 overlap)
    ↓
Embedding Generation (OpenAI text-embedding-3-small)
    ↓
Vector Storage (Supabase)
    ↓
RAG Retrieval (8 parallel queries)
    ↓
Context Building
    ↓
LLM Reasoning (GPT-4o-mini)
    ↓
Results (Features/Test Cases)
```

---

## 📁 Directory Structure

```
ai/
├── config/                  # Configuration
│   ├── constants.js        # 8 comprehensive SRS queries
│   ├── llmClient.js        # LLM client factory
│   └── models.config.js    # Model configurations
│
├── ingestion/              # Document processing
│   ├── documentParser.js   # PDF/TXT parsing
│   └── embeddings.js       # Embedding generation
│
├── retrieval/              # Context retrieval
│   ├── retrievalCore.js    # Core retrieval logic
│   ├── retrievalStrategies.js # Advanced strategies
│   └── sectionsCore.js     # Section grouping & analysis
│
├── reasoning/              # AI reasoning
│   ├── featureExtraction.js      # Feature extraction
│   ├── testCaseGeneration.js     # Test case generation
│   ├── gherkinConversion.js      # Gherkin format conversion
│   ├── sectionMatching.js        # Section matching
│   ├── jsonUtils.js              # JSON parsing utilities
│   └── prompts/                  # Prompt templates
│       └── index.js
│
├── rag/                    # RAG system
│   ├── index.js
│   └── query.js            # RAG query handler
│
└── chatbot/                # Chatbot functionality
    ├── index.js
    ├── prompts.js
    ├── query.js
    └── utils.js
```

---

## 🔧 Core Components

### 1. Configuration Layer (`config/`)

#### `constants.js`

Defines the 8 comprehensive SRS queries for parallel retrieval:

```javascript
COMPREHENSIVE_SRS_QUERIES = [
  { query: "functional requirement feature shall must...", category: "FUNCTIONAL", weight: 1.0 },
  { query: "workflow process step procedure...", category: "WORKFLOW", weight: 0.9 },
  { query: "interface user interface UI API...", category: "INTERFACE", weight: 0.8 },
  { query: "quality performance security...", category: "QUALITY", weight: 0.8 },
  { query: "constraint assumption dependency...", category: "CONSTRAINT", weight: 0.5 },
  { query: "data dictionary field table...", category: "DATA", weight: 0.7 },
  { query: "report document format output...", category: "REPORT", weight: 0.5 },
  { query: "notification alert message...", category: "NOTIFICATION", weight: 0.85 }
]
```

**Why 8 Queries?**
- Comprehensive coverage of different SRS sections
- Semantic diversity ensures nothing is missed
- Weighted results prioritize important features
- Section-aware retrieval maintains document structure

#### `llmClient.js`

Factory for creating LLM clients with different configurations:

```javascript
createChatModel({ model, temperature, ... })
createProfiledChatModel(profile, options)
```

**Profiles:**
- `reasoning`: Temperature 0.3 (consistent extraction)
- `chat`: Temperature 0.7-0.8 (natural conversation)

#### `models.config.js`

Default model configurations:

```javascript
DEFAULT_CHAT_MODEL = "gpt-4o-mini"
DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small"
```

---

### 2. Ingestion Layer (`ingestion/`)

#### `documentParser.js`

Parses PDF and TXT documents:

- **Primary**: Google Document AI (high quality, OCR support)
- **Fallback**: pdf-parse (direct parsing)
- Handles large documents with automatic splitting

#### `embeddings.js`

Generates vector embeddings:

- **Model**: OpenAI text-embedding-3-small (1536 dimensions)
- **Cost**: $0.02 per 1M tokens
- **Features**:
  - Text cleaning before embedding
  - Vector normalization for better similarity
  - Batch processing support
  - Retry mechanism with exponential backoff

---

### 3. Retrieval Layer (`retrieval/`)

#### `retrievalCore.js`

Core retrieval functions:

**`getRAGContext(projectId, query, nResults)`**
- Single query retrieval
- Query expansion with synonyms
- Cosine similarity search
- Returns ranked chunks with relevance scores

**`getComprehensiveRAGContext(projectId, chunksPerQuery)`**
- Executes 8 parallel queries
- Merges and deduplicates results
- Applies category-based weighting
- Groups chunks by sections
- Returns organized context

#### `sectionsCore.js`

Section-related utilities:

**`groupChunksBySections(chunks)`**
- Extracts section numbers (e.g., "3.2.1")
- Groups chunks by primary section
- Tracks all related sections

**`analyzeSectionCoverage(features, groupedChunks)`**
- Calculates coverage percentage
- Identifies missing sections
- Generates recommendations

---

### 4. Reasoning Layer (`reasoning/`)

#### `featureExtraction.js`

Main feature extraction function:

**`generateFeaturesFromRAG(projectId, options)`**

**Process:**
1. Comprehensive retrieval (8 parallel queries)
2. Section grouping
3. Context building
4. Adaptive prompt creation
5. LLM feature extraction
6. Feature enhancement (scoring, section matching)
7. Cleaning and deduplication
8. Section coverage analysis

**Options:**
- `nContextChunks`: Number of chunks per query (default: 7)
- `model`: LLM model (default: "gpt-4o-mini")
- `useComprehensiveRetrieval`: Use 8 queries (default: true)
- `highRecallMode`: Extract borderline features (default: true)

#### `testCaseGeneration.js`

Test case generation:

**`generateTestCasesFromRAG(projectId, featureDescription, options)`**

**Process:**
1. Context retrieval (section-aware or comprehensive)
2. Feature-type-specific prompt creation
3. LLM test case generation
4. Parsing and validation
5. Enhancement and deduplication
6. Second-pass improvement (optional)

**Options:**
- `nContextChunks`: Context chunks (default: 5)
- `model`: LLM model (default: "gpt-4o-mini")
- `featureType`: Feature type for specialized prompts
- `matchedSections`: Specific sections to retrieve from
- `useComprehensiveRetrieval`: Use 8 queries

#### `gherkinConversion.js`

Converts test cases to Gherkin format:

**`convertTestCaseToGherkinWithAI(testCase, projectId, options)`**

**Process:**
1. Retrieves feature context
2. Retrieves SRS context
3. Creates Gherkin conversion prompt
4. LLM generates Gherkin format
5. Validates Gherkin syntax
6. Fallback to rule-based if AI fails

#### `sectionMatching.js`

Matches features to SRS sections using AI analysis.

#### `jsonUtils.js`

JSON parsing utilities:
- `parseJSONSafely(content)`: Robust JSON parsing
- `invokeJSONPrompt(llm, prompt, options)`: JSON mode LLM invocation
- `dedupeByKey(array, keyFn)`: Deduplication utility

#### `prompts/index.js`

Centralized prompt templates:

- `FEATURE_EXTRACTION_PROMPT_TEMPLATE`: Feature extraction prompt
- `TEST_CASE_GENERATION_PROMPT_TEMPLATE`: Test case generation prompt
- `SECTION_MATCHING_PROMPT_TEMPLATE`: Section matching prompt
- `createAdaptivePrompt({ highRecallMode })`: Adaptive prompt builder
- `createTestCasePromptByFeatureType(featureType)`: Feature-type-specific prompts

---

### 5. RAG Layer (`rag/`)

#### `query.js`

Simple RAG query handler:

**`queryRAG(projectId, question, nResults)`**

**Process:**
1. Query expansion
2. Vector similarity search
3. Context building
4. LLM response generation

Used for basic RAG queries without conversation history.

---

### 6. Chatbot Layer (`chatbot/`)

#### `query.js`

Advanced chatbot with conversation history:

**`queryChatBot(projectId, question, nResults, history, options)`**

**Features:**
- Multi-query variations for better coverage
- Category-based weighting
- Dynamic temperature selection
- Conversation history support
- Metadata-rich context building
- Priority-based chunk ranking

#### `utils.js`

Chatbot utilities:
- `expandQueryForChatBot()`: Query expansion
- `createQueryVariations()`: Multiple query variations
- `formatChatHistory()`: History formatting
- `validateHistory()`: History validation

#### `prompts.js`

Chatbot-specific prompts:
- `CHATBOT_SYSTEM_PROMPT`: System instructions
- `CHATBOT_USER_PROMPT`: User prompt template
- `CHATBOT_USER_PROMPT_WITH_HISTORY`: With history template

---

## 🔄 How It Works

### Feature Extraction Workflow

```javascript
import { generateFeaturesFromRAG } from './reasoning/featureExtraction.js';

const result = await generateFeaturesFromRAG(projectId, {
  nContextChunks: 20,
  model: 'gpt-4o-mini',
  useComprehensiveRetrieval: true,
  chunksPerQuery: 7,
  highRecallMode: true
});

// Returns:
// {
//   features: [...],
//   metadata: {
//     totalFeatures: 45,
//     featuresByType: [...],
//     coverage: { coveragePercentage: 82.5, ... },
//     totalChunksProcessed: 56,
//     sectionsProcessed: 12
//   }
// }
```

**Steps:**
1. Execute 8 parallel queries → 40+ chunks
2. Deduplicate → ~25-30 unique chunks
3. Group by sections → Organized context
4. Build adaptive prompt (high-recall mode)
5. Call LLM (temperature: 0.3, JSON mode)
6. Parse and enhance features
7. Clean and deduplicate
8. Analyze coverage
9. Return results

### Test Case Generation Workflow

```javascript
import { generateTestCasesFromRAG } from './reasoning/testCaseGeneration.js';

const testCases = await generateTestCasesFromRAG(
  projectId,
  featureDescription,
  {
    nContextChunks: 5,
    model: 'gpt-4o-mini',
    featureType: 'FUNCTIONAL',
    matchedSections: ['3.2.1', '4.5.2'],
    useComprehensiveRetrieval: false
  }
);
```

**Steps:**
1. Retrieve context from matched sections (if available)
2. OR use comprehensive retrieval
3. OR query by feature description
4. Create feature-type-specific prompt
5. Call LLM (temperature: 0.3, JSON mode)
6. Parse and validate test cases
7. Enhance with metadata
8. Second-pass improvement (optional)
9. Return test cases

### Chatbot Workflow

```javascript
import { queryChatBot } from './chatbot/query.js';

const response = await queryChatBot(
  projectId,
  question,
  5, // nResults
  history, // conversation history
  { temperature: 0.8, useDynamicTemperature: true }
);
```

**Steps:**
1. Validate conversation history
2. Detect question category
3. Create query variations (3 variations)
4. Multi-query retrieval
5. Category-based weighting
6. Sort and filter (top N chunks)
7. Build context with metadata
8. Dynamic temperature selection
9. Build prompt with history
10. Call LLM
11. Return response

---

## ⚙️ Configuration

### Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Cloud (Optional)
GCP_PROJECT_ID=your-project-id
GCP_KEY_FILE=./gcp-key.json
DOCUMENT_AI_PROCESSOR_ID=your-processor-id
DOCUMENT_AI_LOCATION=us
```

### Model Configuration

Edit `config/models.config.js` to change default models:

```javascript
export const DEFAULT_CHAT_MODEL = "gpt-4o-mini";
export const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
```

### Query Configuration

Edit `config/constants.js` to modify the 8 comprehensive queries:

```javascript
export const COMPREHENSIVE_SRS_QUERIES = [
  { query: "...", category: "FUNCTIONAL", weight: 1.0 },
  // ... modify queries, weights, categories
];
```

---

## 💡 Usage Examples

### Example 1: Extract Features from SRS

```javascript
import { generateFeaturesFromRAG } from './reasoning/featureExtraction.js';

try {
  const result = await generateFeaturesFromRAG('project123', {
    useComprehensiveRetrieval: true,
    chunksPerQuery: 7,
    highRecallMode: true
  });
  
  console.log(`Extracted ${result.features.length} features`);
  console.log(`Coverage: ${result.metadata.coverage.coveragePercentage}%`);
  
  result.features.forEach(feature => {
    console.log(`- ${feature.name} (${feature.featureType})`);
  });
} catch (error) {
  console.error('Feature extraction failed:', error.message);
}
```

### Example 2: Generate Test Cases

```javascript
import { generateTestCasesFromRAG } from './reasoning/testCaseGeneration.js';

const testCases = await generateTestCasesFromRAG(
  'project123',
  'User login feature with email and password',
  {
    featureType: 'FUNCTIONAL',
    matchedSections: ['3.2.1'],
    nContextChunks: 5
  }
);

testCases.forEach(tc => {
  console.log(`Test: ${tc.title}`);
  console.log(`Priority: ${tc.priority}`);
  console.log(`Steps: ${tc.steps.length}`);
});
```

### Example 3: Query Chatbot

```javascript
import { queryChatBot } from './chatbot/query.js';

const history = [
  { role: 'user', text: 'What are the login requirements?' },
  { role: 'assistant', text: 'Login requires email and password...' }
];

const answer = await queryChatBot(
  'project123',
  'Can users reset their password?',
  5,
  history
);

console.log(answer);
```

### Example 4: Custom Retrieval

```javascript
import { getComprehensiveRAGContext } from './retrieval/retrievalCore.js';

const result = await getComprehensiveRAGContext('project123', 5);

console.log(`Retrieved ${result.totalChunks} chunks`);
console.log(`Categories:`, Object.keys(result.byCategory));

result.chunks.forEach(chunk => {
  console.log(`[${chunk.category}] ${chunk.text.substring(0, 100)}...`);
});
```

---

## 🔄 Workflows

### Complete Feature Extraction Pipeline

```
1. User uploads SRS document
   ↓
2. documentParser.js parses PDF/TXT
   ↓
3. Text chunked (2000 chars, 300 overlap)
   ↓
4. embeddings.js generates embeddings
   ↓
5. vectorStore.js stores in Supabase
   ↓
6. User requests feature extraction
   ↓
7. retrievalCore.js executes 8 parallel queries
   ↓
8. sectionsCore.js groups by sections
   ↓
9. featureExtraction.js builds context & prompt
   ↓
10. LLM extracts features (JSON mode)
    ↓
11. Feature enhancement & scoring
    ↓
12. Cleaning & deduplication
    ↓
13. Coverage analysis
    ↓
14. Return features to user
```

### Complete Test Case Generation Pipeline

```
1. User selects feature
   ↓
2. Check if feature has matchedSections
   ↓
3. If yes: Retrieve from specific sections
   If no: Use comprehensive retrieval
   ↓
4. testCaseGeneration.js builds feature-type-specific prompt
   ↓
5. Include test case examples (few-shot learning)
   ↓
6. LLM generates test cases (JSON mode)
   ↓
7. Parse and validate JSON
   ↓
8. Deduplicate test cases
   ↓
9. Second-pass improvement (optional)
   ↓
10. gherkinConversion.js converts to Gherkin
    ↓
11. Store test cases in MongoDB
    ↓
12. Store embeddings in vector store (for chatbot)
```

---

## 📊 Best Practices

### 1. Feature Extraction

- **Use Comprehensive Retrieval**: Always use `useComprehensiveRetrieval: true` for maximum coverage
- **Enable High Recall Mode**: `highRecallMode: true` for extracting borderline features
- **Adjust Chunks Per Query**: More chunks = more context but higher cost
- **Monitor Coverage**: Check coverage percentage to ensure completeness

### 2. Test Case Generation

- **Use Matched Sections**: Provide `matchedSections` for better context
- **Specify Feature Type**: Helps generate feature-type-specific test cases
- **Include Examples**: The system uses few-shot examples automatically
- **Review Generated Cases**: Always review and refine generated test cases

### 3. Chatbot

- **Provide History**: Include conversation history for context
- **Use Dynamic Temperature**: Let the system adjust based on question type
- **Ask Specific Questions**: More specific questions get better answers
- **Reference Sections**: The chatbot can cite specific SRS sections

### 4. Performance

- **Parallel Queries**: The 8 queries run in parallel (Promise.all)
- **Batch Embeddings**: Embeddings are generated in batches when possible
- **Caching**: Vector store caches embeddings
- **Deduplication**: Always deduplicate retrieved chunks

### 5. Cost Optimization

- **Use text-embedding-3-small**: Cheapest embedding model ($0.02/1M tokens)
- **Use gpt-4o-mini**: Cheapest GPT-4 model for reasoning ($0.15/1M tokens)
- **Limit Context Chunks**: Fewer chunks = lower cost but less context
- **Cache Results**: Cache feature extraction and test generation results

---

## 🔍 Troubleshooting

### Low Feature Extraction Quality

- Increase `chunksPerQuery` (more context)
- Enable `highRecallMode: true`
- Verify SRS document was processed correctly
- Check vector store has embeddings

### Poor Test Case Generation

- Provide `matchedSections` for better context
- Ensure feature description is detailed
- Verify feature type is correct
- Check SRS context is relevant

### Chatbot Not Finding Answers

- Verify SRS document was uploaded and processed
- Check question is related to project SRS
- Provide more conversation history
- Try rephrasing the question

### High API Costs

- Reduce `chunksPerQuery`
- Use smaller context windows
- Cache frequently used results
- Monitor OpenAI API usage dashboard

---

## 📚 Related Documentation

- [Backend README](../README.md) - Overall backend documentation
- [Main README](../../README.md) - Complete RAG system documentation
- [OpenAI API Docs](https://platform.openai.com/docs) - OpenAI API reference
- [LangChain Docs](https://js.langchain.com/) - LangChain documentation
- [Supabase Docs](https://supabase.com/docs) - Supabase vector database

---

## 📄 License

MIT License - See main project LICENSE file for details.

