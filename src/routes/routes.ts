import { Router } from "express";
import { RagController } from "../modules/rag/controllers";
import { ChatController } from "../modules/chat/controller";

export function createApiRouter() {
  const router = Router();

  const chatController = new ChatController();
  router.use("/chat", chatController.routes);

  const ragController = new RagController();
  router.use("/context", ragController.routes);

  return router;
}
