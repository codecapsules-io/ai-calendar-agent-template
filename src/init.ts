import {
  RagService,
  RedisClient,
  ChatService,
  MemoryService,
  EmbeddingsService,
  ChatHistoryService,
} from "./modules";

export async function init() {
  await RedisClient.init();
  EmbeddingsService.init();
  RagService.init();
  MemoryService.init();
  ChatHistoryService.init();
  await ChatService.init();
}
