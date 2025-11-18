import { Router } from "express";

import { Controller } from "../../../core";
import { CalendarService } from "../services";
import {
  AppError,
  handleRequest,
  RequestPayload,
  StatusCode,
} from "../../../middleware";

export class CalendarController extends Controller {
  private readonly calendarService: CalendarService;

  constructor() {
    super();

    this.calendarService = CalendarService.getInstance();
  }

  public get routes() {
    const router = Router();

    router.get(
      "/auth",
      handleRequest((payload) => this.getAuthUrl(payload))
    );
    router.get(
      "/auth/callback",
      handleRequest((payload) => this.saveToken(payload))
    );

    return router;
  }

  private async getAuthUrl(payload: RequestPayload) {
    if (!payload.user) {
      throw new AppError("Unauthorized", StatusCode.UNAUTHORIZED);
    }
    const authUrl = this.calendarService.getAuthUrl(payload.user.id);
    return { url: authUrl };
  }

  private async saveToken(payload: RequestPayload) {
    const userId = payload.request.query.state as string;
    const code = payload.request.query.code as string;
    await this.calendarService.saveToken(userId, code);
    return { message: "Token saved" };
  }
}
