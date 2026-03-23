import type { Context } from "hono"
import { prisma } from "../lib/prisma"
import type { AppEnv, AuthUser } from "../types"
import { clearAuthCookie, setAuthCookie } from "../utils/cookie"
import { createAuthToken } from "../utils/token"

const familySelect = {
    id: true,
    email: true,
    name: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
} as const

const profileSelect = {
    id: true,
    email: true,
    name: true,
    profileName: true,
    avatarUrl: true,
    isActive: true,
    familyId: true,
} as const

const toFamilyResponse = (family: {
    id: number
    email: string
    name: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}) => ({
    id: family.id,
    email: family.email,
    name: family.name,
    isActive: family.isActive,
    createdAt: family.createdAt,
    updatedAt: family.updatedAt,
})

export const register = async (c: Context<AppEnv>) => {
    const { body } = c.get("validated") as {
        body: {
            email: string
            password: string
            name: string
        }
    }

    const existingFamily = await prisma.family.findUnique({
        where: { email: body.email.toLowerCase() },
        select: { id: true },
    })

    if (existingFamily) {
        return c.json(
            {
                success: false,
                message: "Family account with this email already exists",
            },
            409
        )
    }

    const password = await Bun.password.hash(body.password)

    const family = await prisma.family.create({
        data: {
            email: body.email.toLowerCase(),
            password,
            name: body.name.trim(),
        },
        select: familySelect,
    })

    const token = await createAuthToken({
        familyId: family.id,
        email: family.email,
    })

    setAuthCookie(c, token)

    return c.json(
        {
            success: true,
            data: {
                family: toFamilyResponse(family),
            },
        },
        201
    )
}

export const login = async (c: Context<AppEnv>) => {
    const { body } = c.get("validated") as {
        body: {
            email: string
            password: string
        }
    }

    const family = await prisma.family.findUnique({
        where: { email: body.email.toLowerCase() },
        include: {
            profiles: {
                select: profileSelect,
                orderBy: { id: "asc" },
            },
        },
    })

    if (!family || !family.isActive) {
        return c.json(
            {
                success: false,
                message: "Invalid email or password",
            },
            401
        )
    }

    const passwordMatches = await Bun.password.verify(
        body.password,
        family.password
    )

    if (!passwordMatches) {
        return c.json(
            {
                success: false,
                message: "Invalid email or password",
            },
            401
        )
    }

    const token = await createAuthToken({
        familyId: family.id,
        email: family.email,
    })

    setAuthCookie(c, token)

    return c.json({
        success: true,
        data: {
            family: toFamilyResponse(family),
            profiles: family.profiles,
        },
    })
}

export const logout = async (c: Context<AppEnv>) => {
    clearAuthCookie(c)

    return c.json({
        success: true,
        message: "Logged out successfully",
    })
}

export const me = async (c: Context<AppEnv>) => {
    const user = c.get("user") as AuthUser

    const family = await prisma.family.findUnique({
        where: { id: user.familyId },
        select: {
            ...familySelect,
            profiles: {
                select: profileSelect,
                orderBy: [{ isActive: "desc" }, { id: "asc" }],
            },
        },
    })

    if (!family || !family.isActive) {
        clearAuthCookie(c)
        return c.json(
            {
                success: false,
                message: "Family account not found",
            },
            404
        )
    }

    const selectedProfile =
        family.profiles.find((profile) => profile.id === user.profileId) ?? null

    return c.json({
        success: true,
        data: {
            family: toFamilyResponse(family),
            profiles: family.profiles,
            selectedProfile,
        },
    })
}

export const changePassword = async (c: Context<AppEnv>) => {
    const user = c.get("user") as AuthUser
    const { body } = c.get("validated") as {
        body: {
            currentPassword: string
            newPassword: string
        }
    }

    const family = await prisma.family.findUnique({
        where: { id: user.familyId },
        select: {
            id: true,
            email: true,
            password: true,
        },
    })

    if (!family) {
        clearAuthCookie(c)
        return c.json(
            {
                success: false,
                message: "Family account not found",
            },
            404
        )
    }

    const passwordMatches = await Bun.password.verify(
        body.currentPassword,
        family.password
    )

    if (!passwordMatches) {
        return c.json(
            {
                success: false,
                message: "Current password is invalid",
            },
            400
        )
    }

    const password = await Bun.password.hash(body.newPassword)

    await prisma.family.update({
        where: { id: family.id },
        data: { password },
    })

    const token = await createAuthToken({
        familyId: family.id,
        email: family.email,
        profileId: user.profileId,
    })

    setAuthCookie(c, token)

    return c.json({
        success: true,
        message: "Password updated successfully",
    })
}
