import { Router } from "express";
import { RagController } from "../modules/rag/controllers";
import { ChatController } from "../modules/chat/controller";
import { CalendarController } from "../modules/calendar/controllers";

export function createApiRouter() {
  const router = Router();

  const chatController = new ChatController();
  router.use("/chat", chatController.routes);

  const ragController = new RagController();
  router.use("/context", ragController.routes);
  
  const calendarController = new CalendarController();
  router.use("/calendar", calendarController.routes);
  
  return router;
}
