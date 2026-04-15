import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router"
import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"
import CardGridSkeleton from "@/components/skeletons/CardGridSkeleton"
import TitleCard from "@/components/TitleCard"
import { apiClient } from "@/lib/api"
import { type Movie, mapMovie, type Profile } from "@/lib/neflix"

interface SearchProps {
    profile: Profile
    onSwitchProfile: () => void
    onLogout: () => Promise<void>
}

const PAGE_SIZE = 24

export default function Search({
    profile,
    onSwitchProfile,
    onLogout,
}: SearchProps) {
    const [searchParams] = useSearchParams()
    const query = searchParams.get("q") ?? ""
    const [results, setResults] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)
    const [offset, setOffset] = useState(0)
    const [total, setTotal] = useState(0)
    const previousQueryRef = useRef(query)

    useEffect(() => {
        if (previousQueryRef.current !== query) {
            previousQueryRef.current = query
            setOffset(0)
            return
        }

        const load = async () => {
            setLoading(true)

            try {
                const response = await apiClient.listMovies(
                    query.trim()
                        ? {
                              q: query.trim(),
                              limit: PAGE_SIZE,
                              offset,
                              sortBy: "year",
                              sortOrder: "desc",
                          }
                        : {
                              limit: PAGE_SIZE,
                              offset,
                              sortBy: "createdAt",
                              sortOrder: "desc",
                          }
                )

                setResults(response.items.map(mapMovie))
                setTotal(response.total)
            } finally {
                setLoading(false)
            }
        }

        void load()
    }, [query, offset])

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

            <div className="px-4 pb-8 pt-24 md:px-12">
                {query && !loading && (
                    <p className="mb-6 text-sm text-white/50">
                        {results.length > 0
                            ? `Showing results for "${query}"`
                            : `No results found for "${query}"`}
                    </p>
                )}

                {loading ? (
                    <div className="pt-4">
                        {/* Search title skeleton */}
                        <div className="mb-6">
                            <div className="h-4 w-56 rounded skeleton-shimmer" />
                        </div>
                        <CardGridSkeleton count={PAGE_SIZE} />
                    </div>
                ) : results.length > 0 ? (
                    <>
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

                        <div className="mt-8 flex items-center justify-between text-sm text-white/50">
                            <p>
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOffset((current) =>
                                            Math.max(0, current - PAGE_SIZE)
                                        )
                                    }
                                    disabled={!hasPreviousPage || loading}
                                    className="border border-white/20 px-5 py-1.5 text-sm text-white/70 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
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
                                    className="border border-white/20 px-5 py-1.5 text-sm text-white/70 transition hover:border-white hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
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
