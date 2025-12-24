import { pool } from "../config/db.js";

interface mappedUserDataWithPwdHash {
    id: string,

    firstName: string,
    lastName: string,

    dateOfBirth: Date,

    gender: string,

    email: string,
    pwdHash: string,

    bio: string | null,
    location: string,

    avatarUrl: string | null,
    coverUrl: string | null,

    createdAt: Date,
}

type mappedUserDataWithoutPwdHash = Omit<mappedUserDataWithPwdHash, 'pwdHash'>;

export async function findById(id: string): Promise<mappedUserDataWithoutPwdHash | null> {
    const query = `
        SELECT 
            id,
            first_name,
            last_name,
            date_of_birth,
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

    const userData = result.rows[0];

    if (!userData) {
        return null;
    }

    const mappedUserData: mappedUserDataWithoutPwdHash = {
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        dateOfBirth: userData.date_of_birth,
        gender: userData.gender,
        email: userData.email,
        bio: userData.bio,
        location: userData.location,
        avatarUrl: userData.avatar_url,
        coverUrl: userData.cover_url,
        createdAt: userData.created_at,
    }

    return mappedUserData;
}

export async function findByEmail(email: string): Promise<mappedUserDataWithoutPwdHash | null> {
    const query = `
        SELECT 
            id,
            first_name,
            last_name,
            date_of_birth,
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

    const userData = result.rows[0];

    if (!userData) {
        return null;
    }

    const mappedUserData: mappedUserDataWithoutPwdHash = {
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        dateOfBirth: userData.date_of_birth,
        gender: userData.gender,
        email: userData.email,
        bio: userData.bio,
        location: userData.location,
        avatarUrl: userData.avatar_url,
        coverUrl: userData.cover_url,
        createdAt: userData.created_at,
    }

    return mappedUserData;
}

export async function findByEmailWithPwdHash(email: string): Promise<mappedUserDataWithPwdHash | null> {
    const query = `
        SELECT 
            id,
            first_name,
            last_name,
            date_of_birth,
            gender,
            email,
            bio, 
            location,
            avatar_url,
            cover_url,
            created_at,
            pwd_hash
        FROM users 
        WHERE email = $1;
    `;

    const result = await pool.query(query, [email]);

    const userData = result.rows[0];

    if (!userData) {
        return null;
    }

    const mappedUserData: mappedUserDataWithPwdHash = {
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        dateOfBirth: userData.date_of_birth,
        gender: userData.gender,
        email: userData.email,
        bio: userData.bio,
        location: userData.location,
        avatarUrl: userData.avatar_url,
        coverUrl: userData.cover_url,
        createdAt: userData.created_at,
        pwdHash: userData.pwd_hash,
    }

    return mappedUserData;
}

interface createUserData {
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    gender: string,
    email: string,
    pwdHash: string,
    location: string
}

export async function create(userData: createUserData): Promise<string> {
    const query = `
        INSERT INTO users (first_name, last_name, date_of_birth, gender, email, pwd_hash, location)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
    `;
    
    // I don't see the need to return any details other than the ID, because they
    // will already be with the function calling this one

    const values = [
        userData.firstName,
        userData.lastName,
        userData.dateOfBirth,
        userData.gender,
        userData.email,
        userData.pwdHash,
        userData.location,
    ];

    const response = await pool.query(query, values);
    
    // BigInt is returned as string by pg
    return response.rows[0].id as string;
}