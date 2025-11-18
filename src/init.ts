import {
  RagService,
  RedisClient,
  ChatService,
  MemoryService,
  EmbeddingsService,
  CalendarService,
  ChatHistoryService,
} from "./modules";

export async function init() {
  await RedisClient.init();
  EmbeddingsService.init();
  RagService.init();
  MemoryService.init();
  ChatHistoryService.init();
  CalendarService.init();
  await ChatService.init();
}
