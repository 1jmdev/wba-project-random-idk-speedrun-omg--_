import { z } from "zod"

export const registerSchema = z.object({
    body: z.object({
        email: z.email("Valid email is required"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters long"),
        name: z
            .string()
            .trim()
            .min(2, "Family name must be at least 2 characters"),
    }),
})

export const loginSchema = z.object({
    body: z.object({
        email: z.email("Valid email is required"),
        password: z
            .string()
            .min(6, "Password must be at least 6 characters long"),
    }),
})

export const changePasswordSchema = z.object({
    body: z
        .object({
            currentPassword: z
                .string()
                .min(6, "Current password must be at least 6 characters long"),
            newPassword: z
                .string()
                .min(6, "New password must be at least 6 characters long"),
        })
        .refine((data) => data.currentPassword !== data.newPassword, {
            message: "New password must be different from current password",
            path: ["newPassword"],
        }),
})
