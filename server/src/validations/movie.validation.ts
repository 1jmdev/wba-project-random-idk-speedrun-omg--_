import { ProviderType } from "@prisma/client"
import { z } from "zod"

const providerTypeEnum = z.enum(ProviderType)

export const listMoviesQuerySchema = z.object({
    query: z.object({
        q: z.string().trim().min(1).optional(),
        genre: z.string().trim().optional(),
        year: z.number().int().min(1888).max(2100).optional(),
        providerType: providerTypeEnum.optional(),
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
        sortBy: z.enum(["year", "title_en", "id"]).optional(),
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

export const movieStreamParamSchema = z.object({
    params: z.object({
        id: z.number().int().positive("Movie id must be a positive number"),
    }),
})
