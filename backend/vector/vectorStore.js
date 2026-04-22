import { createClient } from "@supabase/supabase-js";
import { getEmbeddings } from "../ai/ingestion/embeddings.js";
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

    // Add projectId to metadata for filtering
    documents.forEach(doc => {
      if (!doc.metadata) doc.metadata = {};
      doc.metadata.projectId = projectId;
    });

    console.log("Adding documents for projectId:", projectId);
    console.log("Sample metadata from first doc:", documents[0]?.metadata);

    try {
      // Convert documents to vector format: content + embedding + metadata
      const vectors = documents.map((doc, index) => ({
        content: doc.pageContent,
        embedding: embeddings ? embeddings[index] : undefined,
        metadata: doc.metadata,
        project_id: projectId,
      }));

      // Insert into Supabase (uses pgvector for similarity search)
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
      // Dynamically import SupabaseVectorStore class from LangChain community package
      // This provides integration between LangChain and Supabase's pgvector extension
      const store = await import("@langchain/community/vectorstores/supabase").then(m => m.SupabaseVectorStore);
      
      // Create vector store instance using existing Supabase index
      // fromExistingIndex: Connects to pre-existing vector index without recreating it
      // - getEmbeddings(): OpenAI embeddings model to convert text queries to vectors
      // - client: Supabase database client connection
      // - tableName: Database table storing document vectors and metadata
      // - queryName: PostgreSQL function name for similarity matching (uses pgvector)
      const vectorStore = await store.fromExistingIndex(getEmbeddings(), {
        client: this.client,
        tableName: "project_vectors",
        queryName: "match_project_vectors",
      });
      // Filter search results by projectId and perform similarity search
      const filter = { projectId };
      
      // Perform vector similarity search using embeddings
      // - query: Text query (automatically converted to embedding vector)
      // - k: Maximum number of similar documents to return
      // - filter: Metadata filter to limit search to specific project
      // Returns: Array of [Document, score] tuples where lower score = higher similarity
      const results = await vectorStore.similaritySearchWithScore(query, k, filter);

      // Double-check results belong to the correct project (defensive filter)
      const filtered = results.filter(([doc]) => doc.metadata?.projectId === projectId);

      // Return results with content, metadata, and similarity score
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

    // Delete ALL vector documents for this project (SRS chunks, features, test cases, etc.)
    const { data, error } = await this.client
      .from("project_vectors")
      .delete()
      .eq("project_id", projectId)
      .select();

    if (error) {
      console.error(`Error deleting vectors for project ${projectId}:`, error);
      throw error;
    }
    
    const deletedCount = data?.length || 0;
    console.log(`Deleted ${deletedCount} vector document(s) for project ${projectId} from Supabase`);
    
    return { deleted: deletedCount };
  }

  async deleteDocumentsByMetadata(projectId, metadataFilter) {
    await this.ensureInitialized();

    try {
      // Use JSONB queries for better performance
      let query = this.client
        .from("project_vectors")
        .select("id")
        .eq("project_id", projectId);

      // Apply metadata filters using JSONB operators
      Object.keys(metadataFilter).forEach(key => {
        query = query.eq(`metadata->>${key}`, metadataFilter[key]);
      });

      const { data: matchingDocs, error: selectError } = await query;

      if (selectError) throw selectError;

      if (!matchingDocs || matchingDocs.length === 0) {
        console.log(`No documents found matching metadata filter:`, metadataFilter);
        return { deleted: 0 };
      }

      // Delete matching documents
      const { error: deleteError } = await this.client
        .from("project_vectors")
        .delete()
        .in("id", matchingDocs.map(d => d.id));

      if (deleteError) throw deleteError;

      console.log(`Deleted ${matchingDocs.length} document(s) for project ${projectId} with metadata:`, metadataFilter);
      return { deleted: matchingDocs.length };
    } catch (error) {
      console.error("Error deleting documents by metadata:", error);
      throw error;
    }
  }

  async updateDocumentByMetadata(projectId, metadataFilter, newContent, newEmbedding = null) {
    await this.ensureInitialized();

    try {
      // Use JSONB queries for better performance
      let query = this.client
        .from("project_vectors")
        .select("id")
        .eq("project_id", projectId);

      // Apply metadata filters using JSONB operators
      Object.keys(metadataFilter).forEach(key => {
        query = query.eq(`metadata->>${key}`, metadataFilter[key]);
      });

      const { data: matchingDocs, error: selectError } = await query;

      if (selectError) throw selectError;

      if (!matchingDocs || matchingDocs.length === 0) {
        console.log(`No documents found matching metadata filter:`, metadataFilter);
        return { updated: 0 };
      }

      // Generate embedding if not provided
      let embedding = newEmbedding;
      if (!embedding && newContent) {
        const { generateEmbedding } = await import("../ai/ingestion/embeddings.js");
        embedding = await generateEmbedding(newContent);
      }

      // Update each matching document
      let updatedCount = 0;
      for (const doc of matchingDocs) {
        const updateData = {
          content: newContent,
          ...(embedding && { embedding }),
        };

        const { error: updateError } = await this.client
          .from("project_vectors")
          .update(updateData)
          .eq("id", doc.id);

        if (updateError) {
          console.error(`Error updating document ${doc.id}:`, updateError);
        } else {
          updatedCount++;
        }
      }

      console.log(`Updated ${updatedCount} document(s) for project ${projectId} with metadata:`, metadataFilter);
      return { updated: updatedCount };
    } catch (error) {
      console.error("Error updating document by metadata:", error);
      throw error;
    }
  }

  async upsertDocument(projectId, document, embedding = null, metadataFilter = null) {
    await this.ensureInitialized();

    try {
      let deletedCount = 0;
      
      // If metadataFilter is provided, delete old documents first to ensure no duplicates
      // This ensures that old versions are completely removed before inserting the new version
      if (metadataFilter) {
        // Delete all old documents matching the filter (to remove any old versions)
        const { deleted } = await this.deleteDocumentsByMetadata(projectId, metadataFilter);
        deletedCount = deleted || 0;
        
        if (deletedCount > 0) {
          console.log(`Deleted ${deletedCount} old document version(s) before inserting updated version`);
        } else {
          console.log(`No existing documents found to delete (creating new document)`);
        }
      }

      // Add new document with updated content
      if (!document.metadata) document.metadata = {};
      document.metadata.projectId = projectId;

      // Generate embedding if not provided
      let finalEmbedding = embedding;
      if (!finalEmbedding && document.pageContent) {
        const { generateEmbedding } = await import("../ai/ingestion/embeddings.js");
        finalEmbedding = await generateEmbedding(document.pageContent);
      }

      const vector = {
        content: document.pageContent,
        embedding: finalEmbedding,
        metadata: document.metadata,
        project_id: projectId,
      };

      const { error } = await this.client
        .from("project_vectors")
        .insert(vector);

      if (error) throw error;

      const action = deletedCount > 0 ? "replaced" : "inserted";
      console.log(`${action === "replaced" ? "Replaced" : "Added"} document for project ${projectId} (metadata: ${JSON.stringify(metadataFilter)})`);
      return { action, count: 1, deletedCount };
    } catch (error) {
      console.error("Error upserting document:", error);
      throw error;
    }
  }
}

export const vectorStore = new VectorStore();