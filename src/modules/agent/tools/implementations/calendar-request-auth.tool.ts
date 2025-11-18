import { tool } from "langchain";
import z from "zod";

import { BaseTool } from "../base.tool";
import { CalendarService } from "../../../calendar/services";

export class CalendarRequestAuthTool extends BaseTool {
  private readonly calendarService: CalendarService;

  constructor() {
    super();

    this.calendarService = CalendarService.getInstance();
  }

  public tool = tool(
    async (input, config) => {
      const authUrl = await this.calendarService.getAuthUrl(
        config.configurable.userId
      );
      return (
        "Tell the user to visit the following URL to authorize access to the calendar: " +
        authUrl
      );
    },
    {
      name: "requestCalendarAuth",
      description:
        "Use this tool to request authorization to access the user's Google Calendar. You MUST use this tool whenever asked to authorize access to the calendar.",
    }
  );
}
