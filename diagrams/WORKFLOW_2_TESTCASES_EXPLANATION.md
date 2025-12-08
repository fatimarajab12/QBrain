@startuml
title Workflow 2 - Generate Test Cases for Feature (High-Level, A4-Friendly)

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
participant "API Layer\n(Test Cases Controller)" as API
participant "TestCase Service" as Service
participant "MongoDB\n(Features + Test Cases)" as MongoDB
participant "Context Retrieval\n(RAG)" as ContextRetrieval
participant "Prompt Builder" as PromptBuilder
participant "LLM\n(GPT-4o-mini)" as LLM
participant "Test Case Enhancer" as Enhancer

User -> Frontend : Click "Generate Test Cases"
Frontend -> API : POST /test-cases/feature/:id
API -> Service : Validate feature & fetch context

Service -> MongoDB : Get feature data + matched SRS sections
MongoDB --> Service : Feature + context

Service -> ContextRetrieval : Retrieve relevant SRS & feature chunks
ContextRetrieval --> Service : Relevant chunks

Service -> PromptBuilder : Build feature-type-specific prompt
PromptBuilder --> Service : Prompt ready

Service -> LLM : Generate test cases (context + prompt)
LLM --> Service : Test cases JSON

Service -> Enhancer : Enhance test cases (validate, defaults, priorities)
Enhancer --> Service : Enhanced test cases

Service -> MongoDB : Save test cases & embeddings
MongoDB --> Service : Confirmation

Service --> API : Return test cases
API --> Frontend : Display test case list
Frontend --> User : User sees AI-generated test cases

@enduml
