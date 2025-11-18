import { Router } from "express";
import { RequestPayload } from "../../middleware";

export abstract class Controller {
  abstract get routes(): Router;

  protected setupStreaming(payload: RequestPayload) {
    payload.response.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    payload.response.flushHeaders();
  }

  protected sendStreamChunk<T>(payload: RequestPayload, message: T) {
    payload.response.write(`data: ${JSON.stringify(message)}\n\n`);
  }

  protected finalizeStreaming(payload: RequestPayload) {
    payload.response.end();
  }
}
