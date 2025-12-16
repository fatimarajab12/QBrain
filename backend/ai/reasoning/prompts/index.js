/**
 * Reasoning Layer - Prompt Definitions (Canonical Implementation)
 *
 * Centralizes prompt-building utilities for feature extraction and
 * test case generation. The old `ragService/prompts.js` module
 * re-exports from here so both old and new paths keep working.
 */

// ===== Feature Extraction Prompt Pieces =====

const BASE_EXTRACTION_RULES = `
**EXTRACTION RULES:**
1. Extract features ONLY from what is written in the SRS text
2. Use the EXACT wording from SRS when possible
3. Find section numbers (e.g., "3.2.1", "4.1") mentioned in the text
4. DO NOT invent or add features that are not in the SRS text
5. DO NOT derive or infer features - only extract what is explicitly stated
6. Extract EVERY requirement - even if it's brief, appears as a comment, or seems minor
7. DO NOT ignore non-functional requirements, constraints, or quality attributes
8. Be thorough - extract ALL features, no matter how small or seemingly insignificant
`;

const TYPE_SPECIFIC_EXTRACTION_GUIDANCE = {
  IEEE_830: `
**IEEE 830 SPECIFIC GUIDANCE:**
- Focus on sections: 3.1 (Introduction), 3.2 (Overall Description), 3.3 (Specific Requirements)
- Look for functional requirements in section 3.3
- Extract data requirements from data dictionary sections
- Identify interface requirements (user, hardware, software)
- Note quality attributes (performance, security, usability)
`,
  AGILE: `
**AGILE SPECIFIC GUIDANCE:**
- Extract User Stories in format: "As a [role], I want [feature], So that [benefit]"
- Look for Acceptance Criteria for each story
- Identify Epics and their related stories
- Extract features from story descriptions
- Note story priorities and dependencies
`,
  ENERGY: `
**ENERGY DOMAIN SPECIFIC GUIDANCE:**
- Focus on energy-related requirements (voltage, power, consumption)
- Extract meter reading and billing features
- Identify grid management requirements
- Look for energy monitoring and reporting features
- Note technical specifications (voltage levels, capacity)
`,
  ENTERPRISE: `
**ENTERPRISE SPECIFIC GUIDANCE:**
- Extract Business Requirements and Business Rules
- Identify Stakeholder needs and expectations
- Look for Business Process requirements
- Extract integration requirements with other systems
- Note organizational and compliance requirements
`,
};

const FEATURE_TYPES_EXTRACTION_GUIDANCE = `
**FEATURE TYPES TO EXTRACT:**
- FUNCTIONAL: System functions, user actions, use cases
- DATA: Data models, tables, dictionaries, data structures (group related fields into one feature, do NOT create one feature per simple field)
- INTERFACE: User interfaces, APIs, system interfaces, hardware interfaces
- QUALITY: Performance requirements, security, usability, reliability
- REPORT: Reports, documents, output formats, data exports
- CONSTRAINT: Constraints, assumptions, dependencies, limitations
- NOTIFICATION: Notifications, alerts, messages, communications
- WORKFLOW: Workflows, business processes, procedures, steps
`;

