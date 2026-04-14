import { sign, verify } from "hono/jwt"
import type { AuthTokenPayload, AuthUser } from "../types"

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me"

export const createAuthToken = async (user: AuthUser) => {
    return sign(
        {
            familyId: user.familyId,
            profileId: user.profileId,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
        },
        JWT_SECRET
    )
}

export const verifyAuthToken = async (
    token: string
): Promise<AuthTokenPayload | null> => {
    try {
        const payload = (await verify(
            token,
            JWT_SECRET,
            "HS256"
        )) as unknown as AuthTokenPayload
        return payload
    } catch {
        return null
    }
}
