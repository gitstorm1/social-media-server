import { type Request, type Response } from 'express';
import { registerSchema } from '../validations/auth.validation.js';
import { AppError } from '../utils/AppError.js';
import * as AuthService from '../services/auth.service.js';
import { generateToken } from '../utils/jwt.js';

export async function register(req: Request, res: Response) {
    const validatedData = registerSchema.parse(req.body);

    const newUser = await AuthService.registerUser(validatedData);

    const token = await generateToken({ userId: newUser.id });

    res.status(201).json({
        message: "User registered successfully",
        token,
        user: newUser
    });
}

export async function login(req: Request, res: Response) {

}