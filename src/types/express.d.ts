import { type Request } from "express";

// JWT payload that goes in req.user in the authenticate middleware
export interface UserJWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

// Declaration merging
declare global {
  namespace Express {
    interface Request {
      user: UserJWTPayload | undefined;
    }
  }
}