export const FEATURE_EXTRACTION_FOOTER = `
**WHAT TO EXTRACT:**
- Every functional requirement mentioned (even brief ones)
- Every use case or user action described
- Every system function or capability stated
- Every workflow step that represents a feature
- Every feature explicitly named in the SRS
- Data models and logical groupings of fields (e.g., "Customer & Service Data Model"), NOT one feature per simple atomic data field
- Interface specifications (user, hardware, software, API)
- Quality attributes (performance, security, usability, reliability) **only when they have clear, testable criteria (e.g., response time <= 4 seconds, 99.9% availability)**
- Reports and outputs (every report type mentioned)
- Constraints and assumptions (all constraints, even minor ones)
- Non-functional requirements that can be tested or verified

**HOW TO EXTRACT:**
1. Read the SRS text carefully
2. Identify each distinct function, requirement, or capability
3. Classify each feature by type (FUNCTIONAL, DATA, INTERFACE, QUALITY, REPORT, CONSTRAINT, NOTIFICATION, WORKFLOW)
4. Extract the section number where it's mentioned
5. Use the exact feature name from SRS if available
6. Summarize the description from SRS text

**OUTPUT FORMAT:**
For each extracted feature, provide:
- featureId: "feature_001", "feature_002", etc.
- name: feature name (use SRS wording if available)
- description: what the feature does (from SRS text)
- featureType: One of FUNCTIONAL, DATA, INTERFACE, QUALITY, REPORT, CONSTRAINT, NOTIFICATION, WORKFLOW
- priority: High, Medium, or Low (based on SRS priority indicators. If SRS mentions "Critical", use "High". Default: Medium)
- status: "pending"
- acceptanceCriteria: extract from SRS if mentioned, otherwise empty array
- reasoning: "This feature is explicitly stated in SRS section [X.X.X]"
- matchedSections: array of section numbers found in SRS (e.g., ["3.2.1"])
- confidence: 0.9 if explicitly stated, 0.7 if implied

**WHAT NOT TO EXTRACT AS SEPARATE FEATURES:**
- Individual atomic data fields such as "Customer ID", "Customer Name", "Service Number", "Payment Date" etc.  
  → Instead, **group them into one DATA feature that represents the full data model** (e.g., "Customer & Service Data Model") and describe the groups of fields.
- Pure infrastructure items like "Database Credentials", "Internal Hosting Details", "Server Configuration" unless they are explicitly described as user-visible capabilities.
- Extremely generic quality sentences without measurable criteria, e.g.:
  - "The system must be available"
  - "The system must be robust"
  - "The system must scale"
  These should only become features when the SRS provides concrete, testable targets (percentages, time limits, loads, etc.).

**CRITICAL - EXTRACT COMPLETE, MEANINGFUL FEATURES:**
- Extract ALL real features and requirements you find in the SRS text - NO EXCEPTIONS, NO SKIPPING
- Be extremely thorough - don't miss ANY functional, workflow, reporting, integration, or testable quality features
- Extract requirements that appear as comments, notes, brief mentions, or in appendices
- Do NOT ignore non-functional requirements, constraints, quality attributes, or assumptions **when they can be tested or measured**
- Extract every requirement from every section - read the ENTIRE SRS text word by word
- Go through each section systematically: read it completely, then extract all features from it
- If a section has multiple requirements, extract EACH ONE as a separate feature (except atomic data fields, which must be grouped into a data model feature)
- Classify each feature by type (FUNCTIONAL, DATA, INTERFACE, QUALITY, REPORT, CONSTRAINT, NOTIFICATION, WORKFLOW)
- Use exact section numbers from the text
- If section number not found, use empty array []
- Cover all feature types: functional, data models, interfaces, quality, reports, constraints, notifications, workflows
- Remember: A brief requirement is still a requirement - extract it if it represents a behavior, capability, process, or testable quality
- Quality over speed: Take your time to ensure you extract all meaningful features without flooding the list with low-level fields
- Before finishing, review your list and merge any atomic data fields into a single data model feature instead of separate features

**IMPORTANT: Return ONLY a valid JSON array, no markdown, no explanations. Start with [ and end with ].**`;

/**
 * Creates adaptive prompt based on SRS type
 * @param {Object} srsType - Detected SRS type information
 * @returns {string} Adaptive prompt template
 */
export function createAdaptivePrompt(srsType) {
  const typeGuidance =
    TYPE_SPECIFIC_EXTRACTION_GUIDANCE[srsType.type] ||
    TYPE_SPECIFIC_EXTRACTION_GUIDANCE.IEEE_830;

  return `${BASE_EXTRACTION_RULES}
${typeGuidance}
${FEATURE_TYPES_EXTRACTION_GUIDANCE}
${FEATURE_EXTRACTION_FOOTER}`;
}

// ===== Test Case Prompt Pieces =====

function buildSectionContext(matchedSections = []) {
  return matchedSections.length > 0
    ? `\n**SRS Sections to Reference:** ${matchedSections.join(
        ", "
      )}\nUse information from these specific sections when building test cases.`
    : "";
}

