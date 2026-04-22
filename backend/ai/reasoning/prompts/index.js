/**
 * Reasoning Layer - Prompt Definitions (Canonical Implementation)
 *
 * Centralizes prompt-building utilities for feature extraction and
 * test case generation. The old `ragService/prompts.js` module
 * re-exports from here so both old and new paths keep working.
 */

// ===== Feature Extraction Prompt Pieces =====

function getBaseExtractionRules(highRecallMode = false) {
  const recallRule = highRecallMode
    ? "Prefer extracting borderline and implied features."
    : "Extract only clearly implied or explicitly stated features.";

  return `
**CORE RULES:**
1. Extract ALL atomic functional, workflow, notification, report, interface, and quality requirements
2. DO NOT merge steps - each user action or system reaction = separate feature
3. Adapt to any document structure
4. Use location identifiers from the document
5. Group atomic data fields into data model features
6. Extract quality attributes even if criteria are implied; mark acceptanceCriteria as "TBD" if missing
7. Infer implicit features cautiously
8. Skip ONLY pure infrastructure details

**RECALL MODE:** ${recallRule}
`;
}

const FEATURE_TYPES_EXTRACTION_GUIDANCE = `
**FEATURE TYPES:**
- FUNCTIONAL: System functions, user actions, use cases
- DATA: Data models, tables, dictionaries (group related fields together)
- INTERFACE: User interfaces, APIs, system interfaces
- QUALITY: Performance, security, usability (extract even if criteria are implied or qualitative)
- REPORT: Reports, documents, output formats
- CONSTRAINT: Constraints, assumptions, dependencies
- NOTIFICATION: Notifications, alerts, messages
- WORKFLOW: Workflows, business processes, procedures

**GOLDEN RULES - WHAT IS A FEATURE:**
- Each Status Change = Separate Feature (e.g., "Update Service Status", "Change Order Status", "Activate Office")
- Each Notification = Separate Feature (e.g., "Notify Customer via SMS", "Notify Departments", "Send Order Notification")
- Each Role Action = Separate Feature (e.g., "Admin Approves Request", "CS Reviews Request", "Driver Completes Order")
- Each Report = Separate Feature (e.g., "Generate Monthly Report", "Export Order List", "View Financial Charts")
- Each Workflow Step = Separate Feature (e.g., "Submit Request", "Validate Request", "Approve Request", "Schedule Visit", "Perform Visit", "Generate List", "Pay Invoice", "Install Service", "Test Service", "Connect Service")
- Each User Action = Separate Feature (e.g., "Upload Document", "Pay Fee", "Cancel Request", "Rate Driver")
- Each System Reaction = Separate Feature (e.g., "Validate Data", "Generate Payment Request", "Handle Partial Charges", "Auto-assign Driver")

**DO NOT MERGE:**
- Do NOT merge workflow steps into one feature (e.g., avoid "Service Request Workflow" - extract each step separately)
- Do NOT merge role actions into one feature (e.g., avoid "Admin Dashboard" - extract each dashboard component separately)
- Do NOT merge notifications into one feature (e.g., avoid "System Notifications" - extract each notification type separately)
- Each distinct action, reaction, or status change must be a separate feature
`;

