import { useEffect, useMemo, useState } from "react"
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

    useEffect(() => {
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
                    return
                }

                const response = await apiClient.listMovies({
                    take: 100,
                    sortBy: "year",
                    sortOrder: "desc",
                })
                const mappedMovies = response.map(mapMovie)
                setAllMovies(mappedMovies)
                setHeroMovie(mappedMovies[0] ?? null)
                setRows([])
            } finally {
                setLoading(false)
            }
        }

        void load()
    }, [filter])

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

    const continueWatching = useMemo(
        () =>
            allMovies.slice(0, 5).map((movie, index) => ({
                movie,
                progress: 20 + index * 15,
            })),
        [allMovies]
    )

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
            </div>

            <Footer />
        </div>
    )
}
