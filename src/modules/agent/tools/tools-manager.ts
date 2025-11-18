import { BaseTool } from "./base.tool";
import {
  RetrieveTool,
  CalendarAddEventTool,
  CalendarGetEventsTool,
  CalendarRequestAuthTool,
  GetDateTool,
} from "./implementations";

export class ToolsManager {
  private tools: BaseTool[] = [];

  constructor() {
    this.tools.push(new RetrieveTool());
    this.tools.push(new CalendarAddEventTool());
    this.tools.push(new CalendarGetEventsTool());
    this.tools.push(new CalendarRequestAuthTool());
    this.tools.push(new GetDateTool());
  }

  getTools() {
    return this.tools.map((tool) => tool.tool);
  }
}