export const FEATURE_EXTRACTION_FOOTER = `
**EXTRACTION GUIDANCE:**
Extract ALL atomic functional, workflow, notification, report, interface, and quality requirements.
DO NOT merge steps. Each user action or system reaction = separate feature.
Prefer high recall over precision - extract even borderline cases.

Read through the SRS text systematically and extract distinct features. Look for:
- Functional requirements, use cases, user actions (each action = separate feature)
- Workflow steps (each step = separate feature)
- Status changes (each status change = separate feature)
- Notifications (each notification type = separate feature)
- Reports (each report type = separate feature)
- Data models (group related fields together)
- Interfaces (user, API, system)
- Quality requirements with testable criteria (e.g., "response time <= 4 seconds")
- Constraints, business rules
- Check: main sections, subsections, tables, appendices, use case descriptions, workflow descriptions, stimulus/response tables, user stories

**WHEN EXTRACTING WORKFLOWS:**
If a workflow is described with multiple steps or stages (e.g., "Step 1 → Step 2 → Step 3..." or "First, then, next, finally..."), extract EACH step/stage as a SEPARATE feature. Do NOT create one "Workflow" feature that groups all steps together.

Example: If a workflow has steps like "Create → Review → Approve → Execute → Notify", extract:
- Feature 1: "Create [entity]" (the first step)
- Feature 2: "Review [entity]" (the second step)
- Feature 3: "Approve [entity]" (the third step)
- Feature 4: "Execute [action]" (the fourth step)
- Feature 5: "Notify [recipients]" (the final step)

Each workflow step represents a distinct system behavior or user action and should be tested independently.

**EXTRACTION STRATEGY:**
- Read the document from start to end without assuming any structure
- Treat headings, paragraphs, bullet points, tables, examples, and narratives equally
- For each sentence or table row, ask: "Does this describe something the system does, shows, stores, restricts, or reacts to?"
- If yes, extract it as a feature
- If unsure, extract it and mark confidence <= 0.8

**OVER-EXTRACTION IS EXPECTED:**
- It is acceptable to extract redundant or overlapping features
- The backend will deduplicate and normalize
- Missing a feature is worse than extracting extra ones

**OUTPUT FORMAT:**
For each feature, provide:
- featureId: "feature_001", "feature_002", etc. (Backend will generate final IDs)
- name: feature name (use SRS wording if available)
- description: what the feature does
- featureType: FUNCTIONAL, DATA, INTERFACE, QUALITY, REPORT, CONSTRAINT, NOTIFICATION, or WORKFLOW
- priority: High, Medium, or Low (default: Medium)
- status: "pending"
- acceptanceCriteria: from SRS if mentioned, otherwise []
- reasoning: "This feature is explicitly stated in SRS [location]" or "This feature is inferred from [context/example/narrative]"
- matchedSections: array of location identifiers (e.g., ["3.2.1"], ["Chapter 3"]). If no formal section exists, use descriptive anchors such as ["Introduction paragraph"], ["Use case example"], ["Payment scenario description"], ["Error handling description"]
- confidence: 
  * 0.95 if explicitly stated with "shall"/"must" (mandatory requirement)
  * 0.9 if clearly described as system behavior
  * 0.8 if implied or inferred from workflow/context
  * 0.75 if inferred from narrative or examples
  * 0.7 if weakly implied but plausible

**BEFORE FINISHING - RE-SCAN FOR:**
- Each workflow step (extract separately, do NOT merge)
- Status changes (each = separate feature)
- Notifications (each notification type = separate feature)
- Reports (each report = separate feature)
- Role-specific actions (admin, customer, driver, CS actions = separate features)
- Dashboard components (each component = separate feature)
- Quality constraints with measurable criteria
- Business rules and constraints

**WHAT NOT TO EXTRACT:**
- Individual atomic data fields (group them into data model features)
  EXCEPT fields with specific validation, constraints, or business rules (e.g., ID format validation, National ID rules, Account Number validation)
- Diagrams and visual documentation (Class Diagrams, UML, etc.) - unless they describe functional behavior
- Pure infrastructure and deployment details (server configs, database credentials) - unless they describe user-visible capabilities
- Note: Generic quality statements (e.g., "system should be easy to use") SHOULD be extracted as QUALITY features even without numeric criteria

Return a valid JSON array starting with [ and ending with ].`;


export function createAdaptivePrompt({ highRecallMode = true } = {}) {
  const modePrefix = highRecallMode ? `
**HIGH RECALL MODE ENABLED:**
- Extract ALL possible features - prefer extracting over filtering
- Extract ALL workflow steps separately (do NOT merge)
- Extract ALL notifications separately (each notification type = feature)
- Extract ALL status changes separately (each status change = feature)
- Extract ALL role actions separately (admin/customer/driver/CS actions = separate features)
- Extract ALL reports separately (each report = feature)
- Do NOT skip WORKFLOW, REPORT, NOTIFICATION, or QUALITY features
- Include borderline cases - backend will review and filter
- Search thoroughly in appendices, tables, workflow descriptions, stimulus/response tables
- If unsure, extract it - prefer over-extraction over missing features

` : '';

  const baseRules = getBaseExtractionRules(highRecallMode);

  return `${modePrefix}${baseRules}
${FEATURE_TYPES_EXTRACTION_GUIDANCE}
${FEATURE_EXTRACTION_FOOTER}`;
}

