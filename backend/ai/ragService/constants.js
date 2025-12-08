/**
 * Constants and Configuration for RAG Service
 */

/**
 * 8 Smart Queries for Comprehensive SRS Coverage
 * Each query targets different SRS sections
 */
export const COMPREHENSIVE_SRS_QUERIES = [
  { query: "requirements functional features", category: "FUNCTIONAL", description: "Functional requirements and features" },
  { query: "data dictionary field table column", category: "DATA", description: "Data dictionary and fields" },
  { query: "interface user software hardware API", category: "INTERFACE", description: "User and system interfaces" },
  { query: "quality performance security usability reliability", category: "QUALITY", description: "Quality attributes" },
  { query: "constraint assumption dependency limitation", category: "CONSTRAINT", description: "Constraints and assumptions" },
  { query: "report document format output", category: "REPORT", description: "Reports and documents" },
  { query: "notification alert message communication", category: "NOTIFICATION", description: "Notifications and alerts" },
  { query: "workflow process step procedure", category: "WORKFLOW", description: "Workflows and processes" },
];

/**
 * SRS Type Detection Patterns - Enhanced for better accuracy
 */
export const SRS_TYPE_PATTERNS = {
  IEEE_830: {
    keywords: [
      // Standard references
      "IEEE Std 830", "IEEE 830", "IEEE Standard 830", "IEEE Std. 830",
      // Section titles (more important than specific numbers)
      "Introduction", "Overall Description", "Specific Requirements",
      "Product Perspective", "Product Functions", "User Classes",
      "Functional Requirements", "Non-Functional Requirements",
      "System Features", "External Interface Requirements",
      "System Requirements Specification", "Software Requirements Specification",
      "SRS", "Requirements Specification",
      // Common IEEE 830 terms
      "Product Overview", "Operating Environment", "Design Constraints",
      "User Documentation", "Assumptions and Dependencies",
      "System Interfaces", "Hardware Interfaces", "Software Interfaces",
      "Performance Requirements", "Safety Requirements", "Security Requirements"
    ],
    structuralPatterns: [
      /^\d+\.\d+\.\d+/,  // Section numbering like 3.1.1, 3.2.1, etc. (any number)
      /Section \d+\.\d+/,  // Explicit section references like "Section 3.1"
      /^3\.\d+/,  // Section 3.x pattern (main sections)
      /\d+\.\d+\.\d+\.\d+/,  // Sub-section numbering like 3.1.1.1
      /^\d+\.\d+\.\d+\.\d+\.\d+/,  // Deep nesting like 3.1.1.1.1
      /\b\d+\.\d+\.\d+\b/g,  // Any three-level numbering in text
    ],
    name: "IEEE 830",
    description: "Standard IEEE 830 SRS format"
  },
  AGILE: {
    keywords: [
      "User Story", "As a", "I want", "So that",
      "Acceptance Criteria", "Epic", "Sprint", "Backlog",
      "Product Owner", "Scrum", "Kanban", "Sprint Planning",
      "Story Points", "Definition of Done", "Sprint Review",
      "User Persona", "Feature", "Task", "Bug",
      "Agile", "Scrum Master", "Sprint Retrospective"
    ],
    structuralPatterns: [
      /As a .+ I want .+ So that .+/i,  // User story format
      /^US-\d+/i,  // User story ID format
      /^Story:/i,  // Story prefix
      /Given .+ When .+ Then .+/i,  // BDD format
    ],
    name: "Agile",
    description: "Agile/User Story format"
  },
  ENTERPRISE: {
    keywords: [
      "Business Requirements", "Stakeholder", "Business Process",
      "Enterprise", "Organization", "Business Rules",
      "Business Objectives", "Business Goals", "Business Value",
      "ROI", "Business Case", "Stakeholder Analysis",
      "Business Architecture", "Enterprise Architecture",
      "Business Capability", "Business Function",
      "Corporate", "Organizational", "Strategic"
    ],
    structuralPatterns: [
      /BR-\d+/i,  // Business requirement ID
      /Business Requirement/i,
      /Stakeholder Requirement/i,
      /^BR\d+/i,  // Business requirement format
    ],
    name: "Enterprise",
    description: "Enterprise/Business SRS"
  }
};

