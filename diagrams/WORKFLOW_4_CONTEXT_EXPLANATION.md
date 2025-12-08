@startuml
title Workflow 4 - Retrieve Relevant Chunks (High-Level, A4-Friendly)

skinparam sequenceParticipantBackgroundColor #D0E7FF
skinparam sequenceParticipantBorderColor #3399FF
skinparam sequenceArrowColor #3399FF
skinparam sequenceLifeLineBorderThickness 1
skinparam sequenceArrowThickness 1.2
skinparam roundcorner 5
skinparam shadowing false
skinparam defaultFontSize 15
skinparam sequenceMessageSpacing 8
skinparam sequenceParticipantSpacing 3
skinparam sequenceLifeLineLength 100
skinparam participantPadding 15

actor User
participant "Frontend\n(Web App)" as Frontend
participant "API Layer\n(AI Controller)" as API
participant "RAG Context Service" as ContextService
participant "Query Expansion" as QueryExpansion
participant "OpenAI Embeddings\n(text-embedding-3-small)" as Embeddings
participant "Supabase\n(pgvector)" as Supabase

User -> Frontend : Request context (query + project ID)
Frontend -> API : POST /context/projects/:id
API -> ContextService : Retrieve relevant chunks

ContextService -> QueryExpansion : Expand query terms
QueryExpansion --> ContextService : Expanded query

ContextService -> Embeddings : Generate query embedding
Embeddings --> ContextService : Query vector

ContextService -> Supabase : Similarity search
Supabase --> ContextService : Top k relevant chunks

ContextService --> API : Return chunks with relevance
API --> Frontend : Display relevant chunks
Frontend --> User : User sees retrieved context

@enduml
