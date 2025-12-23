import { pool } from "../config/db.js";

export async function findById(id: string) {
    const query = `
        SELECT 
            id,
            first_name,
            last_name,
            gender,
            email,
            bio, 
            location,
            avatar_url,
            cover_url,
            created_at
        FROM users 
        WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
}

export async function findByEmail(email: string) {
    const query = `
        SELECT 
            id,
            first_name,
            last_name,
            gender,
            email,
            bio, 
            location,
            avatar_url,
            cover_url,
            created_at
        FROM users 
        WHERE email = $1;
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0] || null;
}

interface UserData {
    id: string, // BigInt is returned as string by pg

}

export async function createUser(userData: any) {

}