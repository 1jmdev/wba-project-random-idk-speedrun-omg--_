import type { ApiMovie, ApiProfile } from "@/lib/api"

const PLACEHOLDER_COLORS = [
    "#221f1f",
    "#1a1a2e",
    "#16213e",
    "#0f3460",
    "#1b1b2f",
    "#2c003e",
    "#3a0ca3",
    "#240046",
    "#10002b",
    "#1d3557",
]

const pickColor = (id: number) =>
    PLACEHOLDER_COLORS[id % PLACEHOLDER_COLORS.length]

const svgDataUri = (svg: string) =>
    `data:image/svg+xml,${encodeURIComponent(svg)}`

const posterImage = (id: number) => {
    const bg = pickColor(id)
    return svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">` +
            `<rect width="300" height="450" fill="${bg}"/>` +
            `<rect x="0" y="350" width="300" height="100" fill="rgba(0,0,0,0.5)"/>` +
            `<text x="150" y="210" text-anchor="middle" fill="rgba(255,255,255,0.08)" font-size="120" font-family="sans-serif" font-weight="bold">N</text>` +
            `<rect x="30" y="380" width="180" height="10" rx="3" fill="rgba(255,255,255,0.15)"/>` +
            `<rect x="30" y="400" width="120" height="8" rx="3" fill="rgba(255,255,255,0.08)"/>` +
            `</svg>`
    )
}

const backdropImage = (id: number) => {
    const bg = pickColor(id)
    return svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">` +
            `<rect width="1280" height="720" fill="${bg}"/>` +
            `<text x="640" y="380" text-anchor="middle" fill="rgba(255,255,255,0.06)" font-size="280" font-family="sans-serif" font-weight="bold">N</text>` +
            `<rect x="0" y="520" width="1280" height="200" fill="rgba(0,0,0,0.4)"/>` +
            `<rect x="60" y="580" width="400" height="16" rx="4" fill="rgba(255,255,255,0.12)"/>` +
            `<rect x="60" y="610" width="260" height="12" rx="3" fill="rgba(255,255,255,0.07)"/>` +
            `</svg>`
    )
}

const AVATAR_COLORS = [
    "#e50914",
    "#0071eb",
    "#1ce783",
    "#e87c03",
    "#b9090b",
    "#6d28d9",
    "#0891b2",
    "#be123c",
]

const avatarImage = (id: number) => {
    const bg = AVATAR_COLORS[id % AVATAR_COLORS.length]
    return svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">` +
            `<rect width="128" height="128" rx="4" fill="${bg}"/>` +
            `<circle cx="64" cy="45" r="22" fill="rgba(255,255,255,0.25)"/>` +
            `<ellipse cx="64" cy="110" rx="35" ry="30" fill="rgba(255,255,255,0.2)"/>` +
            `</svg>`
    )
}

export const episodeImage = (movieId: number, episodeIndex: number) => {
    const bg = pickColor(
        (movieId * 7 + episodeIndex * 3) % PLACEHOLDER_COLORS.length
    )
    return svgDataUri(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225">` +
            `<rect width="400" height="225" fill="${bg}"/>` +
            `<text x="200" y="125" text-anchor="middle" fill="rgba(255,255,255,0.06)" font-size="100" font-family="sans-serif" font-weight="bold">N</text>` +
            `<circle cx="200" cy="112" r="24" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>` +
            `<polygon points="192,98 216,112 192,126" fill="rgba(255,255,255,0.3)"/>` +
            `</svg>`
    )
}

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
        description: `${movie.name} is available via ${movie.providerType}. Released in ${movie.year}, this title runs ${formatDuration(movie.length)} and blends ${genres.join(", ")} influences into a polished Neflix-style presentation.`,
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
