import type { Context } from "hono"
import { Genre } from "@prisma/client"
import { prisma } from "../lib/prisma"
import { parsePrehrajtoVideoSource } from "../parsers/prehrajto"
import type { AppEnv } from "../types"

const movieSelect = {
    id: true,
    name: true,
    year: true,
    length: true,
    genres: true,
    providerType: true,
    providerId: true,
    createdAt: true,
    updatedAt: true,
} as const

const currentYear = new Date().getFullYear()

const releasedMovieWhere = {
    year: {
        lte: currentYear,
    },
} as const

export const list = async (c: Context<AppEnv>) => {
    const { query } = c.get("validated") as {
        query: {
            q?: string
            genre?: Genre
            year?: number
            providerType?: "PREHRAJTO"
            limit?: number
            offset?: number
            sortBy?: "createdAt" | "name" | "year"
            sortOrder?: "asc" | "desc"
        }
    }

    const where = {
        ...releasedMovieWhere,
        ...(query.q
            ? {
                  name: {
                      contains: query.q,
                      mode: "insensitive" as const,
                  },
              }
            : {}),
        ...(query.genre ? { genres: { has: query.genre } } : {}),
        ...(typeof query.year === "number" ? { year: query.year } : {}),
        ...(query.providerType ? { providerType: query.providerType } : {}),
    }

    const limit = query.limit ?? 24
    const offset = query.offset ?? 0

    const [movies, total] = await Promise.all([
        prisma.movie.findMany({
            where,
            orderBy: {
                [query.sortBy ?? "createdAt"]: query.sortOrder ?? "desc",
            },
            take: limit,
            skip: offset,
            select: movieSelect,
        }),
        prisma.movie.count({ where }),
    ])

    return c.json({
        success: true,
        data: {
            items: movies,
            total,
            limit,
            offset,
            hasMore: offset + movies.length < total,
        },
    })
}

export const featured = async (c: Context<AppEnv>) => {
    const movies = await prisma.movie.findMany({
        where: releasedMovieWhere,
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        take: 10,
        select: movieSelect,
    })

    return c.json({
        success: true,
        data: {
            hero: movies[0] ?? null,
            items: movies,
        },
    })
}

export const browseHome = async (c: Context<AppEnv>) => {
    const { query } = c.get("validated") as {
        query: {
            takePerGenre?: number
        }
    }

    const takePerGenre = query.takePerGenre ?? 12
    const featuredTake = Math.max(10, takePerGenre)
    const genreCandidates = [
        Genre.ACTION,
        Genre.DRAMA,
        Genre.COMEDY,
        Genre.THRILLER,
        Genre.SCIFI,
        Genre.ROMANCE,
        Genre.HORROR,
        Genre.DOCUMENTARY,
    ]

    const [featuredMovies, rowGroups] = await Promise.all([
        prisma.movie.findMany({
            where: releasedMovieWhere,
            orderBy: [{ year: "desc" }, { createdAt: "desc" }],
            take: featuredTake,
            select: movieSelect,
        }),
        Promise.all(
            genreCandidates.map(async (genre) => ({
                genre,
                items: await prisma.movie.findMany({
                    where: {
                        ...releasedMovieWhere,
                        genres: { has: genre },
                    },
                    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
                    take: takePerGenre,
                    select: movieSelect,
                }),
            }))
        ),
    ])

    const rows = rowGroups
        .filter((row) => row.items.length > 0)
        .slice(0, 6)
        .map(({ genre, items }) => ({
            genre,
            title: genre.replaceAll("_", " "),
            items,
        }))

    return c.json({
        success: true,
        data: {
            hero: featuredMovies[0] ?? null,
            trending: featuredMovies.slice(0, 10),
            rows,
        },
    })
}

export const listGenres = async (_c: Context<AppEnv>) => {
    const movies = await prisma.movie.findMany({
        where: releasedMovieWhere,
        select: { genres: true },
    })

    const counts = new Map<Genre, number>()

    for (const movie of movies) {
        for (const genre of movie.genres) {
            counts.set(genre, (counts.get(genre) ?? 0) + 1)
        }
    }

    const data = Object.values(Genre)
        .map((genre) => ({
            genre,
            count: counts.get(genre) ?? 0,
        }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count)

    return _c.json({
        success: true,
        data,
    })
}

export const getById = async (c: Context<AppEnv>) => {
    const { params } = c.get("validated") as {
        params: {
            id: number
        }
    }

    const movie = await prisma.movie.findFirst({
        where: {
            id: params.id,
            ...releasedMovieWhere,
        },
        select: movieSelect,
    })

    if (!movie) {
        return c.json(
            {
                success: false,
                message: "Movie not found",
            },
            404
        )
    }

    return c.json({
        success: true,
        data: movie,
    })
}

export const create = async (c: Context<AppEnv>) => {
    const { body } = c.get("validated") as {
        body: {
            name: string
            year: number
            length: number
            genres: Genre[]
            providerType: "PREHRAJTO"
            providerId: string
        }
    }

    const movie = await prisma.movie.create({
        data: body,
        select: movieSelect,
    })

    return c.json(
        {
            success: true,
            data: movie,
        },
        201
    )
}

export const update = async (c: Context<AppEnv>) => {
    const { params, body } = c.get("validated") as {
        params: {
            id: number
        }
        body: {
            name?: string
            year?: number
            length?: number
            genres?: Genre[]
            providerType?: "PREHRAJTO"
            providerId?: string
        }
    }

    const existingMovie = await prisma.movie.findUnique({
        where: { id: params.id },
        select: { id: true },
    })

    if (!existingMovie) {
        return c.json(
            {
                success: false,
                message: "Movie not found",
            },
            404
        )
    }

    const movie = await prisma.movie.update({
        where: { id: params.id },
        data: body,
        select: movieSelect,
    })

    return c.json({
        success: true,
        data: movie,
    })
}

export const remove = async (c: Context<AppEnv>) => {
    const { params } = c.get("validated") as {
        params: {
            id: number
        }
    }

    const existingMovie = await prisma.movie.findUnique({
        where: { id: params.id },
        select: { id: true },
    })

    if (!existingMovie) {
        return c.json(
            {
                success: false,
                message: "Movie not found",
            },
            404
        )
    }

    await prisma.movie.delete({
        where: { id: params.id },
    })

    return c.json({
        success: true,
        message: "Movie deleted successfully",
    })
}

export const stream = async (c: Context<AppEnv>) => {
    const { params } = c.get("validated") as {
        params: {
            id: number
        }
    }

    const movie = await prisma.movie.findFirst({
        where: {
            id: params.id,
            ...releasedMovieWhere,
        },
        select: { providerId: true, name: true },
    })

    if (!movie) {
        return c.json(
            {
                success: false,
                message: "Movie not found",
            },
            404
        )
    }

    const source = await parsePrehrajtoVideoSource(movie.providerId)

    if (!source.rawVideoUrl) {
        return c.json(
            {
                success: false,
                message: "Video source not available",
            },
            404
        )
    }

    return c.json({
        success: true,
        data: {
            url: source.rawVideoUrl,
            title: source.title ?? movie.name,
            duration: source.duration,
        },
    })
}
