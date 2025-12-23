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

export async function create(userData: any) {
    const query = `
        INSERT INTO users (first_name, last_name, date_of_birth, gender, email, pwd_hash, location)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;

    const values = [
        userData.firstName,
        userData.lastName,
        userData.dateOfBirth,
        userData.gender,
        userData.email,
        userData.pwdHash,
        userData.location,
    ];

    const { rows } = await pool.query(query, values);
    
    // Return the row mapped to camelCase
    return 0;
}