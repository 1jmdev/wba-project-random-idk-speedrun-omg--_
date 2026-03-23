import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.email('Valid email is required'),
        password: z
            .string()
            .min(6, 'Password is required, minimum 6 characters long'),
    }),
});

export const changePasswordSchema = z.object({
    body: z.object({
        newPassword: z
            .string()
            .min(6, 'New password must be at least 6 characters'),
    }),
});