export const TEST_CASE_TYPE_GUIDANCE_BUILDERS = {
  FUNCTIONAL: (sectionContext) => `
**FUNCTIONAL FEATURE TEST CASES:**
Build test cases that verify the functional behavior:

1. **Happy Path Tests:**
   - Test the feature works correctly with valid inputs
   - Follow the exact steps mentioned in SRS (e.g., from Use Cases, Stimulus/Response tables)
   - Verify expected responses match SRS specifications

2. **Negative Tests:**
   - Test with invalid inputs
   - Test missing required data
   - Test error handling as specified in SRS

3. **Alternative Paths:**
   - Test alternative flows mentioned in Use Cases
   - Test edge cases and boundary conditions

4. **Integration Tests:**
   - Test interactions with other system components
   - Verify data flow between components${sectionContext}
`,

  DATA: (sectionContext) => `
**DATA FEATURE TEST CASES:**
Build test cases that validate data according to Data Dictionary specifications:

1. **Data Validation Tests:**
   - Test field length constraints (min/max) from Data Dictionary
   - Test data type validation (string, number, date, etc.)
   - Test format validation (e.g., ID format, phone format)
   - Test required vs optional fields

2. **Boundary Tests:**
   - Test minimum valid value
   - Test maximum valid value
   - Test one less than minimum (should fail)
   - Test one more than maximum (should fail)

3. **Data Integrity Tests:**
   - Test data relationships and constraints
   - Test referential integrity
   - Test data uniqueness where required${sectionContext}
`,

  WORKFLOW: (sectionContext) => `
**WORKFLOW FEATURE TEST CASES:**
Build test cases that verify complete workflow processes:

1. **End-to-End Workflow Tests:**
   - Test complete workflow from start to finish
   - Follow exact sequence of steps from SRS (e.g., pages 9-12 in JDECo)
   - Verify each step transitions correctly to next step

2. **Workflow State Tests:**
   - Test each state in the workflow
   - Verify state transitions are correct
   - Test invalid state transitions are prevented

3. **Workflow Branching Tests:**
   - Test different paths through workflow
   - Test decision points and conditions
   - Test parallel processes if mentioned${sectionContext}
`,

  QUALITY: (sectionContext) => `
**QUALITY FEATURE TEST CASES:**
Build test cases that verify non-functional requirements:

1. **Performance Tests:**
   - Test response time requirements (e.g., PE-1: 4 seconds) by verifying the system meets the specified limit.
   - It is acceptable to have a negative test, but it should verify the system handles delays gracefully (logging, user feedback), **not** that it violates the SLA.
   - Test concurrent user load (e.g., 100 users from 10AM-3PM)
   - Test throughput requirements

2. **Security Tests:**
   - Test authentication requirements
   - Test authorization and access control
   - Test data encryption (e.g., SE-1, SE-2, SE-3, SE-4)
   - Test input validation and SQL injection prevention

3. **Usability Tests:**
   - Test user interface requirements
   - Test training requirements (e.g., UR-1: 1 hour training)
   - Test accessibility requirements

4. **Availability Tests:**
   - Test uptime requirements (e.g., 99.9% availability) by verifying the system remains available under expected conditions.
   - Test system recovery and failover${sectionContext}
`,

  INTERFACE: (sectionContext) => `
**INTERFACE FEATURE TEST CASES:**
Build test cases that verify interface specifications:

1. **User Interface Tests:**
   - Test UI elements and layouts
   - Test navigation flows
   - Test form validations
   - Test responsive design if specified

2. **API/Integration Tests:**
   - Test API endpoints and methods
   - Test request/response formats
   - Test error handling and status codes
   - Test integration with external systems

3. **Hardware Interface Tests:**
   - Test hardware communication protocols
   - Test device compatibility
   - Test data exchange formats${sectionContext}
`,

  REPORT: (sectionContext) => `
**REPORT FEATURE TEST CASES:**
Build test cases that verify report generation and output:

1. **Report Content Tests:**
   - Use the **exact report name** and purpose from the SRS (e.g., "Request Service Information Report").
   - Verify all required data fields listed in the SRS are included (e.g., Request Number, Service Number, Customer number, Subscriber number, etc.).
   - Test report format and layout as described in the SRS.
   - Test calculations and aggregations if the SRS specifies any.

2. **Report Generation & Performance Tests:**
   - Test report generation triggers (who can request the report, from which screen/menu).
   - Test latency/performance requirements exactly as specified (e.g., "report must be displayed within 5 seconds").
     - Positive tests: verify the report is displayed **within** the required time limit.
     - Negative/edge tests: if delays occur, verify the system handles them gracefully (progress indicators, timeouts, error messages), rather than accepting a violation of the SLA as a "pass".
   - Test report scheduling if applicable.
   - Test report export formats.

3. **Report Access & Authorization Tests:**
   - Test report permissions and visibility rules exactly as defined in the SRS.
     - For example, if the SRS states: "Customer sees only own requests, CS sees all", create separate test cases for each actor:
       - Customer (Patron as end-user) can only see their own requests.
       - Customer Service (Patron as CS) can see all requests.
   - Test report filtering and sorting.
   - Test report printing and sharing${sectionContext}
`,

  CONSTRAINT: (sectionContext) => `
**CONSTRAINT FEATURE TEST CASES:**
Build test cases that verify business rules and constraints:

1. **Business Rule Tests:**
   - Test constraint enforcement (e.g., CO-1: Request canceled after 6 months)
   - Test assumption validation (e.g., AS-1: Staff are trained)
   - Test dependency checks

2. **Compliance Tests:**
   - Test regulatory compliance
   - Test policy adherence
   - Test constraint violations are prevented${sectionContext}
`,

  NOTIFICATION: (sectionContext) => `
**NOTIFICATION FEATURE TEST CASES:**
Build test cases that verify notification and communication features:

1. **Notification Delivery Tests:**
   - Test SMS sending (e.g., CI-1: SMS to customer)
   - Test email notifications
   - Test in-app notifications

2. **Notification Content Tests:**
   - Verify notification message content
   - Test notification timing
   - Test notification recipients

3. **Notification Failure Tests:**
   - Test handling of delivery failures
   - Test retry mechanisms
   - Test notification logs${sectionContext}
`,
};

