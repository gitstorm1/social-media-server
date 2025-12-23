import * as UsersModel from '../models/users.model.js';
import { AppError } from '../utils/AppError.js';

export async function fetchUser(id: string) {
    const user = await UsersModel.findById(id);

    if (!user) {
        throw new AppError(404, 'User not found');
    }

    return user;
};