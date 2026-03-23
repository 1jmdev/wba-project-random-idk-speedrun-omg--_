const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080"

export class ApiError extends Error {
    status: number
    data: unknown

    constructor(message: string, status: number, data: unknown) {
        super(message)
        this.status = status
        this.data = data
    }
}

type RequestOptions = RequestInit & {
    body?: unknown
}

async function request<T>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        credentials: "include",
        headers: {
            ...(options.body !== undefined
                ? { "Content-Type": "application/json" }
                : {}),
            ...(options.headers ?? {}),
        },
        body:
            options.body === undefined
                ? undefined
                : JSON.stringify(options.body),
    })

    const text = await response.text()
    const data = text ? (JSON.parse(text) as unknown) : null

    if (!response.ok) {
        const message =
            typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof data.message === "string"
                ? data.message
                : `Request failed with status ${response.status}`

        throw new ApiError(message, response.status, data)
    }

    return data as T
}

export interface ApiFamily {
    id: number
    email: string
    name: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface ApiProfile {
    id: number
    email: string
    name: string
    profileName: string | null
    avatarUrl: string | null
    isActive: boolean
    familyId: number
}

export interface ApiMovie {
    id: number
    name: string
    year: number
    length: number
    genres: string[]
    providerType: string
    providerId: string
    createdAt: string
    updatedAt: string
}

interface ApiEnvelope<T> {
    success: boolean
    data: T
    message?: string
}

interface MeResponse {
    family: ApiFamily
    profiles: ApiProfile[]
    selectedProfile: ApiProfile | null
}

interface BrowseHomeResponse {
    hero: ApiMovie | null
    trending: ApiMovie[]
    rows: {
        genre: string
        title: string
        items: ApiMovie[]
    }[]
}

export const apiClient = {
    getMe: async () => {
        const response =
            await request<ApiEnvelope<MeResponse>>("/api/families/me")
        return response.data
    },
    login: async (payload: { email: string; password: string }) => {
        const response = await request<
            ApiEnvelope<{
                family: ApiFamily
                profiles: ApiProfile[]
            }>
        >("/api/families/login", {
            method: "POST",
            body: payload,
        })

        return response.data
    },
    register: async (payload: {
        email: string
        password: string
        name: string
    }) => {
        const response = await request<
            ApiEnvelope<{
                family: ApiFamily
            }>
        >("/api/families/register", {
            method: "POST",
            body: payload,
        })

        return response.data
    },
    logout: async () => {
        await request("/api/families/logout", {
            method: "POST",
        })
    },
    createProfile: async (payload: {
        email: string
        name: string
        profileName?: string
        avatarUrl?: string
    }) => {
        const response = await request<ApiEnvelope<ApiProfile>>(
            "/api/profiles",
            {
                method: "POST",
                body: payload,
            }
        )

        return response.data
    },
    selectProfile: async (profileId: number) => {
        const response = await request<ApiEnvelope<ApiProfile>>(
            `/api/profiles/${profileId}/select`,
            {
                method: "POST",
            }
        )

        return response.data
    },
    clearSelectedProfile: async () => {
        await request("/api/profiles/clear-selection", {
            method: "POST",
        })
    },
    listMovies: async (
        params?: Record<string, string | number | undefined>
    ) => {
        const searchParams = new URLSearchParams()

        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined && value !== "") {
                    searchParams.set(key, String(value))
                }
            }
        }

        const query = searchParams.toString()
        const response = await request<ApiEnvelope<ApiMovie[]>>(
            `/api/movies${query ? `?${query}` : ""}`
        )

        return response.data
    },
    browseHome: async () => {
        const response = await request<ApiEnvelope<BrowseHomeResponse>>(
            "/api/movies/browse/home"
        )
        return response.data
    },
    getMovie: async (movieId: number) => {
        const response = await request<ApiEnvelope<ApiMovie>>(
            `/api/movies/${movieId}`
        )
        return response.data
    },
}
