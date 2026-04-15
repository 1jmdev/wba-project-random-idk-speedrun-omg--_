import { useEffect, useState } from "react"
import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"
import CardGridSkeleton from "@/components/skeletons/CardGridSkeleton"
import TitleCard from "@/components/TitleCard"
import { apiClient } from "@/lib/api"
import { getMyListIds, type Movie, mapMovie, type Profile } from "@/lib/neflix"

interface MyListProps {
    profile: Profile
    onSwitchProfile: () => void
    onLogout: () => Promise<void>
}

export default function MyList({
    profile,
    onSwitchProfile,
    onLogout,
}: MyListProps) {
    const [movies, setMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)

            try {
                const ids = getMyListIds(profile.id)
                if (ids.length === 0) {
                    setMovies([])
                    return
                }

                setMovies(
                    (
                        await Promise.all(
                            ids.map(async (movieId) => {
                                try {
                                    return mapMovie(
                                        await apiClient.getMovie(movieId)
                                    )
                                } catch {
                                    return null
                                }
                            })
                        )
                    )
                        .filter((movie): movie is Movie => movie !== null)
                        .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
                )
            } finally {
                setLoading(false)
            }
        }

        void load()
    }, [profile.id])

    return (
        <div className="min-h-screen bg-background">
            <Navbar
                profile={profile}
                onSwitchProfile={onSwitchProfile}
                onLogout={onLogout}
            />

            <div className="px-4 pb-8 pt-24 md:px-12">
                <h1 className="mb-8 text-2xl font-semibold text-white md:text-3xl">
                    My List
                </h1>

                {loading ? (
                    <CardGridSkeleton count={12} />
                ) : movies.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {movies.map((movie) => (
                            <div key={movie.id}>
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
                            Your list is empty.
                        </p>
                        <p className="text-sm text-white/40">
                            Add titles from the detail page or card hover
                            actions.
                        </p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}