// ===== Test Case Prompt Pieces =====

function buildSectionContext(matchedSections = []) {
  return matchedSections.length > 0
    ? `\n**SRS Sections to Reference:** ${matchedSections.join(", ")}
- Extract test scenarios from these SRS sections: ${matchedSections.join(", ")}
- Reference section numbers in test case descriptions
- Cover requirements and scenarios from these sections`
    : "";
}

export const TEST_CASE_EXAMPLES = {
  FUNCTIONAL: `
**EXCELLENT TEST CASE PATTERNS - LEARN THESE STRUCTURES:**

**TITLE PATTERN:** Verb + Entity + Condition + SRS reference
- "Verify successful service request submission with all required fields (SRS 3.2.1)"
- "Verify system rejects invalid phone number format (SRS 3.2.1.3)"
- "Verify address field enforces 200-character limit (SRS Appendix A)"

**STEPS PATTERN:** 5-8 actionable steps with specific details
- Include login credentials, exact field values, validation checks
- Reference UI elements by name and type (dropdown, button, field)
- Include intermediate verification steps

**EXPECTED RESULT PATTERN:** Status + Message + Side Effects
- "System displays confirmation message, sends SMS, creates database record"
- "Error message appears in red, button disabled, no data saved"
- Include all observable outcomes (UI, notifications, data changes)

**ONE COMPLETE EXAMPLE:**
{
  "testCaseId": "TC_001",
  "title": "Verify successful service request submission with valid data (SRS 3.2.1)",
  "description": "Test that verified customer can submit Internet service request with all required fields",
  "steps": [
    "Login as verified customer (customer01/Test@123)",
    "Navigate to Services → New Service Request",
    "Select 'Internet' from Service Type dropdown",
    "Enter valid address: '123 Main St, Nablus'",
    "Enter valid phone: '+970-599-123456'",
    "Click 'Submit Request' button"
  ],
  "expectedResult": "Request created successfully, confirmation message shown, SMS sent, appears in 'My Requests'",
  "priority": "high",
  "preconditions": ["Verified customer account", "No outstanding payments"]
}

**ANTI-PATTERNS TO AVOID:**
- Vague title: "Test service request"
- Generic steps: "Submit the form"
- Unclear expected result: "System works correctly"
- No SRS reference
- Missing preconditions
- No specific test data
`,

  QUALITY: `
**QUALITY TEST PATTERNS:**

**PERFORMANCE PATTERN:**
- Title: "Verify [operation] meets [X-second] SLA under [load] (SRS [section])"
- Steps: Setup load, measure execution time, verify metrics
- Expected: Meets specific time limits, handles load gracefully

**SECURITY PATTERN:**
- Title: "Verify system prevents [attack vector] (SRS [security section])"
- Steps: Attempt specific attack, verify prevention
- Expected: Attack blocked, proper error handling, logging

**Example:**
{
  "testCaseId": "TC_PERF_001",
  "title": "Verify report generation completes within 5 seconds under normal load (SRS 4.2.1)",
  "description": "Test report performance meets SLA requirements",
  "steps": [
    "Setup: Load database with test data",
    "Login and navigate to report",
    "Generate report and measure time",
    "Verify results display correctly"
  ],
  "expectedResult": "Report loads in ≤5 seconds, displays all data, no timeouts",
  "preconditions": ["System under normal load", "Monitoring tools active"]
}
  "title": "Verify system prevents SQL injection in service request search field (SE-2)",
  "description": "Test that the service request search functionality properly sanitizes user input and prevents SQL injection attacks as required by SRS section 5.2 security requirement SE-2. Test multiple SQL injection patterns",
  "steps": [
    "Login as Customer Service user",
    "Navigate to Service Requests → Search",
    "Enter malicious SQL in search field: \\\" OR \\\"1\\\"=\\\"1",
    "Click Search button",
    "Verify no database error displayed",
    "Verify no unauthorized data exposed",
    "Test additional payloads: \\'; DROP TABLE requests; --",
    "Test encoded payload: %27%20OR%201=1"
  ],
  "expectedResult": "System treats all SQL injection attempts as literal search strings, returns 0 results or only matching literal strings, no SQL error messages displayed to user, no database tables affected, all attempts logged to security audit log with timestamp and user IP, alert sent to security team for repeated attempts (3+ within 1 minute)",
  "priority": "critical",
  "status": "pending",
  "preconditions": [
    "CS user account exists with search permissions",
    "Security audit logging is enabled",
    "Input sanitization is configured"
  ],
  "testData": {
    "sqlPayloads": [
      "\\\" OR \\\"1\\\"=\\\"1",
      "\\'; DROP TABLE requests; --",
      "1' OR '1'='1",
      "%27%20OR%201=1"
    ]
  }
}

Example 3 - Usability Test with User Action Timing:
{
  "testCaseId": "TC_USAB_001",
  "title": "Verify new CS representative can complete service request review within 1 hour after training (UR-1)",
  "description": "Test usability requirement UR-1 from SRS section 5.3 which states that a newly trained CS representative should be able to review and approve/reject a service request within 1 hour of completing mandatory 1-hour training session. Test with real new user following actual training materials",
  "steps": [
    "Select a new CS representative who completed 1-hour training today",
    "Provide access to test environment with 5 pending service requests",
    "Ask representative to review requests using only system UI and help documentation",
    "Do NOT provide additional guidance beyond standard training materials",
    "Observe and record time taken for each task",
    "Record any help documentation accessed",
    "Record any errors or confusion points"
  ],
  "expectedResult": "CS representative successfully completes review of all 5 requests within 1 hour total (average 12 minutes per request), can navigate to Service Requests queue without assistance, correctly identifies required vs optional fields, makes appropriate approve/reject decision, adds review notes, submits decision, minimal (<3) navigation errors, refers to help documentation max 2 times",
  "priority": "high",
  "status": "pending",
  "preconditions": [
    "CS representative completed mandatory 1-hour training within last 24 hours",
    "Training completion verified in LMS system",
    "Test environment has 5 diverse pending requests",
    "Representative has never used production system"
  ],
  "testData": {
    "maxTimeMinutes": 60,
    "requestCount": 5,
    "maxHelpAccess": 2,
    "maxNavigationErrors": 3
  }
}
`
};


