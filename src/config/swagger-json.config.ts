import * as fs from "fs";
import * as path from "path";
import { config } from "./config";

export function getSwaggerJsonSpec() {
  const swaggerJsonPath = path.join(__dirname, "../docs/swagger.json");
  const swaggerJson = JSON.parse(fs.readFileSync(swaggerJsonPath, "utf-8"));

  swaggerJson.servers = [
    {
      url: (config.devMode ? "http" : "https") + `://${config.appUrl}`,
      description: config.devMode ? "Local development server" : "Production server",
    },
  ];

  return swaggerJson;
}
