import { type Request, type Response } from "express";
import { registerSchema } from "../validations/auth.validation.js";
import { AppError } from "../utils/AppError.js";
import * as AuthService from "../services/auth.service.js";
import { generateToken } from "../utils/jwt.js";

const isProduction = process.env["NODE_ENV"] === 'production';

function checkLoggedIn(req: Request) {
    if (req.cookies['accessToken']) {
        throw new AppError(403, 'You are already logged in. Please log out first.');
    }
}

export async function register(req: Request, res: Response) {
    checkLoggedIn(req);

    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        throw new AppError(400, 'Invalid request body');
    }

    const validatedData = result.data;

    const newUserId = await AuthService.registerUser(validatedData);

    // Send a token back so the user is logged in
    const token = await generateToken({ userId: newUserId });

    res.cookie('accessToken', token, {
        httpOnly: true, // Prevents JavaScript access
        secure: isProduction, // HTTPS in production
        sameSite: 'strict', // Prevents CSRF attacks
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    res.status(201).json({
        message: 'User registered successfully',
        userId: newUserId,
    });
}

export async function login(req: Request, res: Response) {
    checkLoggedIn(req);

    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError(400, 'Email and password are required');
    }

    const user = await AuthService.checkLoginCredentials(email, password);

    // Send a token back so the user is logged in
    const token = await generateToken({ userId: user.id });

    res.cookie('accessToken', token, {
        httpOnly: true, // Prevents JavaScript access
        secure: isProduction, // HTTPS in production
        sameSite: 'strict', // Prevents CSRF attacks
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    res.status(200).json({
        message: 'Login successful',
        userId: user.id,
    });
}