import { z } from "zod"

export const profileIdParamSchema = z.object({
    params: z.object({
        id: z.number().int().positive("Profile id must be a positive number"),
    }),
})

export const createProfileSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(2, "Profile name must be at least 2 characters")
            .max(40, "Profile name must be at most 40 characters"),
    }),
})

export const updateProfileSchema = z.object({
    body: z
        .object({
            name: z.string().trim().min(2).max(40).optional(),
        })
        .refine((body) => Object.keys(body).length > 0, {
            message: "At least one field is required",
        }),
})
