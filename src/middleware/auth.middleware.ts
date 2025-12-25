import { type Request, type Response, type NextFunction } from "express";
import { verifyJwtAndGetPayload } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import { type UserJWTPayload } from "../types/express.d.js";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const token: string | undefined = req.cookies['accessToken'];

    if (!token) {
        throw new AppError(401, 'Please log in to continue.');
    }

    try {
        const payload = await verifyJwtAndGetPayload(token);

        req.user = payload as unknown as UserJWTPayload;

        next();
    } catch (error) {
        throw new AppError(401, 'Session expired or invalid token. Please log in again.');
    }
}