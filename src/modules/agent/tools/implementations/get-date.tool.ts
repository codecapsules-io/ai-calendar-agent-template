import { tool } from "langchain";

import { BaseTool } from "../base.tool";

export class GetDateTool implements BaseTool {
  public tool = tool(
    () => {
      return `Today's date is ${new Date().toISOString()}.`;
    },
    {
      name: "getDate",
      description: "Get today's date",
    }
  );
}
