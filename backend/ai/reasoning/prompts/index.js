/**
 * Reasoning Layer - Prompt Definitions (Canonical Implementation)
 *
 * Centralizes prompt-building utilities for feature extraction and
 * test case generation. The old `ragService/prompts.js` module
 * re-exports from here so both old and new paths keep working.
 */

/**
 * Creates adaptive prompt based on SRS type
 * @param {Object} srsType - Detected SRS type information
 * @returns {string} Adaptive prompt template
 */
export function createAdaptivePrompt(srsType) {
  const baseRules = `
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

  const typeSpecificGuidance = {
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

  const featureTypesGuidance = `
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

  return `${baseRules}
${typeSpecificGuidance[srsType.type] || typeSpecificGuidance.IEEE_830}
${featureTypesGuidance}

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
}

export function createTestCasePromptByFeatureType(featureType, matchedSections = []) {
  const sectionContext =
    matchedSections.length > 0
      ? `\n**SRS Sections to Reference:** ${matchedSections.join(
          ", "
        )}\nUse information from these specific sections when building test cases.`
      : "";

  const typeSpecificGuidance = {
    FUNCTIONAL: `
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

    DATA: `
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

    WORKFLOW: `
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

    QUALITY: `
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

    INTERFACE: `
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

    REPORT: `
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

    CONSTRAINT: `
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

    NOTIFICATION: `
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

  return (
    typeSpecificGuidance[featureType] || typeSpecificGuidance.FUNCTIONAL
  );
}



