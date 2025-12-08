@startuml
title Workflow 1 - Generate Features from SRS (High-Level, A4-Friendly)

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
participant "API Layer\n(Features Controller)" as API
participant "Feature Service" as FeatureService
participant "SRS Type Detection" as SRSDetection
participant "Context Retrieval\n(RAG)" as ContextRetrieval
participant "Prompt Builder" as PromptBuilder
participant "LLM\n(GPT-4o-mini)" as LLM
participant "Feature Enhancer" as Enhancer
participant "Database\n(MongoDB + Supabase)" as Database

User -> Frontend : Click "Generate Features"
Frontend -> API : POST /features/projects/:id
API -> FeatureService : Validate project & SRS

FeatureService -> SRSDetection : Detect SRS type
SRSDetection --> FeatureService : SRS type + confidence

FeatureService -> ContextRetrieval : Retrieve relevant SRS chunks
ContextRetrieval --> FeatureService : Relevant chunks

FeatureService -> PromptBuilder : Build adaptive prompt
PromptBuilder --> FeatureService : Prompt ready

FeatureService -> LLM : Extract features (context + prompt)
LLM --> FeatureService : Features JSON

FeatureService -> Enhancer : Enhance features (score, type, section mapping)
Enhancer --> FeatureService : Enhanced features

FeatureService -> Database : Save features & embeddings
Database --> FeatureService : Confirmation

FeatureService --> API : Return features
API --> Frontend : Display feature list
Frontend --> User : User sees AI-generated features

@enduml
