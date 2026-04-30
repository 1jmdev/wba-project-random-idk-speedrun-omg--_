import type { Context } from "hono"
import { prisma } from "../lib/prisma"
import { parsePrehrajtoVideoSource } from "../parsers/prehrajto"
import type { AppEnv } from "../types"

const movieSelect = {
    id: true,
    title_en: true,
    title_cz: true,
    type: true,
    origins: true,
    isAdult: true,
    length: true,
    year: true,
    providerId: true,
    providerType: true,
    description: true,
    genres: {
        select: {
            genre: {
                select: {
                    name: true,
                },
            },
        },
    },
} as const

type MoviePayload = {
    id: number
    title_en: string | null
    title_cz: string | null
    type: string
    origins: string[]
    isAdult: boolean
    length: number | null
    year: number | null
    providerId: string | null
    providerType: string
    description: string | null
    genres: { genre: { name: string } }[]
}

const serializeMovie = (movie: MoviePayload) => ({
    ...movie,
    genres: movie.genres.map((g) => g.genre.name),
})

const currentYear = new Date().getFullYear()

const releasedMovieWhere = {
    year: {
        lte: currentYear,
    },
} as const

type SearchMovieRow = {
    id: number
    score: number
    total: bigint
}

export const list = async (c: Context<AppEnv>) => {
    const { query } = c.get("validated") as {
        query: {
            q?: string
            genre?: string
            year?: number
            providerType?: "PREHRAJTO"
            limit?: number
            offset?: number
            sortBy?: "year" | "title_en" | "id"
            sortOrder?: "asc" | "desc"
        }
    }

    const where = {
        ...releasedMovieWhere,
        ...(query.q
            ? {
                  OR: [
                      {
                          title_en: {
                              contains: query.q,
                              mode: "insensitive" as const,
                          },
                      },
                      {
                          title_cz: {
                              contains: query.q,
                              mode: "insensitive" as const,
                          },
                      },
                  ],
              }
            : {}),
        ...(query.genre
            ? {
                  genres: {
                      some: {
                          genre: {
                              name: query.genre,
                          },
                      },
                  },
              }
            : {}),
        ...(typeof query.year === "number" ? { year: query.year } : {}),
        ...(query.providerType ? { providerType: query.providerType } : {}),
    }

    const limit = query.limit ?? 24
    const offset = query.offset ?? 0

    const [movies, total] = await Promise.all([
        prisma.movie.findMany({
            where,
            orderBy: {
                [query.sortBy ?? "id"]: query.sortOrder ?? "desc",
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
            items: movies.map(serializeMovie),
            total,
            limit,
            offset,
            hasMore: offset + movies.length < total,
        },
    })
}

export const search = async (c: Context<AppEnv>) => {
    const { query } = c.get("validated") as {
        query: {
            q: string
            genre?: string
            year?: number
            providerType?: "PREHRAJTO"
            limit?: number
            offset?: number
        }
    }

    const q = query.q.trim()
    const limit = Math.min(query.limit ?? 24, 50)
    const offset = query.offset ?? 0

    if (!q) {
        return c.json({
            success: true,
            data: {
                items: [],
                total: 0,
                limit,
                offset,
                hasMore: false,
            },
        })
    }

    const rows = await prisma.$queryRaw<SearchMovieRow[]>`
        WITH input AS (
            SELECT search_normalize(${q}) AS q
        ),
        ranked AS (
            SELECT
                m.id,
                GREATEST(
                    similarity(search_normalize(m.title_en), input.q),
                    similarity(search_normalize(m.title_cz), input.q),
                    word_similarity(input.q, search_normalize(m.title_en)),
                    word_similarity(input.q, search_normalize(m.title_cz))
                ) AS score,
                CASE
                    WHEN search_normalize(m.title_en) = input.q THEN 100
                    WHEN search_normalize(m.title_cz) = input.q THEN 100
                    WHEN search_normalize(m.title_en) LIKE input.q || '%' THEN 80
                    WHEN search_normalize(m.title_cz) LIKE input.q || '%' THEN 80
                    WHEN search_normalize(m.title_en) LIKE '%' || input.q || '%' THEN 60
                    WHEN search_normalize(m.title_cz) LIKE '%' || input.q || '%' THEN 60
                    ELSE 0
                END AS exact_boost
            FROM movie m
            CROSS JOIN input
            WHERE
                m."isAdult" = false
                AND m."providerId" IS NOT NULL
                AND m.year IS NOT NULL
                AND (${query.year ?? null}::int IS NULL OR m.year = ${query.year ?? null}::int)
                AND (${query.providerType ?? null}::"ProviderType" IS NULL OR m."providerType" = ${query.providerType ?? null}::"ProviderType")
                AND (
                    ${query.genre ?? null}::text IS NULL
                    OR EXISTS (
                        SELECT 1
                        FROM movie_genre mg
                        JOIN genre g ON g.id = mg."genreId"
                        WHERE mg."movieId" = m.id
                        AND g.name = ${query.genre ?? null}::text
                    )
                )
                AND (
                    search_normalize(m.title_en) % input.q
                    OR search_normalize(m.title_cz) % input.q
                    OR search_normalize(m.title_en) LIKE '%' || input.q || '%'
                    OR search_normalize(m.title_cz) LIKE '%' || input.q || '%'
                    OR word_similarity(input.q, search_normalize(m.title_en)) > 0.35
                    OR word_similarity(input.q, search_normalize(m.title_cz)) > 0.35
                )
        )
        SELECT
            id,
            score,
            COUNT(*) OVER() AS total
        FROM ranked
        ORDER BY
            exact_boost DESC,
            score DESC,
            id DESC
        LIMIT ${limit}
        OFFSET ${offset};
    `

    const ids = rows.map((row) => row.id)
    const total = Number(rows[0]?.total ?? 0)

    if (ids.length === 0) {
        return c.json({
            success: true,
            data: {
                items: [],
                total: 0,
                limit,
                offset,
                hasMore: false,
            },
        })
    }

    const movies = await prisma.movie.findMany({
        where: {
            id: {
                in: ids,
            },
        },
        select: movieSelect,
    })

    const movieById = new Map(movies.map((movie) => [movie.id, movie]))

    const items = ids
        .map((id) => movieById.get(id))
        .filter((movie): movie is NonNullable<typeof movie> => Boolean(movie))
        .map(serializeMovie)

    return c.json({
        success: true,
        data: {
            items,
            total,
            limit,
            offset,
            hasMore: offset + items.length < total,
        },
    })
}

export const featured = async (c: Context<AppEnv>) => {
    const movies = await prisma.movie.findMany({
        where: releasedMovieWhere,
        orderBy: [{ year: "desc" }, { id: "desc" }],
        take: 10,
        select: movieSelect,
    })

    return c.json({
        success: true,
        data: {
            hero: movies[0] ? serializeMovie(movies[0]) : null,
            items: movies.map(serializeMovie),
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

    const genreCandidates = await prisma.genre.findMany({
        include: {
            _count: {
                select: { movies: true },
            },
        },
        orderBy: {
            movies: {
                _count: "desc",
            },
        },
        take: 8,
    })

    const [featuredMovies, rowGroups] = await Promise.all([
        prisma.movie.findMany({
            where: releasedMovieWhere,
            orderBy: [{ year: "desc" }, { id: "desc" }],
            take: featuredTake,
            select: movieSelect,
        }),
        Promise.all(
            genreCandidates.map(async (genre) => ({
                genre: genre.name,
                items: await prisma.movie.findMany({
                    where: {
                        ...releasedMovieWhere,
                        genres: {
                            some: {
                                genre: {
                                    name: genre.name,
                                },
                            },
                        },
                    },
                    orderBy: [{ year: "desc" }, { id: "desc" }],
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
            title: genre,
            items: items.map(serializeMovie),
        }))

    return c.json({
        success: true,
        data: {
            hero: featuredMovies[0] ? serializeMovie(featuredMovies[0]) : null,
            trending: featuredMovies.map(serializeMovie),
            rows,
        },
    })
}

export const listGenres = async (_c: Context<AppEnv>) => {
    const genres = await prisma.genre.findMany({
        include: {
            _count: {
                select: { movies: true },
            },
        },
    })

    const data = genres
        .map((genre) => ({
            name: genre.name,
            count: genre._count.movies,
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
        data: serializeMovie(movie),
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
        select: { providerId: true, title_en: true, title_cz: true },
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

    const source = await parsePrehrajtoVideoSource(movie.providerId ?? "")

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
            title: source.title ?? movie.title_en ?? movie.title_cz ?? "Unknown",
            duration: source.duration,
        },
    })
}
