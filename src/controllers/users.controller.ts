import { type Request, type Response } from "express";
import * as UsersService from "../services/users.service.js";

export async function getUserProfile(req: Request, res: Response) {
    const { id } = req.params;

    if (id === undefined) return;

    const user = await UsersService.fetchUser(id);
    res.json(user);
}