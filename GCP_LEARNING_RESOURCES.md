# Google Cloud Platform - الخدمات المستخدمة في المشروع

## 🎯 الخدمات المستخدمة

### 1. **Document AI** ✅ (مستخدم فعلياً)
**الوظيفة:** تحليل ملفات PDF واستخراج النص والجداول

**كيف استخدمته:**
- عند رفع ملف PDF، يتم إرساله إلى Document AI
- Document AI يحلل الملف ويستخرج:
  - النص الكامل
  - الجداول (Tables)
  - النماذج (Forms)
- النص المستخرج يُستخدم لإنشاء embeddings وحفظها في Vector Store

**الملفات المستخدمة:**
- `backend/services/documentAIService.js` - Service لتحليل PDFs
- `backend/services/projectService.js` - يستخدم Document AI عند رفع SRS

**الإعدادات:**
- Processor ID: `e4f2ff4af5e7cca5`
- Location: `us`
- Project: `upbeat-voice-480223-v5`

---

### 2. **Cloud Storage** ⚠️ (مثبت لكن غير مستخدم حالياً)
**الوظيفة:** تخزين ملفات SRS في السحابة

**الوضع الحالي:**
- المكتبة مثبتة: `@google-cloud/storage`
- Bucket جاهز: `vision-qa-srs-documents`
- لكن الملفات حالياً تُحفظ في `./uploads/` (local filesystem)

**يمكن استخدامه لاحقاً:**
- رفع ملفات SRS إلى Cloud Storage بدلاً من local filesystem
- حل مشاكل deployment (Cloud Run لا يدعم local storage)

---

### 3. **Service Accounts** ✅ (مستخدم للتوثيق)
**الوظيفة:** التوثيق الآمن مع Google Cloud APIs

**كيف استخدمته:**
- Service Account: `vision-qa-service@upbeat-voice-480223-v5.iam.gserviceaccount.com`
- Key File: `backend/gcp-key.json`
- الصلاحيات:
  - `roles/documentai.apiUser` - للوصول إلى Document AI
  - `roles/storage.admin` - للوصول إلى Cloud Storage (جاهز)

**الاستخدام:**
- عند استخدام Document AI، يتم التوثيق تلقائياً باستخدام Service Account Key

---

## 📝 ملخص سريع

| الخدمة | الحالة | الاستخدام |
|--------|--------|-----------|
| **Document AI** | ✅ مستخدم | تحليل PDFs عند رفع SRS |
| **Cloud Storage** | ⚠️ جاهز | غير مستخدم (الملفات في local) |
| **Service Accounts** | ✅ مستخدم | التوثيق مع Google Cloud |

---

## 🔍 فيديوهات مفيدة

### Document AI:
- ابحث في YouTube: **"Google Cloud Document AI Node.js tutorial"**
- ابحث في YouTube: **"Document AI extract text from PDF"**

### Service Accounts:
- ابحث في YouTube: **"Google Cloud Service Account setup"**

---

## 📚 وثائق رسمية

- **Document AI:** https://cloud.google.com/document-ai/docs
- **Cloud Storage:** https://cloud.google.com/storage/docs

---

