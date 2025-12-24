import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

const isProduction = process.env['NODE_ENV'] === 'production';

// (All four parameters need to be included for it to be recognized as an error handler)
export async function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  // Sends stack traces to client if not production
  const response = {
    status: 'error',
    message, // (shorthand for message: message)
    ...(!isProduction && { stack: err.stack }),
  };

  console.error(`[Error] ${req.method} ${req.path}:`, err);

  res.status(statusCode).json(response);
};