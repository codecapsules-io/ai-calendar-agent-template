import { calendar_v3, google } from "googleapis";
import { OAuth2Client } from "googleapis-common";

import { config } from "../../../config";

interface AuthToken {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

export class CalendarService {
  private static instance: CalendarService;
  private calendarClient: calendar_v3.Calendar;
  private authClient: OAuth2Client;
  private authTokens: AuthToken[] = [];

  static init() {
    if (this.instance) {
      return;
    }
    this.instance = new CalendarService();
  }

  static getInstance(): CalendarService {
    if (!this.instance) {
      throw new Error("CalendarService not initialized");
    }
    return this.instance;
  }

  private constructor() {
    this.calendarClient = new calendar_v3.Calendar({});
    this.authClient = new google.auth.OAuth2(
      config.googleCalendarClientId,
      config.googleCalendarSecret,
      (config.devMode ? 'http' : 'https') + `://${config.appUrl}/api/calendar/auth/callback`
    );
  }

  async getEvents(userId: string, startDate: Date, endDate: Date) {
    this.setAuthCredentials(userId);
    const events = await this.calendarClient.events.list({
      auth: this.authClient,
      calendarId: "primary",
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
    });
    const returnEvents =
      events.data.items?.map((event) => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        start: event.start?.dateTime,
        end: event.end?.dateTime,
      })) ?? [];
    return returnEvents;
  }

  async createEvent(
    userId: string,
    summary: string,
    description: string,
    start: Date,
    end: Date
  ) {
    this.setAuthCredentials(userId);
    const event = await this.calendarClient.events.insert({
      auth: this.authClient,
      calendarId: "primary",
      requestBody: {
        summary,
        description,
        start: {
          dateTime: start.toISOString(),
        },
        end: {
          dateTime: end.toISOString(),
        },
      },
    });
    return {
      summary: event.data.summary,
      description: event.data.description,
      start: event.data.start?.dateTime,
      end: event.data.end?.dateTime,
    };
  }

  async saveToken(userId: string, code: string) {
    const token = await this.authClient.getToken(code);
    if (!token.tokens.access_token || !token.tokens.refresh_token) {
      throw new Error("Failed to get token");
    }
    this.authTokens.push({
      userId,
      accessToken: token.tokens.access_token,
      refreshToken: token.tokens.refresh_token,
    });
  }

  getAuthUrl(userId: string) {
    const url = this.authClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/calendar"],
      state: userId,
    });
    return url;
  }

  validateUserToken(userId: string) {
    const token = this.authTokens.find((token) => token.userId === userId);
    if (!token) {
      const url = this.getAuthUrl(userId);
      throw new Error(
        "Token not found. Authorize by using the following URL: " + url
      );
    }
    return token;
  }

  private setAuthCredentials(userId: string) {
    const token = this.validateUserToken(userId);
    this.authClient.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    });
  }
}
