import type { Context, Next } from "hono"
import { getCookie } from "hono/cookie"
import { prisma } from "../lib/prisma"
import type { AppEnv } from "../types"
import { clearAuthCookie } from "../utils/cookie"
import { verifyAuthToken } from "../utils/token"

export const authRequired = async (c: Context<AppEnv>, next: Next) => {
    const token = getCookie(c, "session")

    if (!token) {
        return c.json(
            {
                success: false,
                message: "Authentication required",
            },
            401
        )
    }

    const payload = await verifyAuthToken(token)

    if (!payload) {
        clearAuthCookie(c)
        return c.json(
            {
                success: false,
                message: "Invalid or expired session",
            },
            401
        )
    }

    const family = await prisma.family.findUnique({
        where: { id: payload.familyId },
        select: {
            id: true,
            email: true,
            isActive: true,
        },
    })

    if (!family || !family.isActive) {
        clearAuthCookie(c)
        return c.json(
            {
                success: false,
                message: "Family account is not available",
            },
            401
        )
    }

    if (payload.profileId) {
        const profile = await prisma.profile.findFirst({
            where: {
                id: payload.profileId,
                familyId: payload.familyId,
                isActive: true,
            },
            select: { id: true },
        })

        if (!profile) {
            clearAuthCookie(c)
            return c.json(
                {
                    success: false,
                    message: "Selected profile is no longer available",
                },
                401
            )
        }
    }

    c.set("user", {
        familyId: family.id,
        email: family.email,
        profileId: payload.profileId,
    })

    await next()
}
