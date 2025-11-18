import { initChatModel } from "langchain";

import { config } from "../../../config";
import { ChatUtility } from "../utilities";
import { Agent, AgentMessage } from "../../agent";
import { ChatHistoryService } from "./chat-history.service";
import { ChatPromptDto, ChatResponseChunkDto } from "../dto";

export class ChatService {
  private static instance: ChatService;

  static async init() {
    if (this.instance) return;

    const agent = await this.createAgent();

    this.instance = new ChatService(agent);
  }

  private static async createAgent() {
    const model = await initChatModel(config.providerModel, {
      modelProvider: config.providerName,
      apiKey: config.providerApiKey,
    });

    const modelConfig = {
      provider: config.providerName,
      name: config.providerModel,
      model,
    };

    return new Agent(modelConfig);
  }

  static getInstance(): ChatService {
    if (!this.instance) {
      throw new Error("ChatService not initialized");
    }
    return this.instance;
  }

  private agent: Agent;
  private chatHistoryService: ChatHistoryService;

  constructor(agent: Agent) {
    this.agent = agent;
    this.chatHistoryService = ChatHistoryService.getInstance();
  }

  async sendMessage(
    message: ChatPromptDto,
    userId?: string
  ): Promise<AgentMessage> {
    const context = await this.getPromptContext(message, userId);

    const result = await this.agent.prompt(context.messagesToSend, userId);

    if (userId) {
      this.chatHistoryService.addMessage(userId, context.newMessage);
      this.chatHistoryService.addMessage(userId, result);
    }

    return result;
  }

  async streamMessage(
    message: ChatPromptDto,
    userId: string | undefined,
    callback: (message: ChatResponseChunkDto[]) => void
  ): Promise<AgentMessage> {
    const context = await this.getPromptContext(message, userId);

    const result = await this.agent.streamPrompt(
      context.messagesToSend,
      userId,
      (chunks) => {
        callback(
          chunks.map((msg) => ({
            chunk: msg.chunk,
          }))
        );
      }
    );

    if (userId) {
      this.chatHistoryService.addMessage(userId, context.newMessage);
      this.chatHistoryService.addMessage(userId, result);
    }

    return result;
  }

  private async getPromptContext(
    chatPrompt: ChatPromptDto,
    userId?: string
  ): Promise<{ messagesToSend: AgentMessage[]; newMessage: AgentMessage }> {
    const newMessage = ChatUtility.convertToAgentMessage(chatPrompt);

    let history: AgentMessage[] = [];

    if (userId) {
      history = await this.chatHistoryService.getHistory(userId);
    }

    return {
      messagesToSend: [...history, newMessage],
      newMessage,
    };
  }
}
