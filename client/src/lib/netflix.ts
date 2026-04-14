import type { ApiMovie, ApiProfile } from "@/lib/api"

const posterImage = (id: number) =>
    `https://picsum.photos/seed/netflix-poster-${id}/300/450`
const backdropImage = (id: number) =>
    `https://picsum.photos/seed/netflix-backdrop-${id}/1280/720`
const avatarImage = (id: number) =>
    `https://picsum.photos/seed/netflix-avatar-${id}/128/128`

const castPool = [
    "Emma Stone",
    "Pedro Pascal",
    "Zendaya",
    "Florence Pugh",
    "Oscar Isaac",
    "Anya Taylor-Joy",
    "Daniel Kaluuya",
    "Margot Robbie",
    "John Boyega",
    "Lupita Nyong'o",
]

export interface Profile {
    id: number
    name: string
    avatar: string
    isKids: boolean
}

export interface Movie {
    id: number
    title: string
    description: string
    image: string
    backdrop: string
    year: number
    rating: string
    duration: string
    match: number
    genres: string[]
    cast: string[]
    type: "movie" | "series"
    seasons?: number
    episodes?: number
    runtimeMinutes: number
}

export interface Category {
    title: string
    movies: Movie[]
}

const genreLabel = (genre: string) =>
    genre
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())

const formatDuration = (minutes: number) => {
    if (minutes < 60) {
        return `${minutes}m`
    }

    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60

    if (rest === 0) {
        return `${hours}h`
    }

    return `${hours}h ${rest}m`
}

const inferType = (movie: ApiMovie): "movie" | "series" =>
    movie.length <= 55 ? "series" : "movie"

const inferRating = (genres: string[]) => {
    if (genres.includes("ADULT") || genres.includes("HORROR")) {
        return "R"
    }

    if (genres.includes("FAMILY") || genres.includes("ANIMATION")) {
        return "PG"
    }

    return "PG-13"
}

const buildCast = (movieId: number) =>
    Array.from(
        { length: 3 },
        (_, index) => castPool[(movieId + index) % castPool.length]
    )

export const mapProfile = (profile: ApiProfile): Profile => ({
    id: profile.id,
    name: profile.name,
    avatar: avatarImage(profile.id),
    isKids: /kids|child/i.test(profile.name),
})

export const mapMovie = (movie: ApiMovie): Movie => {
    const type = inferType(movie)
    const seasons =
        type === "series"
            ? Math.max(1, Math.ceil(movie.length / 10))
            : undefined
    const episodes = seasons ? seasons * 8 : undefined
    const genres = movie.genres.map(genreLabel)

    return {
        id: movie.id,
        title: movie.name,
        description: `${movie.name} is available via ${movie.providerType}. Released in ${movie.year}, this title runs ${formatDuration(movie.length)} and blends ${genres.join(", ")} influences into a polished Netflix-style presentation.`,
        image: posterImage(movie.id),
        backdrop: backdropImage(movie.id),
        year: movie.year,
        rating: inferRating(movie.genres),
        duration:
            type === "series" && seasons
                ? `${seasons} Season${seasons > 1 ? "s" : ""}`
                : formatDuration(movie.length),
        match: 82 + (movie.id % 17),
        genres,
        cast: buildCast(movie.id),
        type,
        seasons,
        episodes,
        runtimeMinutes: movie.length,
    }
}

export const storageKey = (profileId: number) =>
    `netflix-clone-my-list:${profileId}`

export const getMyListIds = (profileId: number) => {
    if (typeof window === "undefined") {
        return [] as number[]
    }

    const raw = window.localStorage.getItem(storageKey(profileId))
    if (!raw) {
        return [] as number[]
    }

    try {
        const parsed = JSON.parse(raw) as unknown
        if (Array.isArray(parsed)) {
            return parsed.filter(
                (value): value is number => typeof value === "number"
            )
        }
    } catch {}

    return [] as number[]
}

export const isInMyList = (profileId: number, movieId: number) =>
    getMyListIds(profileId).includes(movieId)

export const toggleMyList = (profileId: number, movieId: number) => {
    const ids = getMyListIds(profileId)
    const nextIds = ids.includes(movieId)
        ? ids.filter((id) => id !== movieId)
        : [...ids, movieId]

    window.localStorage.setItem(storageKey(profileId), JSON.stringify(nextIds))

    return nextIds.includes(movieId)
}
