import * as UserModel from '../models/users.model.js';

export async function fetchUser(id: string) {
    

    return await UserModel.findById(id);
};