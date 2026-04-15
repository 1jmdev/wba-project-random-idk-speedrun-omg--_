import { Check, Play, Plus, ThumbsUp, Volume2, VolumeX, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import ContentRow from "@/components/ContentRow"
import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"
import RowSkeleton from "@/components/skeletons/RowSkeleton"
import TitleDetailSkeleton from "@/components/skeletons/TitleDetailSkeleton"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import {
    episodeImage,
    isInMyList,
    type Movie,
    mapMovie,
    type Profile,
    toggleMyList,
} from "@/lib/neflix"

interface TitleDetailProps {
    profile: Profile
    onSwitchProfile: () => void
    onLogout: () => Promise<void>
}

export default function TitleDetail({
    profile,
    onSwitchProfile,
    onLogout,
}: TitleDetailProps) {
    const { id } = useParams()
    const navigate = useNavigate()
    const [muted, setMuted] = useState(true)
    const [movie, setMovie] = useState<Movie | null>(null)
    const [relatedMovies, setRelatedMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)
    const [inMyList, setInMyList] = useState(false)
    const [liked, setLiked] = useState(false)

    useEffect(() => {
        const movieId = Number(id)
        if (!movieId) {
            return
        }

        const load = async () => {
            setLoading(true)

            try {
                const item = mapMovie(await apiClient.getMovie(movieId))
                setMovie(item)
                setInMyList(isInMyList(profile.id, movieId))

                const firstGenre = item.genres[0]
                const genreQuery = firstGenre
                    ?.toUpperCase()
                    .replaceAll(" ", "_")
                const related = await apiClient.listMovies({
                    genre: genreQuery,
                    limit: 12,
                    sortBy: "year",
                    sortOrder: "desc",
                })

                setRelatedMovies(
                    related.items
                        .map(mapMovie)
                        .filter((candidate) => candidate.id !== movieId)
                        .slice(0, 12)
                )
            } finally {
                setLoading(false)
            }
        }

        void load()
    }, [id, profile.id])

    const episodes = useMemo(() => {
        if (!movie || movie.type !== "series") return []
        const count = Math.min(movie.episodes ?? 10, 10)
        return Array.from({ length: count }, (_, index) => ({
            id: index + 1,
            title: `Episode ${index + 1}`,
            description: `${movie.title} continues with unexpected twists and revelations that change everything the characters thought they knew.`,
            duration: `${40 + ((movie.id * 7 + index * 13) % 25)}m`,
            image: episodeImage(movie.id, index),
        }))
    }, [movie])

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar
                    profile={profile}
                    onSwitchProfile={onSwitchProfile}
                    onLogout={onLogout}
                />
                <TitleDetailSkeleton />
                <RowSkeleton titleWidth="w-40" />
                <Footer />
            </div>
        )
    }

    if (!movie) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-lg text-white">Title not found</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar
                profile={profile}
                onSwitchProfile={onSwitchProfile}
                onLogout={onLogout}
            />

            <div className="relative h-[70vh] w-full md:h-[80vh]">
                <img
                    src={movie.backdrop}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                />
                <div className="hero-gradient absolute inset-0" />
                <div className="hero-gradient-left absolute inset-0" />

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="absolute right-4 top-20 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 transition-colors hover:bg-black/80 md:right-8"
                >
                    <X className="h-5 w-5 text-white" />
                </button>

                <button
                    type="button"
                    onClick={() => setMuted(!muted)}
                    className="absolute bottom-[15%] right-16 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 transition-colors hover:border-white"
                >
                    {muted ? (
                        <VolumeX className="h-4 w-4 text-white" />
                    ) : (
                        <Volume2 className="h-4 w-4 text-white" />
                    )}
                </button>

                <div className="absolute bottom-[15%] right-0 z-20 border-l-2 border-white/40 bg-black/60 px-3 py-1 text-sm text-white/80">
                    {movie.rating}
                </div>

                <div className="absolute bottom-[10%] left-4 z-10 max-w-2xl md:left-12">
                    <h1 className="mb-4 text-4xl font-bold text-white drop-shadow-lg md:text-6xl">
                        {movie.title}
                    </h1>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="default"
                            size="xl"
                            className="gap-2"
                            onClick={() => navigate(`/watch/${movie.id}`)}
                        >
                            <Play className="h-6 w-6 fill-black" />
                            Play
                        </Button>
                    </div>
                </div>
            </div>

            <div className="relative z-10 -mt-4 px-4 pb-8 md:px-12">
                <div className="max-w-5xl">
                    <div className="flex flex-col gap-6 md:flex-row md:gap-10">
                        <div className="flex-1">
                            <div className="mb-3 flex items-center gap-3 text-sm">
                                <span className="font-semibold text-[#46d369]">
                                    {movie.match}% Match
                                </span>
                                <span className="text-white/70">
                                    {movie.year}
                                </span>
                                <span className="border border-white/40 px-1.5 py-0.5 text-[11px] leading-none text-white/70">
                                    {movie.rating}
                                </span>
                                <span className="text-white/70">
                                    {movie.duration}
                                </span>
                                <span className="border border-white/40 px-1 py-0.5 text-[10px] leading-none text-white/60">
                                    HD
                                </span>
                            </div>

                            <div className="mb-5 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setInMyList(
                                            toggleMyList(profile.id, movie.id)
                                        )
                                    }
                                    className="flex flex-col items-center gap-1"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/40 transition-colors hover:border-white">
                                        {inMyList ? (
                                            <Check className="h-5 w-5 text-white" />
                                        ) : (
                                            <Plus className="h-5 w-5 text-white" />
                                        )}
                                    </div>
                                    <span className="text-[11px] text-white/60">
                                        My List
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLiked(!liked)}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${liked ? "border-white bg-white/10" : "border-white/40 hover:border-white"}`}
                                    >
                                        <ThumbsUp className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-[11px] text-white/60">
                                        Rate
                                    </span>
                                </button>
                            </div>

                            <p className="mb-4 text-sm leading-relaxed text-white/90">
                                {movie.description}
                            </p>
                        </div>

                        <div className="w-full shrink-0 text-sm md:w-65">
                            <p className="mb-2 text-white/50">
                                <span className="text-white/30">Cast: </span>
                                <span className="text-white/70">
                                    {movie.cast.join(", ")}
                                </span>
                            </p>
                            <p className="mb-2 text-white/50">
                                <span className="text-white/30">Genres: </span>
                                <span className="text-white/70">
                                    {movie.genres.join(", ")}
                                </span>
                            </p>
                            {movie.type === "series" && (
                                <p className="mb-2 text-white/50">
                                    <span className="text-white/30">
                                        Seasons:{" "}
                                    </span>
                                    <span className="text-white/70">
                                        {movie.seasons}
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>

                    {movie.type === "series" && (
                        <div className="mt-10">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-white">
                                    Episodes
                                </h2>
                                <span className="text-sm text-white/60">
                                    Season 1
                                </span>
                            </div>

                            <div className="space-y-3">
                                {episodes.map((episode) => (
                                    <div
                                        key={episode.id}
                                        className="group flex cursor-pointer gap-4 rounded-sm p-3 transition-colors hover:bg-white/5"
                                    >
                                        <div className="flex w-8 shrink-0 items-center justify-center text-lg text-white/50">
                                            {episode.id}
                                        </div>
                                        <div className="relative aspect-video w-32.5 shrink-0 overflow-hidden rounded-sm">
                                            <img
                                                src={episode.image}
                                                alt={episode.title}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white">
                                                    <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-center justify-between">
                                                <h3 className="text-sm font-medium text-white">
                                                    {episode.title}
                                                </h3>
                                                <span className="text-xs text-white/50">
                                                    {episode.duration}
                                                </span>
                                            </div>
                                            <p className="line-clamp-2 text-xs leading-relaxed text-white/50">
                                                {episode.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <ContentRow
                    profileId={profile.id}
                    title="More Like This"
                    movies={relatedMovies}
                />
            </div>

            <Footer />
        </div>
    )
}
