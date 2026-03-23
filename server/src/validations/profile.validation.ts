import { z } from "zod"

const nullableUrl = z.union([
    z.string().trim().url("Avatar URL must be valid"),
    z.literal(""),
    z.null(),
])

export const profileIdParamSchema = z.object({
    params: z.object({
        id: z.number().int().positive("Profile id must be a positive number"),
    }),
})

export const createProfileSchema = z.object({
    body: z.object({
        email: z.email("Valid email is required"),
        name: z
            .string()
            .trim()
            .min(2, "Profile name must be at least 2 characters"),
        profileName: z.string().trim().min(1).max(40).optional(),
        avatarUrl: z.string().trim().url("Avatar URL must be valid").optional(),
    }),
})

export const updateProfileSchema = z.object({
    body: z
        .object({
            email: z
                .email("Valid email is required")
                .optional(),
            name: z.string().trim().min(2).optional(),
            profileName: z.string().trim().max(40).optional(),
            avatarUrl: nullableUrl.optional(),
            isActive: z.boolean().optional(),
        })
        .refine((body) => Object.keys(body).length > 0, {
            message: "At least one field is required",
        }),
})
