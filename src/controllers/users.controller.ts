import { type Request, type Response } from "express";
import { AppError } from "../utils/AppError.js";
import * as UsersService from "../services/users.service.js";

export async function getUserProfile(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
        throw new AppError(400, 'User ID is required');
    }

    const user = await UsersService.fetchUser(id);
    res.json(user);
}

export async function getThisUserProfile(req: Request, res: Response) {
    const user = req.user as NonNullable<typeof req.user>;

    const publicUser = await UsersService.fetchUser(user.userId);
    res.json(publicUser);
}

export async function updateUserProfileFields(req: Request, res: Response) {
    
}