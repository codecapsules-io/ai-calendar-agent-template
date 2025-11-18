import { NextFunction, Request, Response } from "express";
import { config } from "../config";
import { AppError, StatusCode } from "./error-handler";

export interface User {
  id: string;
}

export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const ccApiKey = req.get("X-CC-API-KEY");
    if (ccApiKey) {
      if (ccApiKey !== config.internalApiKey) {
        throw new AppError("Unauthorized", StatusCode.UNAUTHORIZED);
      }
      const email = req.get("X-CC-EMAIL");
      if (email) {
        const user: User = {
          id: email,
        };
        res.locals = {
          user,
        };
      }
    }
    next();
  } catch (err) {
    console.log(err);
    throw new AppError("Unauthorized", StatusCode.UNAUTHORIZED);
  }
}
