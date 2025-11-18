/**
 * Parses natural language date terms and converts them to Date objects.
 * Supports terms like 'today', 'tomorrow', 'yesterday', and ISO date strings.
 */
export function parseDate(dateString: string, end: boolean = false): Date {
  const normalized = dateString.trim().toLowerCase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (end) {
    today.setHours(23, 59, 59, 999);
  }

  switch (normalized) {
    case "today":
      return new Date(today);

    case "tomorrow": {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }

    case "next week": {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }

    case "last week": {
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      return lastWeek;
    }

    case "next month": {
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    }

    case "last month": {
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return lastMonth;
    }

    default:
      const parsed = new Date(dateString);
      return parsed;
  }
}

