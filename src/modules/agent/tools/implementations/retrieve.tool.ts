import * as z from "zod";
import { tool } from "@langchain/core/tools";

import { BaseTool } from "../base.tool";
import { RagService } from "../../../rag";

export class RetrieveTool extends BaseTool {
  private readonly ragService: RagService;

  constructor() {
    super();

    this.ragService = RagService.getInstance();
  }

  private schema = z.object({ query: z.string() });

  public tool = tool(
    async ({ query }) => {
      const store = this.ragService.getVectorStore();

      if (!store) throw new Error("Vector store not found");

      const retrievedDocs = await store.similaritySearch(query, 2);
      const serialized = retrievedDocs
        .map(
          (doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`
        )
        .join("\n");

      return [serialized, retrievedDocs];
    },
    {
      name: "retrieve",
      description: "Retrieve information related to a query.",
      schema: this.schema,
      responseFormat: "content_and_artifact",
    }
  );
}
