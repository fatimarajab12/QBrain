# 🔄 Workflows التفصيلية - شرح شامل لكل حالة
## A Clean, Academic, and Fully Explained Version

---

## 📋 المحتويات

1. [Workflow 1: توليد Features من SRS](#workflow-1-توليد-features-من-srs)
2. [Workflow 2: توليد Test Cases لـ Feature](#workflow-2-توليد-test-cases-لـ-feature)
3. [Workflow 3: Chatbot Query (سؤال AI)](#workflow-3-chatbot-query-سؤال-ai)
4. [Workflow 4: Get Context (جلب السياق)](#workflow-4-get-context-جلب-السياق)
5. [Workflow 5: Section Matching Analysis](#workflow-5-section-matching-analysis)

---

# Workflow 1: توليد Features من SRS

## 🎯 الهدف

استخراج Features (الميزات) من وثيقة SRS باستخدام RAG و AI.

---

## 📍 Endpoint

```
POST /api/features/projects/:projectId/generate-features
```

---

## 🔄 سير العمل الكامل

```
┌─────────────────────────────────────────────────────────────┐
│  1. Request → Controller                                    │
│     POST /api/features/projects/:projectId/generate-features│
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  2. featureService.generateFeaturesFromSRS()                │
│     - التحقق من Project ID                                  │
│     - جلب المشروع من MongoDB                                │
│     - التحقق من وجود SRS معالج                              │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  3. generateFeaturesFromRAG()                               │
│     [ragService/featureExtraction.js]                       │
│     - اكتشاف نوع SRS                                        │
│     - استرجاع السياق من RAG                                 │
│     - بناء Prompt                                           │
│     - استدعاء LLM                                           │
│     - تحليل JSON                                            │
│     - تحسين Features                                        │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  4. حفظ Features في MongoDB                                 │
│     - loop على كل Feature                                   │
│     - createFeature() لكل واحد                             │
│     - حفظ Vector Embeddings                                 │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Response                                                │
│     ✅ Features محفوظة ومجهزة                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 التفاصيل خطوة بخطوة

### Step 1: Request Handler

**الملف:** `backend/routes/features.routes.js` (مفترض)

```javascript
router.post("/projects/:projectId/generate-features", 
  authMiddleware, 
  featuresController.generateFeaturesFromSRS
);
```

**ما يحدث:**
- ✅ التحقق من Authentication
- 📋 استخراج `projectId` من URL params
- 📤 تمرير Request إلى Controller

---

### Step 2: Controller → Service

**الملف:** `backend/services/featureService.js`

```javascript
export async function generateFeaturesFromSRS(projectId, options = {}) {
  // 1. التحقق من Project ID
  const id = validateObjectId(projectId, "Project ID");
  
  // 2. جلب المشروع
  const project = await Project.findById(id);
  if (!project) {
    throw new Error("Project not found");
  }
  
  // 3. التحقق من وجود SRS معالج
  if (!project.srsDocument?.processed) {
    throw new Error("SRS document not processed. Please upload and process SRS first.");
  }
  
  // 4. استدعاء RAG Service
  const generatedFeatures = await generateFeaturesFromRAG(
    project._id.toString(), 
    options
  );
```

**ما يحدث:**
- ✅ التحقق من صحة Project ID
- 🔍 جلب المشروع من MongoDB
- ✅ التأكد من وجود SRS معالج
- 🔄 استدعاء دالة RAG الرئيسية

---

### Step 3: RAG Service - Feature Extraction

**الملف:** `backend/ai/ragService/featureExtraction.js`

#### 3.1 اكتشاف نوع SRS

```javascript
const srsType = await detectSRSType(projectId);
```

**الدالة:** `detectSRSType()` في `srsDetection.js`

**ما يحدث:**
1. 🔍 جلب sample chunks من SRS (10 chunks)
2. 📊 تحليل النص للبحث عن keywords
3. 🎯 مطابقة الأنماط:
   - `IEEE_830`: "IEEE Std 830", "3.1.1", "3.2.1"...
   - `AGILE`: "User Story", "As a", "Acceptance Criteria"...
   - `ENERGY`: "electricity", "voltage", "JDECo"...
   - `ENTERPRISE`: "Business Requirements", "Stakeholder"...
4. ✅ إرجاع النوع مع confidence score

**النتيجة:**
```javascript
{
  type: "IEEE_830",
  name: "IEEE 830",
  confidence: 95.5,
  description: "Standard IEEE 830 SRS format"
}
```

---

#### 3.2 استرجاع السياق من RAG

**طريقتان:**

##### أ) طريقة بسيطة (افتراضي):

```javascript
contextChunks = await getRAGContext(
  projectId,
  "requirements features specifications",
  nContextChunks  // افتراضي: 10
);
```

**الدالة:** `getRAGContext()` في `retrieval.js`

**ما يحدث:**
1. 🔧 توسيع Query: `expandQuery("requirements features specifications")`
   - إضافة مصطلحات ذات صلة
2. 🔢 توليد Embedding للـ Query (OpenAI)
3. 🔍 البحث في Supabase باستخدام cosine similarity
4. 📊 ترتيب النتائج حسب الصلة
5. ✅ إرجاع أفضل `nContextChunks` chunks

**النتيجة:**
```javascript
[
  {
    text: "3.2.1 User Login: The system must allow users...",
    metadata: { source: "SRS", chunkIndex: 12 },
    relevance: 0.95
  },
  ...
]
```

##### ب) طريقة شاملة (إذا `useComprehensiveRetrieval = true`):

```javascript
const comprehensiveResult = await getComprehensiveRAGContext(
  projectId, 
  chunksPerQuery  // افتراضي: 3
);
contextChunks = comprehensiveResult.chunks;
```

**الدالة:** `getComprehensiveRAGContext()` في `retrieval.js`

**ما يحدث:**
1. 🔄 تنفيذ 8 queries مختلفة:
   - `"requirements functional features"`
   - `"data dictionary field table column"`
   - `"interface user software hardware API"`
   - `"quality performance security usability"`
   - `"constraint assumption dependency"`
   - `"report document format output"`
   - `"notification alert message"`
   - `"workflow process step procedure"`
2. 📊 لكل query يجلب `chunksPerQuery` chunks
3. 🔗 يدمج النتائج ويزيل التكرار
4. 📋 يضيف category لكل chunk

**النتيجة:**
```javascript
{
  chunks: [...],  // ~24 unique chunks
  byCategory: {
    FUNCTIONAL: [...],
    DATA: [...],
    ...
  },
  totalQueries: 8,
  totalChunks: 24
}
```

---

#### 3.3 تجميع Chunks حسب الأقسام (إذا comprehensive)

```javascript
if (useComprehensiveRetrieval) {
  groupedChunks = groupChunksBySections(contextChunks);
}
```

**الدالة:** `groupChunksBySections()` في `sections.js`

**ما يحدث:**
1. 🔍 استخراج أرقام الأقسام من كل chunk (مثل "3.2.1")
2. 📋 تجميع chunks حسب القسم
3. ✅ إنشاء map: `sectionId → chunks[]`

**النتيجة:**
```javascript
{
  bySection: {
    "3.2.1": {
      sectionId: "3.2.1",
      chunks: [...],
      allSections: ["3.2.1", "3.2.1.1"]
    },
    ...
  },
  ungrouped: [...],
  sectionCount: 15,
  totalChunks: 24
}
```

---

#### 3.4 تنظيم السياق

```javascript
if (groupedChunks) {
  // تنظيم حسب الأقسام
  const sectionContexts = Object.values(groupedChunks.bySection).map(section => 
    `[Section ${section.sectionId}]\n${section.chunks.map(c => c.text).join("\n\n")}`
  );
  context = sectionContexts.join("\n\n---\n\n");
} else {
  // دمج بسيط
  context = contextChunks.map((chunk) => chunk.text).join("\n\n");
}
```

**النتيجة:** نص منظم جاهز للـ Prompt

---

#### 3.5 بناء Prompt

```javascript
const adaptivePromptText = createAdaptivePrompt(srsType);
const prompt = PromptTemplate.fromTemplate(`You are an SRS Feature Extractor...

${adaptivePromptText}

SRS Text:
{context}

Extract all features from the SRS text above. Return JSON array:`);
```

**الدالة:** `createAdaptivePrompt()` في `prompts.js`

**ما يحدث:**
1. 📝 بناء قواعد الاستخراج الأساسية
2. 🎯 إضافة إرشادات خاصة بنوع SRS (IEEE 830, Agile, etc.)
3. 📋 إضافة أنواع Features المطلوبة
4. ✅ إرجاع نص Prompt كامل

---

#### 3.6 استدعاء LLM

```javascript
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

const formattedPrompt = await prompt.format({ context });
const result = await llm.invoke(formattedPrompt);
const content = result.content;
```

**ما يحدث:**
- 📤 إرسال Prompt إلى OpenAI API
- ⏳ انتظار الاستجابة (10-30 ثانية)
- 📥 استلام JSON من LLM

**مثال على الاستجابة:**
```json
[
  {
    "featureId": "feature_001",
    "name": "تسجيل الدخول",
    "description": "المستخدم يجب أن يكون قادراً على تسجيل الدخول",
    "featureType": "FUNCTIONAL",
    "priority": "High",
    "matchedSections": ["3.2.1"],
    "reasoning": "This feature is explicitly stated in SRS section 3.2.1",
    "confidence": 0.9
  },
  ...
]
```

---

#### 3.7 تحليل JSON

```javascript
const parsed = parseJSONSafely(content);
const features = Array.isArray(parsed) ? parsed : parsed.features || [];
```

**الدالة:** `parseJSONSafely()` في `utils.js`

**ما يحدث:**
1. 🔧 استخراج JSON من النص (إزالة markdown code blocks)
2. 🛠️ إصلاح المشاكل الشائعة (trailing commas, comments)
3. 📊 محاولات متعددة مع retry
4. ✅ إرجاع parsed JSON

---

#### 3.8 تحسين Features

```javascript
const enhancedFeatures = enhanceFeatures(features, contextChunks, groupedChunks);
enhancedFeatures.sort((a, b) => b.rankingScore - a.rankingScore);
```

**الدالة:** `enhanceFeatures()` (داخلية)

**ما يحدث لكل Feature:**
1. 🔍 إيجاد matching chunks من السياق
2. 🏷️ تصنيف نوع Feature تلقائياً (`classifyFeatureType()`)
3. 📊 حساب النقاط:
   - **Relevance Score:** متوسط relevance من matching chunks
   - **Priority Score:** High=3, Medium=2, Low=1
   - **Ranking Score:** (relevance × 0.5) + (priority/3 × 0.3) + (confidence × 0.2)
4. ✅ إضافة metadata إضافية

**النتيجة:**
```javascript
{
  ...feature,
  featureType: "FUNCTIONAL",
  relevanceScore: 0.95,
  rankingScore: 0.875,
  matchedChunksCount: 3,
  matchedSectionInfo: { sectionId: "3.2.1", chunksCount: 5 },
  reasoning: "...",
  matchedSections: ["3.2.1"],
  confidence: 0.9
}
```

---

#### 3.9 تحليل التغطية (إذا comprehensive)

```javascript
if (groupedChunks) {
  coverageAnalysis = analyzeSectionCoverage(enhancedFeatures, groupedChunks);
}
```

**الدالة:** `analyzeSectionCoverage()` في `sections.js`

**ما يحدث:**
- 📊 حساب كم قسم تم تغطيته بـ Features
- 🔍 إيجاد الأقسام المفقودة
- ✅ إرجاع تقرير تغطية

---

### Step 4: حفظ Features في MongoDB

**الملف:** `backend/services/featureService.js`

```javascript
for (const featureData of generatedFeatures) {
  // فصل بيانات ranking
  const {
    relevanceScore,
    rankingScore,
    matchedChunksCount,
    reasoning,
    matchedSections,
    confidence,
    ...featureFields
  } = featureData;
  
  // إنشاء Feature
  const feature = await createFeature({
    ...featureFields,
    projectId: id,
    isAIGenerated: true,
    aiGenerationContext: JSON.stringify({
      ...options,
      relevanceScore,
      rankingScore,
      matchedChunksCount,
    }),
    reasoning: reasoning || null,
    matchedSections: matchedSections || [],
    confidence: confidence || null,
  });
}
```

**الدالة:** `createFeature()` في `featureService.js`

**ما يحدث:**
1. 💾 حفظ Feature في MongoDB
2. 🔢 إنشاء Feature Document للـ Vector Store
3. 💾 حفظ في Supabase (مع توليد Embedding تلقائياً)

---

### Step 5: Response

```javascript
return savedFeatures;
```

**الاستجابة:**
```json
[
  {
    "_id": "...",
    "name": "تسجيل الدخول",
    "description": "...",
    "priority": "High",
    "isAIGenerated": true,
    ...
  },
  ...
]
```

---

## 📊 ملخص الدوال المستخدمة

| الدالة | الملف | الوظيفة |
|--------|-------|----------|
| `generateFeaturesFromSRS()` | `featureService.js` | نقطة البداية |
| `generateFeaturesFromRAG()` | `featureExtraction.js` | استخراج Features من RAG |
| `detectSRSType()` | `srsDetection.js` | اكتشاف نوع SRS |
| `getRAGContext()` | `retrieval.js` | جلب سياق واحد |
| `getComprehensiveRAGContext()` | `retrieval.js` | جلب سياق شامل (8 queries) |
| `groupChunksBySections()` | `sections.js` | تجميع chunks حسب الأقسام |
| `createAdaptivePrompt()` | `prompts.js` | بناء Prompt ذكي |
| `parseJSONSafely()` | `utils.js` | تحليل JSON بأمان |
| `enhanceFeatures()` | `featureExtraction.js` | تحسين Features |
| `analyzeSectionCoverage()` | `sections.js` | تحليل التغطية |
| `createFeature()` | `featureService.js` | حفظ Feature |

---

# Workflow 2: توليد Test Cases لـ Feature

## 🎯 الهدف

توليد Test Cases (حالات الاختبار) لـ Feature معين بناءً على SRS.

---

## 📍 Endpoint

```
POST /api/test-cases/features/:featureId/generate-test-cases
```

---

## 🔄 سير العمل الكامل

```
┌─────────────────────────────────────────────────────────────┐
│  1. Request → Controller                                    │
│     POST /api/test-cases/features/:featureId/generate       │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  2. testCaseService.generateTestCasesForFeature()           │
│     - التحقق من Feature ID                                  │
│     - جلب Feature من MongoDB                                │
│     - بناء وصف Feature                                      │
│     - استخراج metadata (featureType, matchedSections)      │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  3. generateTestCasesFromRAG()                              │
│     [ragService/analysis.js]                                │
│     - جلب سياق من matchedSections (إذا موجود)              │
│     - جلب سياق عام من SRS                                   │
│     - بناء Prompt حسب نوع Feature                           │
│     - استدعاء LLM                                           │
│     - تحليل JSON                                            │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  4. حفظ Test Cases في MongoDB                               │
│     - loop على كل Test Case                                 │
│     - createTestCase() لكل واحد                            │
│     - حفظ Vector Embeddings                                 │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Response                                                │
│     ✅ Test Cases محفوظة ومجهزة                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 التفاصيل خطوة بخطوة

### Step 1: Request Handler

```javascript
router.post("/features/:featureId/generate-test-cases",
  authMiddleware,
  testCasesController.generateTestCasesForFeature
);
```

---

### Step 2: Service - تحضير Feature

**الملف:** `backend/services/testCaseService.js`

```javascript
export async function generateTestCasesForFeature(featureId, options = {}) {
  // 1. التحقق من Feature ID
  const id = validateObjectId(featureId, "Feature ID");
  
  // 2. جلب Feature
  const feature = await Feature.findById(id).populate("projectId");
  if (!feature) {
    throw new Error("Feature not found");
  }
  
  // 3. التحقق من وجود SRS معالج
  const project = feature.projectId;
  if (!project.srsDocument?.processed) {
    throw new Error("SRS document not processed.");
  }
  
  // 4. بناء وصف Feature شامل
  const featureDescription = `
${feature.name}

${feature.description || ""}

Acceptance Criteria: ${feature.acceptanceCriteria?.join(", ") || "N/A"}

Reasoning: ${feature.reasoning || "N/A"}
  `;
  
  // 5. استخراج metadata
  let featureType = "FUNCTIONAL"; // Default
  if (feature.metadata instanceof Map) {
    featureType = feature.metadata.get('featureType') || featureType;
  }
  
  const matchedSections = feature.matchedSections || [];
  const featurePriority = feature.priority || "Medium";
  
  // 6. تحضير Options محسّنة
  const enhancedOptions = {
    ...options,
    featureType: featureType,
    matchedSections: matchedSections,
    featurePriority: featurePriority,
    useComprehensiveRetrieval: options.useComprehensiveRetrieval !== false,
  };
```

**ما يحدث:**
- ✅ التحقق من Feature و Project
- 📝 بناء وصف شامل للـ Feature
- 🏷️ استخراج نوع Feature و matchedSections
- 🔧 تحضير Options للـ RAG

---

### Step 3: RAG Service - Test Case Generation

**الملف:** `backend/ai/ragService/analysis.js`

#### 3.1 جلب سياق من matchedSections (إذا موجود)

```javascript
if (matchedSections && matchedSections.length > 0) {
  const sectionChunks = await getContextFromSections(
    projectId, 
    matchedSections, 
    3
  );
  contextChunks.push(...sectionChunks);
  
  sectionContext = `\n**Feature is from SRS Sections:** ${matchedSections.join(", ")}\nUse the exact specifications from these sections when building test cases.`;
}
```

**الدالة:** `getContextFromSections()` (داخلية)

**ما يحدث:**
- 🔍 لكل section في `matchedSections`
- 🔎 بحث: `"section 3.2.1 requirements specifications"`
- 📊 جلب 3 chunks لكل section
- ✅ إضافة `sourceSection` metadata

---

#### 3.2 جلب سياق عام

```javascript
if (useComprehensiveRetrieval) {
  const comprehensiveResult = await getComprehensiveRAGContext(projectId, 2);
  contextChunks.push(...comprehensiveResult.chunks);
} else {
  const generalChunks = await getRAGContext(
    projectId,
    featureDescription,
    nContextChunks  // افتراضي: 5
  );
  contextChunks.push(...generalChunks);
}
```

**ما يحدث:**
- 🔄 إذا comprehensive → 8 queries
- 🎯 إذا عادي → query واحد بناءً على featureDescription
- ✅ دمج مع section chunks

---

#### 3.3 إزالة التكرار

```javascript
const uniqueChunks = [];
const seenTexts = new Set();

for (const chunk of contextChunks) {
  const textHash = chunk.text.substring(0, 100).toLowerCase();
  if (!seenTexts.has(textHash)) {
    seenTexts.add(textHash);
    uniqueChunks.push(chunk);
  }
}
```

**ما يحدث:**
- 🔍 استخدام أول 100 حرف كـ hash
- ✅ إزالة chunks مكررة

---

#### 3.4 بناء السياق المنظم

```javascript
const context = uniqueChunks.map((chunk) => {
  const sectionInfo = chunk.sourceSection 
    ? `[From Section ${chunk.sourceSection}]` 
    : "";
  return `${sectionInfo}\n${chunk.text}`;
}).join("\n\n");
```

**النتيجة:**
```
[From Section 3.2.1]
المستخدم يجب أن يكون قادراً على تسجيل الدخول...

[From Section 3.2.1.1]
كلمات المرور يجب أن تكون...

---
نص عام من SRS...
```

---

#### 3.5 بناء Prompt حسب نوع Feature

```javascript
const featureTypeGuidance = createTestCasePromptByFeatureType(
  featureType, 
  matchedSections
);
```

**الدالة:** `createTestCasePromptByFeatureType()` في `prompts.js`

**ما يحدث:**
- 📝 بناء إرشادات خاصة بنوع Feature:
  - **FUNCTIONAL:** Happy Path, Negative, Alternative Paths
  - **DATA:** Field validation, Boundary tests, Data integrity
  - **WORKFLOW:** End-to-end workflows, State transitions
  - **QUALITY:** Performance, Security, Usability tests
  - **INTERFACE:** UI, API, Hardware interface tests
  - **REPORT:** Report content, generation, access tests
  - **CONSTRAINT:** Business rules, compliance tests
  - **NOTIFICATION:** Delivery, content, failure tests
- ✅ إضافة section context إذا موجود

---

#### 3.6 بناء Prompt كامل

```javascript
const prompt = PromptTemplate.fromTemplate(`You are an expert QA engineer...

**FEATURE TYPE:** {featureType}
{featureTypeGuidance}

**TEST CASE GENERATION RULES:**
1. Build test cases based on the feature type and SRS specifications
2. For FUNCTIONAL features: Create functional test cases...
...

**Feature Description:**
{featureDescription}
{sectionContext}

**Project Requirements Context:**
{context}

Generate comprehensive test cases now...`);
```

---

#### 3.7 استدعاء LLM

```javascript
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.3,  // أقل للدقة
  apiKey: process.env.OPENAI_API_KEY,
  modelKwargs: {
    response_format: { type: "json_object" }  // JSON mode
  },
});

const formattedPrompt = await prompt.format({
  featureDescription,
  context,
  featureType,
  featureTypeGuidance,
  sectionContext,
});

const result = await llm.invoke(formattedPrompt);
```

**ما يحدث:**
- 📤 إرسال Prompt إلى OpenAI
- ⏳ انتظار الاستجابة
- 📥 استلام JSON

**مثال على الاستجابة:**
```json
{
  "testCases": [
    {
      "testCaseId": "TC_001",
      "title": "تسجيل الدخول بنجاح",
      "description": "اختبار تسجيل الدخول باستخدام بيانات صحيحة",
      "steps": [
        "1. فتح صفحة تسجيل الدخول",
        "2. إدخال البريد الإلكتروني",
        "3. إدخال كلمة المرور",
        "4. الضغط على زر تسجيل الدخول"
      ],
      "expectedResult": "يجب أن يتم تسجيل الدخول بنجاح",
      "priority": "high",
      "status": "pending",
      "preconditions": ["المستخدم مسجل في النظام"]
    },
    ...
  ]
}
```

---

#### 3.8 تحليل JSON مع Retry

```javascript
let content = null;
let parsed = null;
const maxRetries = 2;

for (let attempt = 0; attempt <= maxRetries; attempt++) {
  try {
    if (attempt > 0) {
      // إضافة retry instruction
      const retryPrompt = formattedPrompt + "\n\n**RETRY INSTRUCTION:** Please ensure the JSON is valid...";
      const result = await llm.invoke(retryPrompt);
      content = result.content;
    } else {
      const result = await llm.invoke(formattedPrompt);
      content = result.content;
    }
    
    parsed = parseJSONSafely(content, 1);
    break; // Success
  } catch (error) {
    if (attempt === maxRetries) {
      throw error;
    }
    console.warn(`JSON parsing failed on attempt ${attempt + 1}, retrying...`);
  }
}
```

**ما يحدث:**
- 🔄 محاولات متعددة (حتى 3 محاولات)
- 🛠️ إصلاح تلقائي في كل محاولة
- ✅ إرجاع parsed JSON

---

#### 3.9 معالجة صيغ مختلفة

```javascript
let testCases = [];
if (Array.isArray(parsed)) {
  testCases = parsed;
} else if (parsed.testCases && Array.isArray(parsed.testCases)) {
  testCases = parsed.testCases;
} else if (typeof parsed === 'object') {
  const arrayKeys = Object.keys(parsed).filter(key => Array.isArray(parsed[key]));
  if (arrayKeys.length > 0) {
    testCases = parsed[arrayKeys[0]];
  }
}
```

**ما يحدث:**
- 🔍 دعم صيغ مختلفة:
  - Array مباشرة: `[{...}, {...}]`
  - Object مع testCases: `{ testCases: [{...}] }`
  - أي array في object

---

#### 3.10 تحسين Test Cases

```javascript
const enhancedTestCases = testCases
  .filter(tc => tc && typeof tc === 'object')
  .map((tc, index) => {
    if (!tc.title) {
      return null;  // Skip invalid
    }
    
    return {
      title: String(tc.title || `Test Case ${index + 1}`),
      description: String(tc.description || ''),
      steps: Array.isArray(tc.steps) ? tc.steps.map(s => String(s)) : [],
      expectedResult: String(tc.expectedResult || ''),
      priority: ['high', 'medium', 'low'].includes(tc.priority?.toLowerCase()) 
        ? tc.priority.toLowerCase() 
        : 'medium',
      status: 'pending',
      preconditions: Array.isArray(tc.preconditions) 
        ? tc.preconditions.map(p => String(p)) 
        : [],
      testCaseId: tc.testCaseId || `TC_${String(index + 1).padStart(3, '0')}`,
      testData: tc.testData || {},
    };
  })
  .filter(tc => tc !== null);
```

**ما يحدث:**
- ✅ التحقق من الحقول المطلوبة
- 🔧 تحويل جميع القيم إلى Strings
- 📊 تعيين قيم افتراضية
- 🆔 توليد testCaseId إذا لم يكن موجوداً

---

### Step 4: حفظ Test Cases في MongoDB

```javascript
for (const testCaseData of generatedTestCases) {
  // تعيين priority بناءً على feature priority
  const testCasePriority = testCaseData.priority || 
    (featurePriority === "High" ? "high" : 
     featurePriority === "Low" ? "low" : "medium");

  const testCase = await createTestCase({
    ...testCaseData,
    featureId: feature._id,
    projectId: project._id,
    priority: testCasePriority,
    isAIGenerated: true,
    aiGenerationContext: JSON.stringify({
      ...enhancedOptions,
      featureName: feature.name,
      featureType: featureType,
      matchedSections: matchedSections,
    }),
  });
}
```

**الدالة:** `createTestCase()` في `testCaseService.js`

**ما يحدث:**
1. 💾 حفظ Test Case في MongoDB
2. 🔢 إنشاء Test Case Document للـ Vector Store
3. 💾 حفظ في Supabase (مع توليد Embedding)

---

## 📊 ملخص الدوال المستخدمة

| الدالة | الملف | الوظيفة |
|--------|-------|----------|
| `generateTestCasesForFeature()` | `testCaseService.js` | نقطة البداية |
| `generateTestCasesFromRAG()` | `analysis.js` | توليد Test Cases من RAG |
| `getContextFromSections()` | `analysis.js` | جلب سياق من sections محددة |
| `getRAGContext()` | `retrieval.js` | جلب سياق عام |
| `getComprehensiveRAGContext()` | `retrieval.js` | جلب سياق شامل |
| `createTestCasePromptByFeatureType()` | `prompts.js` | بناء Prompt حسب نوع Feature |
| `parseJSONSafely()` | `utils.js` | تحليل JSON بأمان |
| `createTestCase()` | `testCaseService.js` | حفظ Test Case |

---

# Workflow 3: Chatbot Query (سؤال AI)

## 🎯 الهدف

الإجابة على سؤال المستخدم بناءً على SRS, Features, و Test Cases.

---

## 📍 Endpoint

```
POST /api/ai/query
```

**Body:**
```json
{
  "projectId": "...",
  "question": "ما هي Features في المشروع؟",
  "nResults": 5
}
```

---

## 🔄 سير العمل الكامل

```
┌─────────────────────────────────────────────────────────────┐
│  1. Request → Controller                                    │
│     POST /api/ai/query                                      │
│     { projectId, question, nResults }                       │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  2. aiController.queryAI()                                  │
│     - التحقق من projectId و question                        │
│     - استدعاء queryRAG()                                    │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  3. queryRAG()                                              │
│     [ragService/query.js]                                   │
│     - توسيع Query                                           │
│     - إنشاء Retriever                                       │
│     - إنشاء LLM Chain                                       │
│     - استدعاء Retrieval Chain                               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Response                                                │
│     ✅ إجابة من AI                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 التفاصيل خطوة بخطوة

### Step 1: Controller

**الملف:** `backend/controllers/aiController.js`

```javascript
export const queryAI = async (req, res) => {
  const { projectId, question } = req.body;
  
  if (!projectId || !question) {
    return res.status(400).json({
      success: false,
      message: "Project ID and question are required",
    });
  }
  
  const nResults = req.body.nResults || 5;
  const response = await queryRAG(projectId, question, nResults);
  
  res.status(200).json({
    success: true,
    data: {
      question,
      answer: response,
      projectId,
    },
  });
};
```

**ما يحدث:**
- ✅ التحقق من المعاملات
- 🔄 استدعاء RAG Service
- 📤 إرجاع الإجابة

---

### Step 2: RAG Query Service

**الملف:** `backend/ai/ragService/query.js`

#### 2.1 توسيع Query

```javascript
const expandedQuestion = expandQuery(question);
```

**الدالة:** `expandQuery()` في `utils/textProcessing.js`

**ما يحدث:**
- 🔧 إضافة مصطلحات ذات صلة
- ✅ تحسين جودة البحث

**مثال:**
```
Input: "Features"
Output: "Features\nrelated terms: feature, requirement, functionality, capability, module, component..."
```

---

#### 2.2 إنشاء Retriever

```javascript
const retriever = await vectorStore.getRetriever(projectId, nResults);

if (!retriever) {
  return "No relevant information found in the project knowledge base.";
}
```

**الدالة:** `vectorStore.getRetriever()` في `vector/vectorStore.js`

**ما يحدث:**
1. 🔍 البحث في Supabase عن documents لـ projectId
2. 🔢 إنشاء Retriever قادر على similarity search
3. ✅ إرجاع Retriever جاهز للاستخدام

---

#### 2.3 إنشاء LLM

```javascript
const llm = new ChatOpenAI({
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});
```

**ما يحدث:**
- 🤖 إنشاء LLM client
- 🌡️ Temperature: 0.7 (توازن بين الدقة والإبداع)

---

#### 2.4 بناء Prompt Templates

```javascript
const systemTemplate = `You are a helpful AI assistant...

**CRITICAL RULES:**
1. You MUST answer ONLY using the provided SRS context
2. Cite section numbers when relevant (e.g., "As per section 3.2.1...")
3. If the answer is not in the context, say "Not in SRS" clearly
4. Be concise and professional in your response
5. The SRS is structured into sections like 3.2.1, 3.2.1.1, etc.

Context from project documentation:
{context}`;

const userTemplate = `Question: {question}

Please provide a helpful answer based on the context above.`;

const chatPrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(systemTemplate),
  HumanMessagePromptTemplate.fromTemplate(userTemplate),
]);
```

**ما يحدث:**
- 📝 بناء System Prompt (قواعد)
- 👤 بناء User Prompt (السؤال)
- 🔗 دمجهم في ChatPromptTemplate

---

#### 2.5 إنشاء Documents Chain

```javascript
const combineDocsChain = await createStuffDocumentsChain({
  llm,
  prompt: chatPrompt,
  documentVariableName: "context",
});
```

**الدالة:** `createStuffDocumentsChain()` من LangChain

**ما يحدث:**
- 🔗 إنشاء chain يدمج جميع documents في context
- 📝 استخدام `{context}` variable في Prompt
- ✅ جاهز لدمج documents

---

#### 2.6 إنشاء Retrieval Chain

```javascript
const retrievalChain = await createRetrievalChain({
  combineDocsChain,
  retriever,
});
```

**الدالة:** `createRetrievalChain()` من LangChain

**ما يحدث:**
- 🔗 ربط Retriever مع Documents Chain
- 🔄 Chain كامل:
  1. يستقبل query
  2. يبحث في Vector Store
  3. يجلب relevant documents
  4. يدمجهم في context
  5. يرسل إلى LLM
  6. يرجع الإجابة

---

#### 2.7 استدعاء Chain

```javascript
const result = await retrievalChain.invoke({
  input: expandedQuestion,
});

return result.output || result.answer || "Unable to generate response";
```

**ما يحدث:**
- 📤 إرسال السؤال الموسع
- ⏳ Chain يعمل تلقائياً:
  1. Retrieval → جلب documents
  2. Combining → دمج في context
  3. LLM → توليد إجابة
- 📥 إرجاع الإجابة

**مثال على الإجابة:**
```
"وفقاً للقسم 3.2.1 من SRS، النظام يجب أن يدعم تسجيل الدخول للمستخدمين.
الميزات الرئيسية تشمل:
- تسجيل الدخول (Section 3.2.1)
- استعادة كلمة المرور (Section 3.2.1.1)
- إدارة الجلسات (Section 3.2.2)"
```

---

## 📊 ملخص الدوال المستخدمة

| الدالة | الملف | الوظيفة |
|--------|-------|----------|
| `queryAI()` | `aiController.js` | Controller handler |
| `queryRAG()` | `query.js` | RAG query service |
| `expandQuery()` | `textProcessing.js` | توسيع Query |
| `vectorStore.getRetriever()` | `vectorStore.js` | إنشاء Retriever |
| `createStuffDocumentsChain()` | LangChain | دمج Documents |
| `createRetrievalChain()` | LangChain | إنشاء Retrieval Chain |

---

# Workflow 4: Get Context (جلب السياق)

## 🎯 الهدف

جلب أجزاء SRS ذات صلة بـ query معين (بدون LLM).

---

## 📍 Endpoint

```
POST /api/ai/context
```

**Body:**
```json
{
  "projectId": "...",
  "query": "authentication login",
  "nResults": 5
}
```

---

## 🔄 سير العمل الكامل

```
┌─────────────────────────────────────────────────────────────┐
│  1. Request → Controller                                    │
│     POST /api/ai/context                                    │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  2. aiController.getContext()                               │
│     - التحقق من projectId و query                           │
│     - استدعاء getRAGContext()                               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  3. getRAGContext()                                         │
│     [ragService/retrieval.js]                               │
│     - توسيع Query                                           │
│     - البحث في Vector Store                                 │
│     - إرجاع Chunks مرتبة                                    │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Response                                                │
│     ✅ Chunks مرتبة حسب الصلة                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 التفاصيل خطوة بخطوة

### Step 1: Controller

**الملف:** `backend/controllers/aiController.js`

```javascript
export const getContext = async (req, res) => {
  const { projectId, query } = req.body;
  
  if (!projectId || !query) {
    return res.status(400).json({
      success: false,
      message: "Project ID and query are required",
    });
  }
  
  const nResults = req.body.nResults || 5;
  const context = await getRAGContext(projectId, query, nResults);
  
  res.status(200).json({
    success: true,
    data: {
      query,
      context,
      projectId,
    },
  });
};
```

---

### Step 2: RAG Context Retrieval

**الملف:** `backend/ai/ragService/retrieval.js`

```javascript
export async function getRAGContext(projectId, query, nResults = 5) {
  // 1. توسيع Query
  const expandedQuery = expandQuery(query);
  
  // 2. البحث في Vector Store
  const similarChunks = await vectorStore.similaritySearch(
    projectId,
    expandedQuery,
    nResults
  );
  
  // 3. تحويل النتائج
  return similarChunks.map((chunk) => ({
    text: chunk.content,
    metadata: chunk.metadata,
    relevance: 1 - chunk.score,  // تحويل score إلى relevance
  }));
}
```

**الدالة:** `vectorStore.similaritySearch()` في `vector/vectorStore.js`

**ما يحدث:**
1. 🔢 توليد Embedding للـ Query (OpenAI)
2. 🔍 البحث في Supabase:
   ```sql
   SELECT *, embedding <=> $1::vector AS score
   FROM project_vectors
   WHERE project_id = $2
   ORDER BY score ASC
   LIMIT $3
   ```
3. 📊 ترتيب حسب similarity (cosine distance)
4. ✅ إرجاع أفضل `nResults` chunks

**النتيجة:**
```javascript
[
  {
    text: "3.2.1 User Login: The system must allow...",
    metadata: { source: "SRS", chunkIndex: 12, fileName: "srs.pdf" },
    relevance: 0.95  // 95% صلة
  },
  {
    text: "Authentication system requirements...",
    metadata: { source: "SRS", chunkIndex: 13 },
    relevance: 0.87
  },
  ...
]
```

---

## 📊 ملخص الدوال المستخدمة

| الدالة | الملف | الوظيفة |
|--------|-------|----------|
| `getContext()` | `aiController.js` | Controller handler |
| `getRAGContext()` | `retrieval.js` | جلب سياق من RAG |
| `expandQuery()` | `textProcessing.js` | توسيع Query |
| `vectorStore.similaritySearch()` | `vectorStore.js` | البحث في Vector Store |

---

# Workflow 5: Section Matching Analysis

## 🎯 الهدف

تحليل ومقارنة قسمين من SRS لمعرفة إذا كانا متطابقين أو متكاملين.

---

## 📍 Endpoint

```
POST /api/ai/analyze-sections
```

**Body:**
```json
{
  "projectId": "...",
  "section1Query": "authentication login",
  "section2Query": "user management",
  "section1Name": "Authentication Section",
  "section2Name": "User Management Section",
  "nContextChunks": 15,
  "model": "gpt-4o"
}
```

---

## 🔄 سير العمل الكامل

```
┌─────────────────────────────────────────────────────────────┐
│  1. Request → Controller                                    │
│     POST /api/ai/analyze-sections                           │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  2. aiController.analyzeSections()                          │
│     - التحقق من المعاملات                                   │
│     - تحضير Options                                         │
│     - استدعاء analyzeSectionMatching()                      │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  3. analyzeSectionMatching()                                │
│     [ragService/analysis.js]                                │
│     - جلب سياق للقسم الأول                                  │
│     - جلب سياق للقسم الثاني                                │
│     - بناء Prompt تحليلي                                    │
│     - استدعاء LLM                                           │
│     - تحليل JSON                                            │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Response                                                │
│     ✅ تحليل شامل مع recommendations                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 التفاصيل خطوة بخطوة

### Step 1: Controller

**الملف:** `backend/controllers/aiController.js`

```javascript
export const analyzeSections = async (req, res) => {
  const { 
    projectId, 
    section1Query, 
    section2Query, 
    section1Name, 
    section2Name, 
    nContextChunks, 
    model 
  } = req.body;
  
  if (!projectId || !section1Query || !section2Query) {
    return res.status(400).json({
      success: false,
      message: "Project ID, section1Query, and section2Query are required",
    });
  }
  
  const options = {
    nContextChunks: nContextChunks || 15,
    model: model || "gpt-4o",
    section1Name: section1Name || "Section 1",
    section2Name: section2Name || "Section 2",
  };
  
  const analysis = await analyzeSectionMatching(
    projectId,
    section1Query,
    section2Query,
    options
  );
  
  res.status(200).json({
    success: true,
    data: analysis,
  });
};
```

---

### Step 2: Section Matching Analysis

**الملف:** `backend/ai/ragService/analysis.js`

#### 2.1 جلب سياق للقسم الأول

```javascript
const section1Chunks = await getRAGContext(
  projectId, 
  section1Query, 
  nContextChunks  // افتراضي: 15
);
```

**ما يحدث:**
- 🔍 بحث في Vector Store عن `section1Query`
- 📊 جلب 15 chunks الأكثر صلة
- ✅ ترتيب حسب الصلة

---

#### 2.2 جلب سياق للقسم الثاني

```javascript
const section2Chunks = await getRAGContext(
  projectId, 
  section2Query, 
  nContextChunks
);
```

**ما يحدث:**
- 🔍 نفس العملية للقسم الثاني

---

#### 2.3 بناء السياق المنظم

```javascript
const section1Context = section1Chunks.map((chunk, idx) => 
  `[${section1Name} - Chunk ${idx + 1}]\n${chunk.text}\n[Metadata: ${JSON.stringify(chunk.metadata)}]`
).join("\n\n");

const section2Context = section2Chunks.map((chunk, idx) => 
  `[${section2Name} - Chunk ${idx + 1}]\n${chunk.text}\n[Metadata: ${JSON.stringify(chunk.metadata)}]`
).join("\n\n");
```

**النتيجة:**
```
[Authentication Section - Chunk 1]
3.2.1 User Login: The system must...
[Metadata: {"source":"SRS","chunkIndex":12}]

[Authentication Section - Chunk 2]
...
---
[User Management Section - Chunk 1]
4.1 User Registration: Users can register...
[Metadata: {...}]
...
```

---

#### 2.4 بناء Prompt تحليلي

```javascript
const prompt = PromptTemplate.fromTemplate(`You are an expert requirements analyst...

**CRITICAL INSTRUCTIONS:**
1. Extract Section References
2. Map Relationships
3. Functional Matching
4. Section Linking
5. Gap Analysis
6. Be Precise

**Analysis Structure:**
- Element Name
- Section 1 Value
- Section 2 Value
- Match Type: "exact_match", "complementary", "partial_match", "mismatch", "missing"
- Match Score: 0-100
- Section References
- Reasoning

**Output Format:**
{
  "directAnswer": "Yes/No",
  "overallMatchScore": 0-100,
  "functionalMatch": {...},
  "strengths": [...],
  "improvements": [...],
  "finalEvaluation": {...},
  "conclusion": {...},
  "integrationPlan": {...}
}

**${section1Name} Context:**
{section1Context}

**${section2Name} Context:**
{section2Context}

Analyze the matching...`);
```

---

#### 2.5 استدعاء LLM

```javascript
const llm = new ChatOpenAI({
  model: "gpt-4o",  // نموذج أقوى للتحليل
  temperature: 0.3,  // أقل للدقة
  apiKey: process.env.OPENAI_API_KEY,
});

const formattedPrompt = await prompt.format({
  section1Name,
  section2Name,
  section1Context,
  section2Context,
});

const result = await llm.invoke(formattedPrompt);
const content = result.content;
const parsed = parseJSONSafely(content);
```

**ما يحدث:**
- 📤 إرسال Prompt تحليلي
- ⏳ انتظار الاستجابة (20-40 ثانية)
- 📥 استلام JSON تحليلي شامل

---

#### 2.6 إضافة Metadata

```javascript
return {
  ...parsed,
  metadata: {
    section1Query,
    section2Query,
    section1ChunksCount: section1Chunks.length,
    section2ChunksCount: section2Chunks.length,
    model,
    timestamp: new Date().toISOString(),
  },
};
```

**النتيجة:**
```javascript
{
  directAnswer: "Yes - Sections are complementary",
  overallMatchScore: 85,
  functionalMatch: {
    score: 90,
    analysis: "Both sections work together...",
    matchedElements: [
      {
        element: "User Authentication",
        section1Value: "3.2.1: Login functionality",
        section2Value: "4.1: User registration requires authentication",
        matchType: "complementary",
        matchScore: 95,
        sectionReferences: ["3.2.1", "4.1"],
        reasoning: "Authentication is required for user management..."
      },
      ...
    ]
  },
  strengths: [
    {
      title: "Clear Integration Points",
      description: "...",
      sectionReferences: ["3.2.1", "4.1"],
      impact: "high"
    },
    ...
  ],
  improvements: [
    {
      title: "Missing Error Handling",
      issue: "No error handling specified",
      currentState: "...",
      recommendedSolution: "...",
      sectionReferences: ["3.2.1"],
      priority: "medium"
    },
    ...
  ],
  finalEvaluation: {
    matchPercentage: 85,
    criteria: [...]
  },
  conclusion: {
    summary: "...",
    recommendation: "Sections should be integrated with minor improvements",
    status: "match_with_improvements"
  },
  integrationPlan: {
    description: "...",
    flow: ["Step 1", "Step 2"],
    sectionReferences: ["3.2.1", "4.1"]
  },
  metadata: {
    section1Query: "authentication login",
    section2Query: "user management",
    section1ChunksCount: 15,
    section2ChunksCount: 15,
    model: "gpt-4o",
    timestamp: "2024-..."
  }
}
```

---

## 📊 ملخص الدوال المستخدمة

| الدالة | الملف | الوظيفة |
|--------|-------|----------|
| `analyzeSections()` | `aiController.js` | Controller handler |
| `analyzeSectionMatching()` | `analysis.js` | تحليل Section Matching |
| `getRAGContext()` | `retrieval.js` | جلب سياق من RAG |
| `parseJSONSafely()` | `utils.js` | تحليل JSON |

---

## 📋 ملخص شامل لجميع Workflows

### Workflow 1: Generate Features
- **المدخل:** Project ID, Options
- **المعالجة:** RAG → LLM → JSON Parsing → Enhancement
- **المخرج:** Features محفوظة في MongoDB

### Workflow 2: Generate Test Cases
- **المدخل:** Feature ID, Options
- **المعالجة:** RAG (من matchedSections) → LLM → JSON Parsing
- **المخرج:** Test Cases محفوظة في MongoDB

### Workflow 3: Chatbot Query
- **المدخل:** Project ID, Question
- **المعالجة:** Retrieval Chain (RAG + LLM)
- **المخرج:** إجابة نصية من AI

### Workflow 4: Get Context
- **المدخل:** Project ID, Query
- **المعالجة:** Vector Search فقط (بدون LLM)
- **المخرج:** Chunks مرتبة حسب الصلة

### Workflow 5: Section Matching
- **المدخل:** Project ID, Section Queries (2)
- **المعالجة:** RAG (2 queries) → LLM Analysis
- **المخرج:** تحليل شامل مع recommendations

---

**تم الإنشاء:** 2024  
**الإصدار:** 1.0  
**اللغة:** العربية

