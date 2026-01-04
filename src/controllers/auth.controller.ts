import { type Request, type Response } from "express";
import { registerSchema } from "../validations/auth.validation.js";
import { AppError } from "../utils/AppError.js";
import * as AuthService from "../services/auth.service.js";
import { generateToken } from "../utils/jwt.js";

const isProduction = process.env['NODE_ENV'] === 'production';

function checkLoggedIn(req: Request) {
    if (req.cookies['accessToken']) {
        throw new AppError(403, 'You are already logged in. Please log out first.');
    }
}

async function setAuthCookie(res: Response, userId: string) {
    // This is what actually logs in the user
    const token = await generateToken({ userId: userId });

    res.cookie('accessToken', token, {
        httpOnly: true, // Prevents JavaScript access
        secure: isProduction, // HTTPS in production
        sameSite: 'strict', // Prevents CSRF attacks
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    });
}

export async function register(req: Request, res: Response) {
    checkLoggedIn(req);

    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        throw new AppError(400, 'Invalid request body');
    }

    const validatedData = result.data;

    const newUser = await AuthService.registerUser(validatedData);

    await setAuthCookie(res, newUser.id);

    res.status(201).json({
        message: 'User registered successfully',
        user: newUser,
    });
}

export async function login(req: Request, res: Response) {
    checkLoggedIn(req);

    const { email, password } = req.body;

    // TODO: Need to add validation checks for this the same as in register function

    if (!email || !password) {
        throw new AppError(400, 'Email and password are required');
    }

    const user = await AuthService.checkLoginCredentials(email, password);

    await setAuthCookie(res, user.id);

    res.status(200).json({
        message: 'Login successful',
        user: user,
    });
}