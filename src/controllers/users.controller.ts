import { type Request, type Response } from 'express';
import { AppError } from '../utils/AppError.js';
import * as UsersService from '../services/users.service.js';

export async function getUserProfile(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
        throw new AppError(400, "User ID is required");
    }

    const user = await UsersService.fetchUser(id);

    if (!user) {
        throw new AppError(404, "User not found");
    }

    res.json(user);
}