@startuml
title  Upload & Process SRS Document

skinparam sequenceParticipantBackgroundColor #D0E7FF
skinparam sequenceParticipantBorderColor #3399FF
skinparam sequenceActorBackgroundColor #C0E0FF
skinparam sequenceActorBorderColor #3399FF
skinparam sequenceArrowColor #3399FF
skinparam sequenceLifeLineBorderThickness 1
skinparam sequenceArrowThickness 1.2
skinparam roundcorner 5
skinparam shadowing false
skinparam defaultFontSize 11

actor User
participant "Frontend\n(Web App)" as Frontend
participant "API Layer\n(Projects Controller)" as API
participant "File Handler\n(Multer)" as Multer
participant "Document AI / TXT Parser" as DocAI
participant "Text Splitter\n(chunking)" as Splitter
participant "Embedding Service\n(OpenAI)" as Embeddings
participant "Supabase\n(Vector DB)" as Supabase
participant "MongoDB\n(Project Collection)" as MongoDB

== User Uploads SRS ==
User -> Frontend : Select PDF/TXT + Project ID
Frontend -> API : POST /projects/:id/upload-srs (file)
API -> Multer : Validate & save file
Multer --> API : Return file path

== Document Processing ==
API -> DocAI : Extract text from file
DocAI --> API : Return raw text

== Chunking & Embedding ==
API -> Splitter : Split text into chunks
Splitter --> API : Array of chunks
API -> Embeddings : Generate embeddings
Embeddings --> API : Return embeddings

== Storage ==
API -> Supabase : Store chunks + embeddings
Supabase --> API : Confirmation
API -> MongoDB : Update project metadata
MongoDB --> API : Confirmation

== Response ==
API --> Frontend : Success message
Frontend --> User : Display "SRS processed"

@enduml
