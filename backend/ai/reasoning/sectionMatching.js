import { createChatModel } from "../config/llmClient.js";
import { PromptTemplate } from "@langchain/core/prompts";
import { getRAGContext } from "../retrieval/retrievalCore.js";
import { parseJSONSafely } from "./jsonUtils.js";
import { SECTION_MATCHING_PROMPT_TEMPLATE } from "./prompts/index.js";

export async function analyzeSectionMatching(
  projectId,
  section1Query,
  section2Query,
  options = {}
) {
  try {
    const safeOptions =
      options && typeof options === "object" ? options : {};
    const {
      nContextChunks = 15,
      model = "gpt-4o",
      section1Name = "Section 1",
      section2Name = "Section 2",
    } = safeOptions;

    const section1Chunks = await getRAGContext(
      projectId,
      section1Query,
      nContextChunks
    );
    const section2Chunks = await getRAGContext(
      projectId,
      section2Query,
      nContextChunks
    );

    if (section1Chunks.length === 0 || section2Chunks.length === 0) {
      throw new Error(
        "Insufficient context found for one or both sections. Please ensure the document contains relevant content."
      );
    }

    const section1Context = section1Chunks
      .map(
        (chunk, idx) =>
          `[${section1Name} - Chunk ${idx + 1}]\n${chunk.text}\n[Metadata: ${JSON.stringify(
            chunk.metadata
          )}]`
      )
      .join("\n\n");

    const section2Context = section2Chunks
      .map(
        (chunk, idx) =>
          `[${section2Name} - Chunk ${idx + 1}]\n${chunk.text}\n[Metadata: ${JSON.stringify(
            chunk.metadata
          )}]`
      )
      .join("\n\n");

    const llm = createChatModel({
      model,
      temperature: 0.3,
    });

    const prompt = PromptTemplate.fromTemplate(
      SECTION_MATCHING_PROMPT_TEMPLATE
    );

    const formattedPrompt = await prompt.format({
      section1Name,
      section2Name,
      section1Context,
      section2Context,
    });

    console.log(
      `Analyzing section matching: ${section1Name} vs ${section2Name}`
    );
    const result = await llm.invoke(formattedPrompt);

    const content = result.content;
    const parsed = parseJSONSafely(content);

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
  } catch (error) {
    console.error("Error analyzing section matching:", error);
    throw error;
  }
}