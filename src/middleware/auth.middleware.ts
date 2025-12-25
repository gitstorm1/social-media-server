import { type Request, type Response, type NextFunction } from "express";
import { verifyJwtAndGetPayload } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(401, 'Authentication required. Please log in.');
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        throw new AppError(401, 'Invalid token');
    }

    try {
        const payload = await verifyJwtAndGetPayload(token);

        console.log(payload);

        req.user = payload as any;

        next();
    } catch (error) {
        throw new AppError(401, 'Session expired or invalid token. Please log in again.');
    }
}