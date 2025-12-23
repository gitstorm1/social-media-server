import * as argon2 from "argon2";
import * as UserModel from "../models/users.model.js";

export async function registerUser(data: any) {
    // Hash the password
    const hash = await argon2.hash(data.password);
    
    // Save to DB (pass the hash, not the plain password)
    return await UserModel.create({
        ...data,
        passwordHash: hash
    });
}