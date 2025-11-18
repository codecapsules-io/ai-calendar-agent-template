import { DynamicStructuredTool, DynamicTool } from "langchain";

export abstract class BaseTool {
  abstract tool: DynamicStructuredTool | DynamicTool;
}
