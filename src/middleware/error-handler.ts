import { Request, Response } from "express";
import { ErrorResponse } from "./types";

export enum StatusCode {
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  UNAUTHORIZED = 401,
  INTERNAL_SERVER_ERROR = 500,
}

export class AppError extends Error {
  statusCode?: StatusCode;

  constructor(message: string, statusCode?: StatusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function handleError<T>(err: any, req: Request<T>, res: Response) {
  let statusCode = StatusCode.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";

  if (!(err instanceof AppError)) {
    if (Object.keys(err).includes("response")) {
      if (Object.keys(err.response).includes("data")) {
        let data = "";
        try {
          data = JSON.stringify(err.response.data);
        } catch (err2) {
          data = err.response.data;
        }
        console.log(`err.response.data = ${data}`);
      }
    }
    console.error(req.url, err);
  } else {
    statusCode = err.statusCode || StatusCode.INTERNAL_SERVER_ERROR;
    message = err.message || "Internal Server Error";
  }

  console.error(`[Error] ${statusCode}: ${message}`, err.stack);

  const error: ErrorResponse = {
    success: false,
    error: message,
  }

  res.status(statusCode).json(error);
}
