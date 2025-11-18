import { RedisVectorStore } from "@langchain/redis";
import { Document } from "@langchain/core/documents";
import { VectorStore } from "@langchain/core/vectorstores";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

import { RedisClient } from "../../redis";
import { DocumentSplitterUtil } from "../utilities";
import { EmbeddingsService } from "../../embeddings";

export class RagService {
  private static instance: RagService;

  static init() {
    if (this.instance) {
      return;
    }
    this.instance = new RagService();
  }

  static getInstance(): RagService {
    if (!this.instance) {
      throw new Error("VectorStoreService not initialized");
    }
    return this.instance;
  }

  private readonly embeddings: EmbeddingsService;
  private readonly redisClient: RedisClient;

  private store: VectorStore | null = null;

  private constructor() {
    this.embeddings = EmbeddingsService.getInstance();
    this.redisClient = RedisClient.getInstance();

    this.initVectorStore();
  }

  private initVectorStore() {
    if (!this.store) {
      try {
        if (this.redisClient.connected) {
          this.store = this.createRedisBasedStore();
        } else {
          this.store = this.createMemoryBasedStore();
        }
      } catch (error) {
        console.error("Could not initialize vector store.", error);
      }
    }
  }

  private createRedisBasedStore() {
    if (!this.embeddings.model) {
      throw new Error("Embeddings model not initialized");
    }

    return new RedisVectorStore(this.embeddings.model, {
      redisClient: this.redisClient.nodeClient as any,
      indexName: "vector_store",
    });
  }

  private createMemoryBasedStore() {
    if (!this.embeddings.model) {
      throw new Error("Embeddings model not initialized");
    }

    return new MemoryVectorStore(this.embeddings.model);
  }

  public getVectorStore() {
    if (!this.store) {
      throw new Error("Vector store not initialized");
    }
    return this.store;
  }

  public async addToStoreFromText(text: string) {
    if (!this.store) {
      throw new Error("Vector store not initialized");
    }

    const doc = new Document({
      pageContent: text,
      metadata: {
        source: "context",
      },
    });

    return this.splitAndAddDocuments([doc]);
  }

  public async addToStoreFromUrl(url: string) {
    if (!this.store) throw new Error("Vector store not initialized");

    const loader = new CheerioWebBaseLoader(url);

    const docs = await loader.load();

    return this.splitAndAddDocuments(docs);
  }

  private async splitAndAddDocuments(docs: Document[]) {
    if (!this.store) throw new Error("Vector store not initialized");

    const splitDocuments = await DocumentSplitterUtil.splitDocuments(docs);
    return this.store.addDocuments(splitDocuments);
  }
}
