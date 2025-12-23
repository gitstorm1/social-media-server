import * as argon2 from "argon2";
import * as UsersModel from "../models/users.model.js";

import type { registerSchemaType } from "../validations/auth.validation.js";

export async function registerUser(data: registerSchemaType) {
    const hash = await argon2.hash(data.password);

    const { password, ...userData } = data;
    
    return await UsersModel.create({
        ...userData,
        pwdHash: hash
    });
}