import type { Context } from "hono"
import { prisma } from "../lib/prisma"
import type { AppEnv, AuthUser } from "../types"
import { setAuthCookie } from "../utils/cookie"
import { createAuthToken } from "../utils/token"

const profileSelect = {
    id: true,
    name: true,
    familyId: true,
} as const

export const list = async (c: Context<AppEnv>) => {
    const user = c.get("user") as AuthUser

    const profiles = await prisma.profile.findMany({
        where: { familyId: user.familyId },
        orderBy: { id: "asc" },
        select: profileSelect,
    })

    return c.json({
        success: true,
        data: profiles,
    })
}

export const getById = async (c: Context<AppEnv>) => {
    const user = c.get("user") as AuthUser
    const { params } = c.get("validated") as {
        params: {
            id: number
        }
    }

    const profile = await prisma.profile.findFirst({
        where: {
            id: params.id,
            familyId: user.familyId,
        },
        select: profileSelect,
    })

    if (!profile) {
        return c.json(
            {
                success: false,
                message: "Profile not found",
            },
            404
        )
    }

    return c.json({
        success: true,
        data: profile,
    })
}

export const create = async (c: Context<AppEnv>) => {
    const user = c.get("user") as AuthUser
    const { body } = c.get("validated") as {
        body: {
            name: string
        }
    }

    const count = await prisma.profile.count({
        where: { familyId: user.familyId },
    })

    if (count >= 5) {
        return c.json(
            {
                success: false,
                message: "Family can have at most 5 profiles",
            },
            400
        )
    }

    const profile = await prisma.profile.create({
        data: {
            familyId: user.familyId,
            name: body.name.trim(),
        },
        select: profileSelect,
    })

    return c.json(
        {
            success: true,
            data: profile,
        },
        201
    )
}

export const update = async (c: Context<AppEnv>) => {
    const user = c.get("user") as AuthUser
    const { params, body } = c.get("validated") as {
        params: {
            id: number
        }
        body: {
            name?: string
        }
    }

    const existingProfile = await prisma.profile.findFirst({
        where: {
            id: params.id,
            familyId: user.familyId,
        },
        select: { id: true },
    })

    if (!existingProfile) {
        return c.json(
            {
                success: false,
                message: "Profile not found",
            },
            404
        )
    }

    const profile = await prisma.profile.update({
        where: { id: params.id },
        data: {
            ...(body.name ? { name: body.name.trim() } : {}),
        },
        select: profileSelect,
    })

    return c.json({
        success: true,
        data: profile,
    })
}

export const remove = async (c: Context<AppEnv>) => {
    const user = c.get("user") as AuthUser
    const { params } = c.get("validated") as {
        params: {
            id: number
        }
    }

    const profiles = await prisma.profile.findMany({
        where: { familyId: user.familyId },
        select: { id: true },
    })

    if (!profiles.some((profile) => profile.id === params.id)) {
        return c.json(
            {
                success: false,
                message: "Profile not found",
            },
            404
        )
    }

    if (profiles.length <= 1) {
        return c.json(
            {
                success: false,
                message: "At least one profile must remain in the family",
            },
            400
        )
    }

    await prisma.profile.delete({
        where: { id: params.id },
    })

    if (user.profileId === params.id) {
        const token = await createAuthToken({
            familyId: user.familyId,
        })
        setAuthCookie(c, token)
    }

    return c.json({
        success: true,
        message: "Profile deleted successfully",
    })
}

export const selectProfile = async (c: Context<AppEnv>) => {
    const user = c.get("user") as AuthUser
    const { params } = c.get("validated") as {
        params: {
            id: number
        }
    }

    const profile = await prisma.profile.findFirst({
        where: {
            id: params.id,
            familyId: user.familyId,
        },
        select: profileSelect,
    })

    if (!profile) {
        return c.json(
            {
                success: false,
                message: "Profile not found",
            },
            404
        )
    }

    const token = await createAuthToken({
        familyId: user.familyId,
        profileId: profile.id,
    })

    setAuthCookie(c, token)

    return c.json({
        success: true,
        data: profile,
    })
}

export const clearSelectedProfile = async (c: Context<AppEnv>) => {
    const user = c.get("user") as AuthUser

    const token = await createAuthToken({
        familyId: user.familyId,
    })

    setAuthCookie(c, token)

    return c.json({
        success: true,
        message: "Selected profile cleared",
    })
}
