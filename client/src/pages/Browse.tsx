import { useEffect, useMemo, useRef, useState } from "react"
import ContentRow from "@/components/ContentRow"
import ContinueWatchingRow from "@/components/ContinueWatchingRow"
import HeroBanner from "@/components/HeroBanner"
import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"
import TopTenRow from "@/components/TopTenRow"
import { apiClient } from "@/lib/api"
import {
    type Category,
    type Movie,
    mapMovie,
    type Profile,
} from "@/lib/netflix"

interface BrowseProps {
    profile: Profile
    onSwitchProfile: () => void
    onLogout: () => Promise<void>
    filter?: "movie" | "series" | "new"
}

const PAGE_SIZE = 24

export default function Browse({
    profile,
    onSwitchProfile,
    onLogout,
    filter,
}: BrowseProps) {
    const [heroMovie, setHeroMovie] = useState<Movie | null>(null)
    const [rows, setRows] = useState<Category[]>([])
    const [allMovies, setAllMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)
    const [offset, setOffset] = useState(0)
    const [total, setTotal] = useState(0)
    const previousFilterRef = useRef(filter)

    useEffect(() => {
        if (previousFilterRef.current !== filter) {
            previousFilterRef.current = filter
            setOffset(0)
            return
        }

        const load = async () => {
            setLoading(true)

            try {
                if (!filter) {
                    const response = await apiClient.browseHome()
                    setHeroMovie(response.hero ? mapMovie(response.hero) : null)
                    setRows(
                        response.rows.map((row) => ({
                            title: row.title,
                            movies: row.items.map(mapMovie),
                        }))
                    )
                    setAllMovies(response.trending.map(mapMovie))
                    setTotal(response.trending.length)
                    return
                }

                const response = await apiClient.listMovies({
                    limit: PAGE_SIZE,
                    offset,
                    sortBy: "year",
                    sortOrder: "desc",
                })
                const mappedMovies = response.items.map(mapMovie)
                setAllMovies(mappedMovies)
                setHeroMovie(mappedMovies[0] ?? null)
                setTotal(response.total)
                setRows([])
            } finally {
                setLoading(false)
            }
        }

        void load()
    }, [filter, offset])

    const filteredCategories = useMemo(() => {
        if (!filter) {
            return rows
        }

        if (filter === "new") {
            const latestYear = Math.max(
                ...allMovies.map((movie) => movie.year),
                0
            )

            return [
                {
                    title: latestYear ? `New in ${latestYear}` : "New Releases",
                    movies: allMovies.filter(
                        (movie) => movie.year === latestYear
                    ),
                },
            ].filter((category) => category.movies.length > 0)
        }

        return [
            {
                title: filter === "movie" ? "Movies" : "Series",
                movies: allMovies.filter((movie) => movie.type === filter),
            },
        ].filter((category) => category.movies.length > 0)
    }, [allMovies, filter, rows])

    const continueWatching = useMemo(() => allMovies.slice(0, 5), [allMovies])

    const currentPage = Math.floor(offset / PAGE_SIZE) + 1
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const hasPreviousPage = offset > 0
    const hasNextPage = offset + PAGE_SIZE < total

    return (
        <div className="min-h-screen bg-background">
            <Navbar
                profile={profile}
                onSwitchProfile={onSwitchProfile}
                onLogout={onLogout}
            />

            {heroMovie && <HeroBanner movie={heroMovie} />}

            <div className="relative z-10 -mt-20 md:-mt-32">
                {loading && (
                    <div className="px-4 py-12 text-sm text-white/50 md:px-12">
                        Loading catalog...
                    </div>
                )}

                {!filter && <ContinueWatchingRow items={continueWatching} />}

                {filteredCategories.slice(0, 2).map((category) => (
                    <ContentRow
                        key={category.title}
                        profileId={profile.id}
                        title={category.title}
                        movies={category.movies}
                    />
                ))}

                {!filter && <TopTenRow movies={allMovies.slice(0, 10)} />}

                {filteredCategories.slice(2).map((category) => (
                    <ContentRow
                        key={category.title}
                        profileId={profile.id}
                        title={category.title}
                        movies={category.movies}
                    />
                ))}

                {filter && (
                    <div className="px-4 py-10 md:px-12">
                        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm">
                                Page {currentPage} of {totalPages}. Showing{" "}
                                {allMovies.length} titles from offset {offset}.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOffset((current) =>
                                            Math.max(0, current - PAGE_SIZE)
                                        )
                                    }
                                    disabled={!hasPreviousPage || loading}
                                    className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:border-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOffset(
                                            (current) => current + PAGE_SIZE
                                        )
                                    }
                                    disabled={!hasNextPage || loading}
                                    className="rounded-full border border-white/20 px-4 py-2 text-sm transition hover:border-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}
