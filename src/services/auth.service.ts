import * as argon2 from "argon2";
import * as UsersModel from "../models/users.model.js";

import { DatabaseError } from "pg";
import { AppError } from "../utils/AppError.js";

import type { registerSchemaType } from "../validations/auth.validation.js";

export async function registerUser(data: registerSchemaType): Promise<string> {
    const hash = await argon2.hash(data.password); // Later make it more secure / add salting, etc.

    const { password, ...userData } = data;
    
    let userId: string;

    try {
        userId = await UsersModel.create({
            ...userData,
            pwdHash: hash
        })
    } catch(err: unknown) {
        if (err instanceof DatabaseError) {
            // PostgreSQL Unique Violation error code
            if (err.code === '23505') {
                throw new AppError(409, 'A user with this email already exists.');
            }
        }

        // Re-throw any other unexpected errors
        throw err;
    }

    return userId;
}

export async function checkLoginCredentials(email: string, password: string) {
    const user = await UsersModel.findByEmailWithPwdHash(email);

    if (!user) {
        throw new AppError(401, 'Invalid email or password');
    }

    const isPasswordValid = await argon2.verify(user.pwdHash, password);

    if (!isPasswordValid) {
        throw new AppError(401, 'Invalid email or password');
    }

    const { pwdHash, ...userExcludingHash } = user;

    return userExcludingHash; // mappedUserDataWithoutPwdHash
}