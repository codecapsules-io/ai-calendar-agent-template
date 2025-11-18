import { Response } from "express";
import { ChatResponseChunkDto } from "../dto";

export class ChatStream {
  constructor(private readonly response: Response) {
    // prepare the response for streaming
    this.response.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    this.response.flushHeaders();
  }

  sendChunks(chunks: ChatResponseChunkDto[]) {
    for (const chunk of chunks) {
      this.response.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
  }

  end() {
    this.response.end();
  }
}