const COMMON_MISTAKES_WARNING = `
**COMMON MISTAKES TO AVOID - CRITICAL:**

**DON'T:** Create duplicate tests with slight wording changes
Example BAD:
  - TC_001: "Test successful login"
  - TC_002: "Verify user can login successfully"
  - TC_003: "Check login works"
-> These are ALL THE SAME TEST! Keep only ONE.

**DO:** Create truly different tests
  - TC_001: "Verify successful login with valid credentials"
  - TC_002: "Verify login fails with incorrect password"
  - TC_003: "Verify login locks account after 3 failed attempts"

**DON'T:** Use vague expected results
Example: "System should work correctly"
**DO:** Be specific: "System displays message 'Request #REQ-123 submitted successfully', sends SMS to +970-599-123456, and creates database record with status='Pending'"

**DON'T:** Skip preconditions
**DO:** Always list what must be true before test starts

**DON'T:** Create end-to-end workflow tests when testing single steps
For WORKFLOW features, test ONLY the specific step, not the entire flow
BAD: Test entire "Submit → Review → Approve → Execute" flow
GOOD: Test only "Review" step (assume Submit is done in preconditions)

**DON'T:** Forget to reference SRS sections
**DO:** Always mention: "as per SRS section X.Y.Z"
`;

const SELF_CHECK_INSTRUCTIONS = `
**MANDATORY SELF-CHECK BEFORE RETURNING - DO THIS STEP BY STEP:**

Step 1 - Verify Coverage:
- Do you have Happy Path tests covering all success scenarios?
- Do you have Negative/Error tests covering all failure scenarios?
- Do you have Boundary/Edge case tests for all limits and extremes?
- Do you have Integration tests for all system interactions if applicable?

Step 2 - Check for Duplicates:
- Compare each test case title with every other title
- Are any two tests doing the SAME thing? If yes, DELETE one
- Read expected results - are any identical? If yes, tests are duplicates

Step 3 - Check Quality of Each Test Case:
- Does EVERY test case have: title, description, steps, expectedResult, preconditions?
- Are steps actionable? (Can a tester follow them?)
- Are expected results measurable? (Can you verify pass/fail?)
- Is SRS section referenced?

Step 4 - Check Actor Variety (if applicable):
- Did I test with different user roles? (Customer, CS, Admin)
- Did I test different access levels?

Step 5 - Final Diversity Check:
- Do I have tests for: valid data, invalid data, boundary data?
- Do I have tests for: success cases, failure cases, error handling?
- Do I have tests covering different parts of the SRS?

**IF ANY CHECKBOX IS UNCHECKED, FIX BEFORE RETURNING!**
`;

