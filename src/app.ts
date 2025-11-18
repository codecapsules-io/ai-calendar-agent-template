import cors from "cors";
import express from "express";
import { createServer } from "http";
import swaggerUi from "swagger-ui-express";

import { init } from "./init";
import { createApiRouter } from "./routes";
import { config, getSwaggerJsonSpec } from "./config";
import { authenticateUser } from "./middleware";

export async function createApp() {
  await init();

  const app = express();

  app.use(
    cors({
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-CC-API-KEY",
        "X-CC-EMAIL",
      ],
    })
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  if (config.showDocumentation) {
    const swaggerSpec = getSwaggerJsonSpec();
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get("/swagger.json", (req, res) => {
      res.send(swaggerSpec);
    });
  }

  app.use("/api", authenticateUser, createApiRouter());

  const server = createServer(app);
  server.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
}
