import { Request, Response } from "express";
import { handleError } from "./error-handler";
import { User } from "./auth-user";
import { ApiResponse } from "./types";

export interface RequestPayload<T = unknown> {
  request: Request<any, any, T>;
  response: Response;
  user?: User;
}

export function handleRequest<T>(
  callback: (payload: RequestPayload<T>) => Promise<any>
) {
  return async (req: Request<T>, res: Response) => {
    try {
      const data = await callback({
        request: req,
        response: res,
        user: res.locals?.user,
      });

      const responseSent = res.headersSent;
      if (!responseSent) res.json(new ApiResponse(data, true));
    } catch (err: any) {
      handleError(err, req, res);
    }
  };
}
