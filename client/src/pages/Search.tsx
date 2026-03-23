import { useEffect, useState } from "react"
import { useSearchParams } from "react-router"
import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"
import TitleCard from "@/components/TitleCard"
import { apiClient } from "@/lib/api"
import { type Movie, mapMovie, type Profile } from "@/lib/netflix"

interface SearchProps {
    profile: Profile
    onSwitchProfile: () => void
    onLogout: () => Promise<void>
}

export default function Search({
    profile,
    onSwitchProfile,
    onLogout,
}: SearchProps) {
    const [searchParams] = useSearchParams()
    const query = searchParams.get("q") ?? ""
    const [results, setResults] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)

            try {
                const movies = await apiClient.listMovies(
                    query.trim()
                        ? {
                              q: query.trim(),
                              take: 60,
                              sortBy: "year",
                              sortOrder: "desc",
                          }
                        : { take: 24, sortBy: "createdAt", sortOrder: "desc" }
                )

                setResults(movies.map(mapMovie))
            } finally {
                setLoading(false)
            }
        }

        void load()
    }, [query])

    return (
        <div className="min-h-screen bg-background">
            <Navbar
                profile={profile}
                onSwitchProfile={onSwitchProfile}
                onLogout={onLogout}
            />

            <div className="px-4 pb-8 pt-24 md:px-12">
                {query && (
                    <p className="mb-6 text-sm text-white/50">
                        {results.length > 0
                            ? `Showing results for "${query}"`
                            : `No results found for "${query}"`}
                    </p>
                )}

                {loading && (
                    <p className="mb-6 text-sm text-white/50">
                        Searching catalog...
                    </p>
                )}

                {results.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {results.map((movie) => (
                            <div key={movie.id} className="relative">
                                <TitleCard
                                    movie={movie}
                                    profileId={profile.id}
                                    grid
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="mb-2 text-lg text-white/70">
                            No titles match your search.
                        </p>
                        <p className="text-sm text-white/40">
                            Try different keywords or browse categories.
                        </p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}
