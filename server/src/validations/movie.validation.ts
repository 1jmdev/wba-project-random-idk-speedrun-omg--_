import { z } from "zod"
import { Genre, ProviderType } from "../../../prisma/generated/enums"

const genreEnum = z.enum(Genre)
const providerTypeEnum = z.enum(ProviderType)

export const listMoviesQuerySchema = z.object({
    query: z.object({
        q: z.string().trim().min(1).optional(),
        genre: genreEnum.optional(),
        year: z.number().int().min(1888).max(2100).optional(),
        providerType: providerTypeEnum.optional(),
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
        sortBy: z.enum(["createdAt", "name", "year"]).optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
})

export const browseHomeQuerySchema = z.object({
    query: z.object({
        takePerGenre: z.number().int().min(1).max(20).optional(),
    }),
})

export const movieIdParamSchema = z.object({
    params: z.object({
        id: z.number().int().positive("Movie id must be a positive number"),
    }),
})

export const createMovieSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1, "Movie name is required"),
        year: z.number().int().min(1888).max(2100),
        length: z.number().int().positive("Movie length must be positive"),
        genres: z.array(genreEnum).min(1, "At least one genre is required"),
        providerType: providerTypeEnum,
        providerId: z.string().trim().min(1, "Provider id is required"),
    }),
})

export const updateMovieSchema = z.object({
    body: z
        .object({
            name: z.string().trim().min(1).optional(),
            year: z.number().int().min(1888).max(2100).optional(),
            length: z.number().int().positive().optional(),
            genres: z.array(genreEnum).min(1).optional(),
            providerType: providerTypeEnum.optional(),
            providerId: z.string().trim().min(1).optional(),
        })
        .refine((body) => Object.keys(body).length > 0, {
            message: "At least one field is required",
        }),
})
