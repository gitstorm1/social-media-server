import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env['JWT_SECRET']);

export async function generateToken(payload: Record<string, any>) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2m') // Short expiration time for testing
        .sign(SECRET);
}

export async function verifyJwtAndGetPayload(token: string) {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
}