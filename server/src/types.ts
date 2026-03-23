import type { Context } from "hono"

export interface AuthUser {
    familyId: number
    email: string
    profileId?: number
}

export interface AuthTokenPayload {
    familyId: number
    email: string
    profileId?: number
    exp?: number
    iat?: number
}

export type Variables = {
    user: AuthUser
    requestId: string
    validated: Record<string, unknown>
}

export type AppEnv = {
    Variables: Variables
}

export type AppContext = Context<AppEnv>
