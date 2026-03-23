import type { Context } from "hono"
import { deleteCookie, setCookie } from "hono/cookie"

const isProduction = process.env.NODE_ENV === "production"

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
}

export const setAuthCookie = (c: Context, token: string) => {
    setCookie(c, "session", token, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 7,
    })
}

export const clearAuthCookie = (c: Context) => {
    deleteCookie(c, "session", cookieOptions)
}
