import { useEffect, useMemo, useRef, useState } from "react"
import ContentRow from "@/components/ContentRow"
import ContinueWatchingRow from "@/components/ContinueWatchingRow"
import HeroBanner from "@/components/HeroBanner"
import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"
import HeroSkeleton from "@/components/skeletons/HeroSkeleton"
import RowSkeleton from "@/components/skeletons/RowSkeleton"
import TopTenSkeleton from "@/components/skeletons/TopTenSkeleton"
import TopTenRow from "@/components/TopTenRow"
import { apiClient } from "@/lib/api"
import {
    type Category,
    type Movie,
    mapMovie,
    type Profile,
} from "@/lib/neflix"

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

            {/* Hero section */}
            {loading ? (
                <HeroSkeleton />
            ) : (
                heroMovie && <HeroBanner movie={heroMovie} />
            )}

            <div className="relative z-10 -mt-20 md:-mt-32">
                {loading ? (
                    <>
                        {/* Skeleton rows while loading */}
                        {!filter && <RowSkeleton titleWidth="w-44" />}
                        <RowSkeleton titleWidth="w-32" />
                        <RowSkeleton titleWidth="w-56" />
                        {!filter && <TopTenSkeleton />}
                        <RowSkeleton titleWidth="w-40" />
                        <RowSkeleton titleWidth="w-48" />
                    </>
                ) : (
                    <>
                        {!filter && (
                            <ContinueWatchingRow items={continueWatching} />
                        )}

                        {filteredCategories.slice(0, 2).map((category) => (
                            <ContentRow
                                key={category.title}
                                profileId={profile.id}
                                title={category.title}
                                movies={category.movies}
                            />
                        ))}

                        {!filter && (
                            <TopTenRow movies={allMovies.slice(0, 10)} />
                        )}

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
                                <div className="flex items-center justify-between text-sm text-white/50">
                                    <p>
                                        Page {currentPage} of {totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOffset((current) =>
                                                    Math.max(
                                                        0,
                                                        current - PAGE_SIZE
                                                    )
                                                )
                                            }
                                            disabled={
                                                !hasPreviousPage || loading
                                            }
                                            className="border border-white/20 px-5 py-1.5 text-sm text-white/70 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOffset(
                                                    (current) =>
                                                        current + PAGE_SIZE
                                                )
                                            }
                                            disabled={!hasNextPage || loading}
                                            className="border border-white/20 px-5 py-1.5 text-sm text-white/70 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Footer />
        </div>
    )
}