const SECOND_PASS_IMPROVEMENT_PROMPT = `
You are an expert QA reviewer. Here are the test cases generated by another AI. Improve them based on this checklist:

**MANDATORY IMPROVEMENTS - DO EACH STEP:**

Step 1 - Verify Complete Coverage:
- Generate all test cases necessary to cover all Happy Path scenarios
- Generate all test cases necessary to cover all Negative/Error scenarios
- Generate all test cases necessary to cover all Boundary/Edge cases
- Generate all test cases necessary to cover all Integration points
- Generate all test cases necessary to cover Security, Performance, Usability, Accessibility, and any special conditions

Step 2 - Remove Duplicates:
- Compare each test case title with every other title
- Are any two tests doing the SAME thing? DELETE one
- Read expected results - are any identical? Tests are duplicates

Step 3 - Improve Quality:
- Make titles more specific: "Verb + Entity + Condition (SRS X.X)"
- Add missing actionable steps (5-8 steps minimum)
- Make expected results measurable and specific
- Add missing preconditions
- Add SRS section references where missing

Step 4 - Enhance Diversity:
- Add tests for different user roles if missing
- Add tests for edge cases if missing
- Add tests for error conditions if missing

Step 5 - Fix Structure Issues:
- Ensure every test case has: title, description, steps array, expectedResult, preconditions
- Make steps actionable (tester can follow them)
- Make expected results verifiable (clear pass/fail criteria)

Step 6 - COVERAGE VERIFICATION (CRITICAL):
- Review the final test cases for comprehensive coverage
- Ensure all user flows, edge cases, and failure scenarios are represented
- Remove any redundant or low-value test cases
- Focus on quality and uniqueness, not quantity

**RETURN ONLY:** The improved JSON array of test cases
`;

export { COMMON_MISTAKES_WARNING, SELF_CHECK_INSTRUCTIONS, SECOND_PASS_IMPROVEMENT_PROMPT };

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
Build test cases that verify THIS SPECIFIC workflow step only.

If this step is part of a larger workflow:
- Use preconditions to reference previous steps
- Verify transition to the next step only
- Do NOT re-test the full end-to-end workflow unless explicitly required by the SRS

1. **Workflow Step Tests:**
   - Test this specific workflow step with valid inputs
   - Test this step with invalid inputs and error conditions
   - Verify state transitions to the next step (if applicable)

2. **Precondition Tests:**
   - Test that required previous steps are completed (reference in preconditions)
   - Test error handling if previous steps are not completed

3. **State Transition Tests:**
   - Verify correct state change for this step
   - Test invalid state transitions are prevented
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

