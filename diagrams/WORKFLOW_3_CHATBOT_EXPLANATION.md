# Workflow 3 - Chatbot Query (Question Answering)

## Overview
This workflow enables users to ask questions about their project and receive AI-generated answers based on SRS, features, and test cases.

## Components & Responsibilities

### **Frontend (Chat Interface)**
- **Responsibility**: User interaction for questions
- **Input**: User types question
- **Output**: Displays AI answer with citations

### **Backend API (AI Controller)**
- **Responsibility**: Handle query request
- **Input**: Question + Project ID
- **Output**: Returns AI answer

### **RAG Query Service**
- **Responsibility**: Orchestrate question answering
- **Output**: Formatted answer

### **Query Expansion**
- **Responsibility**: Enhance query for better retrieval
- **Action**: Adds related terms and synonyms
- **Output**: Expanded query

### **Vector Retriever (LangChain)**
- **Responsibility**: Setup similarity search
- **Configures**: Supabase connection, project filter
- **Output**: Retriever instance

### **Retrieval Chain (LangChain)**
- **Responsibility**: Combine retrieval + LLM
- **Steps**: Retrieve → Combine → Generate answer
- **Output**: Complete answer chain

### **Supabase**
- **Responsibility**: Search across all project content
- **Searches**: SRS chunks, features, test cases
- **Output**: Most relevant chunks

### **OpenAI LLM (GPT-4o-mini)**
- **Responsibility**: Generate contextual answer
- **Input**: Retrieved context + question + system prompt
- **Output**: Answer with section citations

## Workflow Steps

1. **User asks question** → Frontend sends question
2. **Query expansion** → Enhance query terms
3. **Setup retriever** → Configure vector search
4. **Create chain** → Combine retrieval + LLM
5. **Retrieve context** → Get relevant chunks from Supabase
6. **Generate answer** → LLM creates answer with citations
7. **Response** → User sees answer in chat

## Final Output
- **User**: AI answer with section citations (e.g., "As per section 3.2.1...")
- **System**: Answer based on project-specific context

