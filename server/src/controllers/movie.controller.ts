import type { Context } from "hono"
import { Genre } from "../../../prisma/generated/enums"
import { prisma } from "../lib/prisma"
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

export const list = async (c: Context<AppEnv>) => {
    const { query } = c.get("validated") as {
        query: {
            q?: string
            genre?: Genre
            year?: number
            providerType?: "PREHRAJTO"
            take?: number
            skip?: number
            sortBy?: "createdAt" | "name" | "year"
            sortOrder?: "asc" | "desc"
        }
    }

    const movies = await prisma.movie.findMany({
        where: {
            ...(query.q
                ? {
                      name: {
                          contains: query.q,
                          mode: "insensitive",
                      },
                  }
                : {}),
            ...(query.genre ? { genres: { has: query.genre } } : {}),
            ...(typeof query.year === "number" ? { year: query.year } : {}),
            ...(query.providerType ? { providerType: query.providerType } : {}),
        },
        orderBy: {
            [query.sortBy ?? "createdAt"]: query.sortOrder ?? "desc",
        },
        take: query.take ?? 24,
        skip: query.skip ?? 0,
        select: movieSelect,
    })

    return c.json({
        success: true,
        data: movies,
    })
}

export const featured = async (c: Context<AppEnv>) => {
    const movies = await prisma.movie.findMany({
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

    const allMovies = await prisma.movie.findMany({
        orderBy: [{ year: "desc" }, { createdAt: "desc" }],
        select: movieSelect,
    })

    const genreMap = new Map<Genre, typeof allMovies>()

    for (const movie of allMovies) {
        for (const genre of movie.genres) {
            const existing = genreMap.get(genre) ?? []
            genreMap.set(genre, [...existing, movie])
        }
    }

    const rows = [...genreMap.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 6)
        .map(([genre, items]) => ({
            genre,
            title: genre.replaceAll("_", " "),
            items: items.slice(0, query.takePerGenre ?? 12),
        }))

    return c.json({
        success: true,
        data: {
            hero: allMovies[0] ?? null,
            trending: allMovies.slice(0, 10),
            rows,
        },
    })
}

export const listGenres = async (_c: Context<AppEnv>) => {
    const movies = await prisma.movie.findMany({
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

    const movie = await prisma.movie.findUnique({
        where: { id: params.id },
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
