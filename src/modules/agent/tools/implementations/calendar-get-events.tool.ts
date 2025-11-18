import { tool } from "langchain";
import z from "zod";

import { BaseTool } from "../base.tool";
import { CalendarService } from "../../../calendar/services";
import { parseDate } from "../../../calendar/utilities";

export class CalendarGetEventsTool extends BaseTool {
  private readonly calendarService: CalendarService;

  constructor() {
    super();

    this.calendarService = CalendarService.getInstance();
  }

  public tool = tool(
    async (input, config) => {
      console.log("input", input);
      const startDate = parseDate(input.startDate);
      const endDate = parseDate(input.endDate, true);
      console.log("startDate", startDate);
      console.log("endDate", endDate);

      const events = await this.calendarService.getEvents(
        config.configurable.userId,
        startDate,
        endDate
      );
      if (events.length === 0) {
        return "No events found for the given date range";
      }
      return (
        "The available events for the provided dates are: " +
        events
          .map(
            (event) => `${event.summary} from ${event.start} to ${event.end}`
          )
          .join(", ")
      );
    },
    {
      name: "getCalendarEvents",
      description:
        "Use this tool to retrieve the user's actual Google Calendar events. You MUST use this tool whenever asked about events, schedules, or availability.",
      schema: z.object({
        startDate: z
          .string()
          .describe(
            "The start date for the list of events. Can be natural language terms like 'today', 'tomorrow', 'yesterday', 'next week', 'last week', 'next month', 'last month', or natural language date strings."
          ),
        endDate: z
          .string()
          .describe(
            "The end date for the list of events. Can be natural language terms like 'today', 'tomorrow', 'yesterday', 'next week', 'last week', 'next month', 'last month', or natural language date strings."
          ),
      }),
    }
  );
}