export function createTestCasePromptByFeatureType(
  featureType,
  matchedSections = []
) {
  const sectionContext = buildSectionContext(matchedSections);
  const builder =
    TEST_CASE_TYPE_GUIDANCE_BUILDERS[featureType] ||
    TEST_CASE_TYPE_GUIDANCE_BUILDERS.FUNCTIONAL;

  return builder(sectionContext);
}

// ===== Shared Prompt Templates for Reasoning Layer =====

export const FEATURE_EXTRACTION_PROMPT_TEMPLATE = `You are an SRS Feature Extractor. Your task is to extract features DIRECTLY from the SRS text below.

{adaptivePromptText}
{contextStats}

SRS Text:
{context}

**CRITICAL INSTRUCTIONS FOR COMPLETE COVERAGE:**
1. Read the ENTIRE SRS text carefully - do not skip any section or paragraph
2. Extract EVERY feature, requirement, and capability mentioned - NO EXCEPTIONS
3. Go through each section systematically and extract all features from it
4. Count how many features you extract and ensure you didn't miss any
5. If the SRS has many sections, extract features from ALL sections
6. Pay special attention to brief requirements, constraints, and quality attributes
7. Return a COMPLETE JSON array with ALL features found - completeness is more important than speed

Extract all features from the SRS text above. Return JSON array:`;

