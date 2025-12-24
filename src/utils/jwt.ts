import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode(process.env['JWT_SECRET']);

export async function generateToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2m') // Short expiration time for testing
        .sign(SECRET);
}