export const FEATURE_EXTRACTION_PROMPT_TEMPLATE = `You are an expert SRS Feature Extractor. Extract ALL atomic features from the SRS text below.

IMPORTANT:
The input document may NOT follow any SRS standard or structure.
Do NOT assume chapters, sections, or formal requirements.
Extract features from free text, explanations, examples, and informal descriptions.

CRITICAL: Extract ALL atomic functional, workflow, notification, report, interface, and quality requirements.
DO NOT merge steps. Each user action or system reaction = separate feature.

{adaptivePromptText}
{contextStats}

**SRS TEXT CONTEXT (may be organized in chapters, sections, lists, tables, use cases, user stories, narratives, examples, or any structure):**
{context}

Extract ALL atomic features from the SRS text above. Return JSON array:`;

export const TEST_CASE_GENERATION_PROMPT_TEMPLATE = `You are an expert QA engineer specializing in comprehensive test case design. Based on the following feature description and project requirements context, generate diverse, high-quality test cases.

**FEW-SHOT EXAMPLES - LEARN FROM THESE PATTERNS:**

{testCaseExamples}

**END EXAMPLES - NOW APPLY THESE PATTERNS TO YOUR TEST CASES**

**FEATURE TYPE:** {featureType}
{featureTypeGuidance}

**ENHANCED TEST CASE GENERATION FRAMEWORK:**

**1. RISK-BASED TEST STRATEGY:**
- **Critical Path Testing:** Test the most important user journeys and business-critical scenarios
- **Business Impact Analysis:** Prioritize tests based on revenue impact, customer experience, and regulatory requirements
- **Technical Risk Assessment:** Focus on complex integrations, data integrity, and performance-critical operations
- **Compliance Requirements:** Ensure all regulatory and legal requirements are covered

**2. COMPREHENSIVE COVERAGE MATRIX:**

   **A. POSITIVE TEST SCENARIOS (Happy Paths):**
   - Primary success workflows with valid data
   - Alternative success paths and edge cases
   - Optimal performance conditions
   - Expected user behavior patterns

   **B. NEGATIVE TEST SCENARIOS (Error Handling):**
   - Invalid input data and format violations
   - Missing required information
   - System error conditions and failures
   - Unauthorized access attempts
   - Network and connectivity issues
   - Database and external service failures

   **C. BOUNDARY & EDGE CASE TESTING:**
   - Minimum and maximum data values
   - Time and date boundary conditions
   - Resource limit testing (memory, storage, bandwidth)
   - Concurrent user and load scenarios
   - Data volume extremes (empty, single item, large datasets)

   **D. INTEGRATION & INTEROPERABILITY:**
   - Cross-system data flow and synchronization
   - API and service integration points
   - Third-party system interactions
   - Data import/export functionality
   - Message queue and event-driven processing

**3. ADVANCED TESTING DIMENSIONS:**

   **SECURITY TESTING PATTERNS:**
   - Authentication and authorization bypass attempts
   - Input validation and injection attack prevention
   - Data privacy and confidentiality protection
   - Session management and timeout handling
   - Audit trail and logging verification

   **PERFORMANCE & SCALABILITY:**
   - Response time validation under various loads
   - Resource utilization monitoring and limits
   - Concurrent user capacity testing
   - Data processing throughput validation
   - Memory leak and degradation testing

   **USABILITY & ACCESSIBILITY:**
   - Intuitive user interface and navigation
   - Error message clarity and user guidance
   - Multi-device and cross-browser compatibility
   - Accessibility compliance (WCAG standards)
   - Internationalization and localization support

**4. TEST CASE QUALITY CRITERIA:**

   **UNIQUENESS & DIVERSITY:**
   - Each test case must have unique title, description, and expected result
   - Avoid redundant scenarios with minor wording variations
   - Ensure coverage across different user roles, data conditions, and system states
   - Include both technical and business perspective testing

   **SRS ALIGNMENT:**
   - Reference specific SRS section numbers in descriptions
   - Use exact terminology and actor names from SRS
   - Validate against stated requirements and constraints
   - Include acceptance criteria from SRS where available

   **TESTABILITY & MAINTAINABILITY:**
   - Clear, actionable test steps with measurable outcomes
   - Realistic preconditions and test data requirements
   - Independent test cases that can run in any order
   - Appropriate priority levels based on business impact

**TEST CASE STRUCTURE:**
For each test case, provide:
- testCaseId: unique identifier (format: TC_XXX)
- title: clear, descriptive title indicating what is being tested
- description: detailed scenario description with SRS section references
- steps: array of specific, actionable test steps
- expectedResult: measurable, verifiable expected outcomes
- priority: critical, high, medium, or low based on risk assessment
- status: "pending"
- preconditions: array of required setup conditions
- testData: object with specific test data requirements

**PRIORITY CALCULATION GUIDELINES:**
- **Critical:** Core business functionality, regulatory requirements, data integrity
- **High:** Important user features, performance requirements, security features
- **Medium:** Standard functionality, nice-to-have features
- **Low:** Edge cases, cosmetic features, future enhancements

**DIVERSIFICATION CHECKLIST:**
□ Critical path scenarios covered
□ Negative testing patterns included
□ Boundary and edge cases tested
□ Different user roles/actors tested
□ Various data conditions covered
□ Integration points validated
□ Performance and scalability considered
□ Security aspects addressed
□ Usability factors included
□ SRS requirements fully covered

**GENERATION PROCESS - FOLLOW THESE STEPS IN ORDER:**

STEP 1: READ AND UNDERSTAND
- Read the Feature Description carefully
- Read ALL SRS Context provided
- Identify key requirements and scenarios mentioned
- Note any specific constraints, validations, or business rules

STEP 2: PLAN TEST COVERAGE
- List all scenario types needed (Happy, Negative, Boundary, Integration)
- List all actors/users mentioned in SRS
- List all data variations to test
- List all business rules to verify

**BEFORE GENERATING TEST CASES – READ CAREFULLY:**
{commonMistakesWarning}

STEP 3: GENERATE TEST CASES
- Generate all test cases necessary to cover all Happy Path scenarios
- Generate all test cases necessary to cover all Negative/Error scenarios
- Generate all test cases necessary to cover all Boundary/Edge cases
- Generate all test cases necessary to cover all Integration points
- Generate all test cases necessary to cover Security, Performance, Usability, Accessibility, and any special conditions
- Do not limit the number of test cases. Generate as many as required for complete coverage
- Do NOT add redundant or low-value cases
- Use the FEW-SHOT EXAMPLES as templates
- Follow the TEST CASE STRUCTURE exactly
- Reference SRS sections in every test case
- Make each test case UNIQUE (different scenario, different data, different expected result)

STEP 4: SELF-CHECK
{selfCheckInstructions}

STEP 5: RETURN JSON
- Verify JSON is valid (matching braces, no trailing commas)
- Return ONLY the JSON object
- Start with {{ "testCases": [
- End with ]}}

**NOW GENERATE THE TEST CASES:**

**Feature Description:**
{featureDescription}
{sectionContext}

**Project Requirements Context:**
{context}

Generate comprehensive, diverse, and high-quality test cases. Return the JSON object:`;

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
  "integrationPlan": {{
    "description": "How sections should integrate",
    "flow": ["step 1", "step 2"],
    "sectionReferences": ["4.2.1", "3.1.2"]
  }}
}}

