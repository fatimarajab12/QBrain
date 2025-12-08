# Use Case Diagram - QBrain System (High-Level, Hierarchical)

## Overview
This diagram represents the main use cases in the QBrain Vision QA Suite system using a hierarchical structure with main use cases and their sub-use cases.

## Actor

### **User**
- Can be guest (for authentication) or authenticated (for all other operations)

## Use Case Structure

### **1. Authentication**
Main use cases for user authentication:
- **Sign Up**: Create new user account
- **Login**: Authenticate and start session

### **2. Project Management**
**Main Use Case: Manage Projects**
- **Sub-use cases (included)**:
  - **Create Project**: Create a new project
  - **View Projects**: Display all user's projects
  - **Upload SRS Document**: Upload and process SRS document (PDF/TXT, max 10MB)

### **3. Feature Management**
**Main Use Case: Manage Features**
- **Sub-use cases (included)**:
  - **Generate Features (AI)**: Automatically extract features from SRS using AI
  - **View Features**: Display all features in a project
  - **Create Feature (Manual)**: Manually create a feature

### **4. Test Case Management**
**Main Use Case: Manage Test Cases**
- **Sub-use cases (included)**:
  - **Generate Test Cases (AI)**: Automatically generate test cases for a feature using AI
  - **View Test Cases**: Display all test cases for a feature
  - **Create Test Case (Manual)**: Manually create a test case

### **5. AI Services**
**Main Use Case: AI Services**
- **Sub-use cases (included)**:
  - **Chatbot Query**: Ask questions about project and receive AI answers
  - **Get Context**: Retrieve relevant document chunks from vector database
  - **Section Matching Analysis**: Analyze relationship between two SRS sections

## Relationships Explained

### **Include Relationship (<<include>>) - Required**

#### **Hierarchical Includes (Main → Sub)**
Main use cases **include** their sub-use cases, meaning when you access the main use case, all sub-use cases are available:
- **Manage Projects** <<include>> **Create Project**, **View Projects**, **Upload SRS**
- **Manage Features** <<include>> **Generate Features**, **View Features**, **Create Feature**
- **Manage Test Cases** <<include>> **Generate Test Cases**, **View Test Cases**, **Create Test Case**
- **AI Services** <<include>> **Chatbot Query**, **Get Context**, **Section Matching**

#### **Dependency Includes (Operation Flow)**
Specific operations require other operations to be executed first:
- **Upload SRS** <<include>> **View Projects**: To upload SRS, user must first view projects list (to select a project)
- **Generate Features** <<include>> **View Projects**: Generate Features requires viewing projects (to select project)
- **Generate Features** <<include>> **View Features**: Generate Features requires viewing features (to display results)
- **Generate Test Cases** <<include>> **View Features**: Generate Test Cases requires viewing features (to select feature)
- **Generate Test Cases** <<include>> **View Test Cases**: Generate Test Cases requires viewing test cases (to display results)

### **Extend Relationship (<<extend>>) - Optional**
The extended use case is **OPTIONALLY executed** when the base use case is executed (conditional execution).

**Examples:**
- **Generate Features** <<extend>> **Upload SRS**: Generate Features can extend Upload SRS (if SRS exists, user can generate features)
- **Generate Test Cases** <<extend>> **View Features**: Generate Test Cases can extend View Features (from feature list, user can generate test cases)
- **AI Services** <<extend>> **View Projects**: AI Services can extend View Projects (available from project context)

## Key Differences: Include vs Extend

| Aspect | <<include>> | <<extend>> |
|--------|-------------|------------|
| **Execution** | Always executed | Conditionally executed |
| **Dependency** | Required | Optional |
| **Purpose** | Must happen | May happen |
| **Direction** | From main to sub, or from operation to dependency | From optional operation to base operation |
| **Example** | Manage Projects includes Create Project | Generate Features extends Upload SRS (if SRS exists) |

## Workflow Example

1. **User** signs up and logs in
2. **User** accesses **Manage Projects** → Can create project, view projects, upload SRS
3. **User** uploads SRS document (requires viewing projects first via include)
4. **User** accesses **Manage Features** → Can generate features, view features, create feature
5. **User** generates features from SRS (requires viewing projects and features; extends upload SRS)
6. **User** accesses **Manage Test Cases** → Can generate test cases, view test cases, create test case
7. **User** generates test cases for feature (requires viewing features and test cases; extends view features)
8. **User** accesses **AI Services** → Can use chatbot, get context, analyze sections (extends view projects)


