import { createClient } from "@supabase/supabase-js";
import { getEmbeddings } from "../ai/embeddings.js";
import { Document } from "@langchain/core/documents";

class VectorStore {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase URL and Service Role Key are required in .env");
    }

    this.client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    this.initialized = true;
    console.log("VectorStore initialized");
  }

  async ensureInitialized() {
    if (!this.initialized) await this.initialize();
  }

  async addDocuments(projectId, documents, embeddings = null) {
    await this.ensureInitialized();

    if (!projectId) throw new Error("projectId is required");
    if (!documents || !documents.length) throw new Error("No documents to add");

    documents.forEach(doc => {
      if (!doc.metadata) doc.metadata = {};
      doc.metadata.projectId = projectId;
    });

    console.log("Adding documents for projectId:", projectId);
    console.log("Sample metadata from first doc:", documents[0]?.metadata);

    try {
      const vectors = documents.map((doc, index) => ({
        content: doc.pageContent,
        embedding: embeddings ? embeddings[index] : undefined,
        metadata: doc.metadata,
        project_id: projectId,
      }));

      const { error } = await this.client
        .from("project_vectors")
        .insert(vectors);

      if (error) throw error;

      console.log(`Successfully added ${documents.length} documents for project ${projectId}`);
    } catch (error) {
      console.error("Error adding documents:", error);
      throw error;
    }
  }

  async similaritySearch(projectId, query, k = 5) {
    await this.ensureInitialized();

    try {
      const store = await import("@langchain/community/vectorstores/supabase").then(m => m.SupabaseVectorStore);
      const vectorStore = await store.fromExistingIndex(getEmbeddings(), {
        client: this.client,
        tableName: "project_vectors",
        queryName: "match_project_vectors",
      });

      const filter = { projectId };
      const results = await vectorStore.similaritySearchWithScore(query, k, filter);

      const filtered = results.filter(([doc]) => doc.metadata?.projectId === projectId);

      return filtered.map(([doc, score]) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        score,
      }));
    } catch (error) {
      console.error("Error searching documents:", error);
      throw error;
    }
  }

  async getRetriever(projectId, k = 5) {
    await this.ensureInitialized();

    const store = await import("@langchain/community/vectorstores/supabase").then(m => m.SupabaseVectorStore);
    const vectorStore = await store.fromExistingIndex(getEmbeddings(), {
      client: this.client,
      tableName: "project_vectors",
      queryName: "match_project_vectors",
    });

    const filter = { projectId };
    const baseRetriever = vectorStore.asRetriever({
      k,
      filter,
    });

    return {
      async getRelevantDocuments(query) {
        const docs = await baseRetriever.getRelevantDocuments(query);

        return docs.filter(doc => doc.metadata?.projectId === projectId);
      },
      getRetrieverName() {
        return "supabase_filtered";
      },
    };
  }

  async getProjectInfo(projectId) {
    await this.ensureInitialized();

    const { count, error } = await this.client
      .from("project_vectors")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);
    if (error) throw error;

    return { projectId, chunksCount: count || 0 };
  }

  async deleteProject(projectId) {
    await this.ensureInitialized();

    const { error } = await this.client
      .from("project_vectors")
      .delete()
      .eq("project_id", projectId);

    if (error) throw error;
    console.log(`Deleted vectors for project ${projectId}`);
  }
}

export const vectorStore = new VectorStore();