**IMPORTANT:**
- Return valid JSON format
- Use section numbers/IDs from the provided context where available
- Be specific and detailed in analyses (backend will handle JSON parsing)
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

**STRICT RULES:**
- Generate VALID Gherkin syntax only
- Generate EXACTLY ONE Scenario
- Do NOT generate multiple scenarios
- Use Given, When, Then as PRIMARY step keywords
- And/But are allowed ONLY to continue the SAME step type
- Steps must be atomic and testable
- Do NOT invent steps outside Feature or SRS context
- Avoid UI-specific wording unless explicitly stated

**TASK:** Convert the following test case into a well-formatted Gherkin feature file with proper syntax and clear, business-readable language.

{featureContext}
{srsContext}

**TEST CASE TO CONVERT:**
- Title: {title}
- Description: {description}
- Preconditions: {preconditions}
- Steps: {steps}
- Expected Result: {expectedResult}

**GHERKIN CONVERSION RULES:**

1. **Feature Declaration:**
   - Create a clear Feature name based on the test case title
   - Remove special characters, keep it concise and descriptive
   - Use title case (e.g., "User Login Feature" not "user login feature")
   - If description exists, add it under Feature with proper indentation (2 spaces)

2. **Scenario Declaration:**
   - Use this scenario name: {scenarioName}
   - Format: Scenario: {scenarioName}

