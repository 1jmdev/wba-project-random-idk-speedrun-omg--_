import { useMemo } from "react"
import { useSearchParams } from "react-router"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import TitleCard from "@/components/TitleCard"
import { movies } from "@/data/mock"
import type { Profile } from "@/data/mock"

interface SearchProps {
    profile: Profile
    onSwitchProfile: () => void
}

export default function Search({ profile, onSwitchProfile }: SearchProps) {
    const [searchParams] = useSearchParams()
    const query = searchParams.get("q") ?? ""

    const results = useMemo(() => {
        if (!query.trim()) return movies
        const q = query.toLowerCase()
        return movies.filter(
            (m) =>
                m.title.toLowerCase().includes(q) ||
                m.genres.some((g) => g.toLowerCase().includes(q)) ||
                m.cast.some((c) => c.toLowerCase().includes(q)) ||
                m.description.toLowerCase().includes(q)
        )
    }, [query])

    return (
        <div className="min-h-screen bg-background">
            <Navbar profile={profile} onSwitchProfile={onSwitchProfile} />

            <div className="pt-24 px-4 md:px-12 pb-8">
                {query && (
                    <p className="text-sm text-white/50 mb-6">
                        {results.length > 0
                            ? `Showing results for "${query}"`
                            : `No results found for "${query}"`}
                    </p>
                )}

                {results.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                        {results.map((movie) => (
                            <div key={movie.id} className="relative">
                                <TitleCard movie={movie} grid />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="text-lg text-white/70 mb-2">
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