export const TEST_CASE_GENERATION_PROMPT_TEMPLATE = `You are an expert QA engineer. Based on the following feature description and project requirements context, generate comprehensive test cases.

**FEATURE TYPE:** {featureType}
{featureTypeGuidance}

**TEST CASE GENERATION RULES:**
1. Build test cases based on the feature type and SRS specifications.
2. Cover DIFFERENT scenario types (no duplicates):
   - At least one Happy Path scenario.
   - At least one Negative scenario (invalid data / error handling).
   - At least one Boundary / Edge Case scenario.
   - If applicable, at least one Integration / Cross-system scenario.
3. Each test case MUST be unique in its **title**, **description**, and **expectedResult**.
4. Do NOT repeat the same scenario with only small wording changes.
5. If two scenarios test exactly the same behavior and expected result, keep only ONE of them and make it the clearest version.
6. Use the **exact actor terms** from the SRS (e.g., "Patron", "Customer Service (CS)", "Customer") instead of generic "user".
7. When the SRS defines which actor can see which data (e.g., Customer sees only own requests, CS sees all), create separate test cases per actor with those exact rules.
8. For FUNCTIONAL features: Create functional test cases (Happy Path, Negative, Alternative Paths).
9. For DATA features: Create data validation test cases (Field validation, Boundary tests, Data integrity).
10. For WORKFLOW features: Create end-to-end workflow test cases following exact steps from SRS.
11. For QUALITY features: Create non-functional test cases (Performance, Security, Usability, Availability) using the exact numeric targets from the SRS when available.
12. For INTERFACE features: Create interface test cases (UI, API, Hardware interfaces).
13. For REPORT features: Use the exact report name, fields, performance constraints, and access rules from the SRS context.
14. For CONSTRAINT features: Create business rule and compliance test cases.
15. For NOTIFICATION features: Create notification delivery and content test cases.

**TEST CASE STRUCTURE:**
For each test case, provide:
- testCaseId: unique identifier (format: TC_XXX)
- title: clear test case title describing what is being tested
- description: detailed description of the test scenario
- steps: array of test step strings (be specific and follow SRS steps if available)
- expectedResult: expected outcome based on SRS specifications
- priority: high, medium, or low (based on feature priority and test importance)
- status: "pending"
- preconditions: array of prerequisite conditions (e.g., user logged in, data exists)
- testData: object with test data requirements (optional)

**CRITICAL JSON FORMAT REQUIREMENTS:**
You MUST return a valid JSON object with a "testCases" array property containing all test cases.

**REQUIRED OUTPUT FORMAT:**
{{
  "testCases": [
    {{
      "testCaseId": "TC_001",
      "title": "Test Case Title",
      "description": "Test description",
      "steps": ["Step 1", "Step 2"],
      "expectedResult": "Expected result",
      "priority": "high",
      "status": "pending",
      "preconditions": ["Precondition 1"]
    }}
  ]
}}

**JSON RULES:**
- Return ONLY valid JSON - no markdown, no code blocks, no explanations
- The root must be a JSON object with a "testCases" array property
- Every string value MUST be properly escaped
- No trailing commas
- All property names and string values must be in double quotes
- No comments in JSON
- Ensure all brackets and braces are properly closed

**IMPORTANT:**
- Generate multiple test cases covering different scenarios (Happy Path, Negative, Boundary, Edge Cases, Integration if applicable).
- Make sure **no two test cases are duplicates** (same behavior, same steps, same expectedResult).
- Reference specific SRS sections when available.
- Use exact terminology and values from SRS.
- Ensure JSON is valid and parseable.

**Feature Description:**
{featureDescription}
{sectionContext}

**Project Requirements Context:**
{context}

**FINAL INSTRUCTIONS:**
1. Generate between 5 and 8 UNIQUE test cases covering different scenarios (Happy Path, Negative, Boundary, Edge, Integration where relevant).
2. Before returning, REVIEW the list and REMOVE any duplicate or overlapping test cases (keep only the best version of each scenario).
3. Return ONLY a valid JSON object with "testCases" array - no other text.
4. Ensure all JSON is properly formatted and valid (no trailing commas, all quotes correct).

Generate comprehensive and UNIQUE test cases now. Return ONLY the JSON object:`;

