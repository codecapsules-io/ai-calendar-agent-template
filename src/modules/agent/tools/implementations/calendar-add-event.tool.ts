import { tool } from "langchain";
import z from "zod";

import { BaseTool } from "../base.tool";
import { CalendarService } from "../../../calendar/services";

export class CalendarAddEventTool extends BaseTool {
  private readonly calendarService: CalendarService;

  constructor() {
    super();

    this.calendarService = CalendarService.getInstance();
  }

  public tool = tool(
    async (input, config) => {
      const event = await this.calendarService.createEvent(
        config.configurable.userId,
        input.summary,
        input.description,
        new Date(input.start),
        new Date(input.end)
      );
      return "Event created successfully: " + event.summary;
    },
    {
      name: "addCalendarEvent",
      description: "Add an event to the calendar",
      schema: z.object({
        summary: z.string().describe("The summary of the event."),
        description: z.string().describe("The description of the event."),
        start: z.string().describe("The start date and time of the event."),
        end: z.string().describe("The end date and time of the event."),
      }),
    }
  );
}
