import { BaseTool } from "./base.tool";
import { RetrieveTool } from "./implementations";

export class ToolsManager {
  private tools: BaseTool[] = [];

  constructor() {
    this.tools.push(new RetrieveTool());
  }

  getTools() {
    return this.tools.map((tool) => tool.tool);
  }
}
