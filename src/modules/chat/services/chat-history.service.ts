import { AgentMessage } from "../../agent";
import { MemoryService } from "../../memory";

export class ChatHistoryService {
  private static instance: ChatHistoryService;

  static init() {
    if (this.instance) {
      return;
    }

    this.instance = new ChatHistoryService();
  }

  static getInstance(): ChatHistoryService {
    if (!this.instance) {
      throw new Error("ChatHistoryService not initialized");
    }
    return this.instance;
  }

  private readonly memoryService: MemoryService;

  private constructor() {
    this.memoryService = MemoryService.getInstance();
  }

  addMessage(chatId: string, message: AgentMessage) {
    return this.memoryService.addMessages(chatId, [message]);
  }

  addMessages(chatId: string, messages: AgentMessage[]) {
    return this.memoryService.addMessages(chatId, messages);
  }

  getHistory(chatId: string): Promise<AgentMessage[]> {
    return this.memoryService.getMessages(chatId);
  }

  clearHistory(chatId: string) {
    return this.memoryService.clearMessages(chatId);
  }
}
