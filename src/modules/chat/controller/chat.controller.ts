import { Router } from "express";

import {
  AppError,
  handleRequest,
  RequestPayload,
  StatusCode,
} from "../../../middleware";
import { ChatHistoryService, ChatService } from "../services";
import { Controller } from "../../../core";
import { ChatPromptDto } from "../dto";
import { ChatStream } from "../utilities";

export class ChatController extends Controller {
  private readonly chatService: ChatService;
  private readonly chatHistoryService: ChatHistoryService;

  constructor() {
    super();

    this.chatService = ChatService.getInstance();
    this.chatHistoryService = ChatHistoryService.getInstance();
  }

  public get routes(): Router {
    const router = Router();

    router.post(
      "/message",
      handleRequest<ChatPromptDto>((payload) => this.sendMessage(payload))
    );
    router.post(
      "/message/stream",
      handleRequest<ChatPromptDto>((payload) => this.streamMessage(payload))
    );
    router.get(
      "/history",
      handleRequest((payload) => this.getChatHistory(payload))
    );

    return router;
  }

  private async sendMessage(payload: RequestPayload<ChatPromptDto>) {
    const chatRequest: ChatPromptDto = payload.request.body;
    if (!chatRequest.content) {
      throw new AppError("Message is required", StatusCode.BAD_REQUEST);
    }
    return this.chatService.sendMessage(chatRequest, payload.user?.id);
  }

  private async streamMessage(payload: RequestPayload<ChatPromptDto>) {
    const chatRequest = payload.request.body;
    if (!chatRequest) {
      throw new AppError("Message is required", StatusCode.BAD_REQUEST);
    }

    const stream = new ChatStream(payload.response);

    const result = await this.chatService.streamMessage(
      chatRequest,
      payload.user?.id,
      (chunks) => stream.sendChunks(chunks)
    );

    stream.end();

    return result;
  }

  private async getChatHistory(payload: RequestPayload) {
    if (!payload.user) {
      throw new AppError("User not provided", StatusCode.UNAUTHORIZED);
    }
    return this.chatHistoryService.getHistory(payload.user.id);
  }
}
