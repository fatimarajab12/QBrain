@startuml
title Workflow 5 - Section Matching Analysis (High-Level, A4-Friendly)

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
participant "Section Matching Service" as MatchingService
participant "Context Retrieval\n(RAG)" as ContextRetrieval
participant "Analysis Prompt Builder" as PromptBuilder
participant "OpenAI GPT-4o" as LLM
participant "Supabase\n(pgvector)" as Supabase

User -> Frontend : Request section analysis (section1 + section2)
Frontend -> API : POST /sections/match
API -> MatchingService : Analyze section match

MatchingService -> ContextRetrieval : Retrieve context for Section1
MatchingService -> ContextRetrieval : Retrieve context for Section2
ContextRetrieval -> Supabase : Similarity search for Section1
ContextRetrieval -> Supabase : Similarity search for Section2
Supabase --> ContextRetrieval : Relevant chunks
ContextRetrieval --> MatchingService : Combined section contexts

MatchingService -> PromptBuilder : Build analysis prompt
PromptBuilder --> MatchingService : Prompt ready

MatchingService -> LLM : Perform section analysis (context + prompt)
LLM --> MatchingService : JSON analysis report

MatchingService --> API : Return structured analysis
API --> Frontend : Display analysis report
Frontend --> User : User views section match and recommendations

@enduml
