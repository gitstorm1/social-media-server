import { pool } from "../config/db.js";

export async function findById(id: string) {
    const query = `
        SELECT 
            id, first_name, last_name, email, bio, 
            location, avatar_url, cover_url, created_at 
        FROM users 
        WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
}