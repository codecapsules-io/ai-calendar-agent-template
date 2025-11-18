import { Embeddings as LangchainEmbeddings } from "@langchain/core/embeddings";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";

export class EmbeddingsService {
  private static instance: EmbeddingsService;

  static init() {
    if (this.instance) {
      return;
    }
    this.instance = new EmbeddingsService();
  }

  static getInstance(): EmbeddingsService {
    if (!this.instance) {
      throw new Error("Embeddings model not initialized");
    }
    return this.instance;
  }

  public readonly dimensions = 384;
  public readonly model: LangchainEmbeddings | null = null;

  private constructor() {
    this.model = new HuggingFaceTransformersEmbeddings({
      model: "Xenova/all-MiniLM-L6-v2",
    });
  }
}