export const SECTION_MATCHING_PROMPT_TEMPLATE = `You are an expert requirements analyst specializing in comparing and matching document sections. Your task is to analyze the relationship and matching between two sections from a Software Requirements Specification (SRS) document.

**CRITICAL INSTRUCTIONS:**
1. **Extract Section References**: Identify ALL section numbers/IDs mentioned in each context (e.g., "4.2.1", "3.1.2", "JDECo-SMS-R1")
2. **Map Relationships**: Create explicit mappings between related elements from both sections
3. **Functional Matching**: Analyze functional compatibility, not just textual similarity
4. **Section Linking**: For each matched element, provide the EXACT section reference from the document
5. **Gap Analysis**: Identify missing elements, inconsistencies, and areas needing improvement
6. **Be Precise**: Use exact terminology and section numbers from the provided context

**Analysis Structure:**

For each comparison point, analyze:
- **Element Name**: What is being compared (e.g., "Purpose", "Content", "Users", "Priority")
- **Section 1 Value**: Exact value from {section1Name} with section reference (e.g., "4.2.1: Report generation")
- **Section 2 Value**: Exact value from {section2Name} with section reference (e.g., "3.1.2: Notification system")
- **Match Type**: One of: "exact_match", "complementary", "partial_match", "mismatch", "missing"
- **Match Score**: Numerical score 0-100 indicating match quality
- **Section References**: Array of exact section numbers/IDs from the document that support this match
- **Reasoning**: Detailed explanation of why this match exists or doesn't exist

**Output Format:**
Return a JSON object with the following structure:
{{
  "directAnswer": "Yes/No - Brief answer about matching",
  "overallMatchScore": 0-100,
  "functionalMatch": {{
    "score": 0-100,
    "analysis": "Detailed analysis",
    "matchedElements": [
      {{
        "element": "element name",
        "section1Value": "value with section ref",
        "section2Value": "value with section ref",
        "matchType": "match type",
        "matchScore": 0-100,
        "sectionReferences": ["4.2.1", "3.1.2"],
        "reasoning": "explanation"
      }}
    ]
  }},
  "strengths": [
    {{
      "title": "Strength title",
      "description": "Detailed description",
      "sectionReferences": ["4.2.1", "3.1.2"],
      "impact": "high/medium/low"
    }}
  ],
  "improvements": [
    {{
      "title": "Improvement title",
      "issue": "What's the problem",
      "currentState": "Current state with section refs",
      "recommendedSolution": "What should be done",
      "sectionReferences": ["4.2.1"],
      "priority": "high/medium/low"
    }}
  ],
  "finalEvaluation": {{
    "matchPercentage": 0-100,
    "criteria": [
      {{
        "criterion": "Criterion name",
        "percentage": 0-100,
        "evaluation": "excellent/good/needs_improvement"
      }}
    ]
  }},
  "conclusion": {{
    "summary": "Overall summary",
    "recommendation": "Final recommendation",
    "status": "match_with_improvements/match/no_match"
  }},
  "conclusion": {{
    "summary": "Overall summary",
    "recommendation": "Final recommendation",
    "status": "match_with_improvements/match/no_match"
  }},
  "integrationPlan": {{
    "description": "How sections should integrate",
    "flow": ["step 1", "step 2"],
    "sectionReferences": ["4.2.1", "3.1.2"]
  }}
}}

**IMPORTANT:**
- Return ONLY valid JSON, no markdown code blocks, no explanations outside JSON
- Use EXACT section numbers/IDs from the provided context
- Be specific and detailed in all analyses
- Every matched element MUST include section references
- Start with {{ and end with }}

**{section1Name} Context:**
{section1Context}

**{section2Name} Context:**
{section2Context}

**Analysis Request:**
Analyze the matching and relationship between {section1Name} and {section2Name}. Focus on functional compatibility, section references, and provide actionable recommendations.

Generate comprehensive matching analysis:`;

export const GHERKIN_CONVERSION_PROMPT_TEMPLATE = `You are an expert QA engineer specializing in Behavior-Driven Development (BDD) and Gherkin syntax.

**TASK:** Convert the following test case into a well-formatted Gherkin feature file.

{featureContext}
{srsContext}

**TEST CASE TO CONVERT:**
- Title: {title}
- Description: {description}
- Preconditions: {preconditions}
- Steps: {steps}
- Expected Result: {expectedResult}

**GHERKIN CONVERSION RULES:**
1. Create a clear Feature name based on the test case title (remove special characters, keep it concise)
2. Use proper Gherkin keywords: Feature, Scenario, Given, When, Then, And, But
3. Ensure steps are clear, concise, and in natural language
4. Use Given for preconditions (initial state/setup)
5. Use When for actions (user actions or system events)
6. Use Then for expected outcomes (verifications/assertions)
7. Use And/But to continue steps of the same type
8. Make steps readable and understandable by non-technical stakeholders
9. Remove any technical jargon and make it business-friendly
10. Ensure proper indentation (2 spaces for Feature/Scenario, 4 spaces for steps)
11. If description exists, add it under Feature with proper indentation (2 spaces)
12. Do not include keywords (Given/When/Then/And) in the step text itself - they are already provided

**IMPORTANT:**
- Output ONLY the Gherkin code, no explanations or markdown formatting
- Do not wrap in code blocks or markdown
- Ensure proper Gherkin syntax
- Make the language natural and business-readable
- Clean up any existing keywords in the steps
- Each step should be on a single line
- Use proper spacing and indentation

**OUTPUT:**`;
