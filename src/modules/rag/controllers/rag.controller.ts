import { Router } from "express";

import {
  AppError,
  handleRequest,
  RequestPayload,
  StatusCode,
} from "../../../middleware";
import { ContextTextDto, ContextUrlDto } from "../dto";
import { Controller } from "../../../core";
import { RagService } from "../services";

export class RagController extends Controller {
  private readonly ragService: RagService;

  constructor() {
    super();

    this.ragService = RagService.getInstance();
  }

  public get routes(): Router {
    const router = Router();

    router.post(
      "/text",
      handleRequest<ContextTextDto>((payload) => this.addContext(payload))
    );

    router.post(
      "/url",
      handleRequest<ContextUrlDto>((payload) => this.addContextFromUrl(payload))
    );

    return router;
  }

  private async addContext(payload: RequestPayload<ContextTextDto>) {
    const contextRequest = payload.request.body;
    if (!contextRequest.text) {
      throw new AppError("Context is required", StatusCode.BAD_REQUEST);
    }

    return this.ragService.addToStoreFromText(contextRequest.text);
  }

  private async addContextFromUrl(payload: RequestPayload<ContextUrlDto>) {
    const contextRequest = payload.request.body;
    if (!contextRequest.url) {
      throw new AppError("URL is required", StatusCode.BAD_REQUEST);
    }

    return this.ragService.addToStoreFromUrl(contextRequest.url);
  }
}