3. **Step Structure and Keywords:**
   - **Given** - Use for initial state, preconditions, and setup (what must be true before the action)
     - Example: "Given the user is logged in"
     - Example: "Given a customer account exists"
   - **When** - Use for actions, user interactions, or system events (what happens/triggers the behavior)
     - Example: "When the user clicks the Submit button"
     - Example: "When the system receives a payment request"
   - **Then** - Use for expected outcomes, verifications, and assertions (what should happen)
     - Example: "Then the user should see a success message"
     - Example: "Then the order status should be updated to 'Confirmed'"
   - **And/But** - Use to continue steps of the same type (context)
     - Example: "Given the user is logged in\n    And the user has sufficient balance"
     - Example: "Then the payment should be processed\n    But no confirmation email should be sent"

4. **Step Quality Guidelines:**
   - Write steps in natural, business-friendly language
   - Remove technical jargon - use business terminology
   - Make steps clear, concise, and action-oriented
   - Each step should describe ONE action or verification
   - Use present tense ("user clicks" not "user clicked")
   - Use active voice ("the system displays" not "is displayed")
   - Make steps independent and understandable on their own

5. **Preconditions Handling:**
   - Convert ALL preconditions to Given steps
   - Each precondition becomes a separate Given step (or use And to chain them)
   - If multiple preconditions exist, list them as separate Given/And steps
   - Example: If preconditions are ["User is logged in", "Account has balance"]
     Output:
     Given the user is logged in
       And the account has sufficient balance

6. **Steps Conversion:**
   - Convert test case steps to When/Then steps appropriately
   - Action steps → When
   - Verification/Assertion steps → Then
   - If a step mixes action and verification, split it into When + Then
   - Remove any existing keywords from step text (Given/When/Then/And/But)
   - Clean up numbering (1., 2., etc.) - remove them

7. **Expected Result Handling:**
   - Convert ALL expected results to Then steps
   - If multiple expected results, use Then for first, And for subsequent
   - Be specific and verifiable
   - Reference actual expected outcomes from the test case

8. **Formatting:**
   - Use proper indentation: 2 spaces for Feature/Scenario, 4 spaces for steps
   - Each step on a single line
   - Add blank line between Feature and Scenario
   - Add blank line between Scenario and steps
   - No trailing spaces

9. **Best Practices:**
   - Keep scenario focused on one specific behavior
   - Use domain language from SRS context when available
   - Make it readable by business stakeholders, not just developers
   - Ensure steps are testable and verifiable

**EXAMPLE OUTPUT FORMAT:**
Feature: User Login

  As a user
  I want to log into the system
  So that I can access my account

  Scenario: Successful login with valid credentials
    Given the user is on the login page
      And a valid user account exists
    When the user enters valid username and password
      And clicks the Login button
    Then the user should be redirected to the dashboard
      And a welcome message should be displayed

**CRITICAL REQUIREMENTS:**
- Output ONLY the Gherkin code - no explanations, no markdown code blocks, no wrapping
- Start directly with "Feature:" 
- Ensure proper Gherkin syntax - every step must start with Given/When/Then/And/But
- Clean up any keywords already present in step text
- Remove step numbers (1., 2., etc.)
- Make language natural, business-friendly, and clear
- Use proper indentation and spacing
- Each step on single line
- Prefer SRS context over test case wording when conflicts exist
- Do NOT infer behavior not explicitly stated in SRS or Feature context

**WORDING IMPROVEMENT (if improveWording enabled):**
- Improve clarity and grammar
- Do NOT change meaning
- Do NOT add new behavior

**OUTPUT:**`;
