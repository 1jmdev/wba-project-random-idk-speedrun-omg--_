import { useParams, useNavigate } from "react-router"
import { Play, Plus, ThumbsUp, Volume2, VolumeX, X, Check } from "lucide-react"
import { useState, useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ContentRow from "@/components/ContentRow"
import { Button } from "@/components/ui/button"
import { movies, categories } from "@/data/mock"
import type { Profile } from "@/data/mock"

interface TitleDetailProps {
    profile: Profile
    onSwitchProfile: () => void
}

export default function TitleDetail({
    profile,
    onSwitchProfile,
}: TitleDetailProps) {
    const { id } = useParams()
    const navigate = useNavigate()
    const [muted, setMuted] = useState(true)
    const [inMyList, setInMyList] = useState(false)
    const [liked, setLiked] = useState(false)

    const movie = movies.find((m) => m.id === Number(id))

    const similarMovies = useMemo(() => {
        if (!movie) return []
        return movies
            .filter(
                (m) =>
                    m.id !== movie.id &&
                    m.genres.some((g) => movie.genres.includes(g))
            )
            .slice(0, 12)
    }, [movie])

    // Mock episodes for series
    const episodes = useMemo(() => {
        if (!movie || movie.type !== "series") return []
        return Array.from(
            { length: Math.min(movie.episodes ?? 10, 10) },
            (_, i) => ({
                id: i + 1,
                title: `Episode ${i + 1}`,
                description: `${movie.title} continues with unexpected twists and revelations that change everything the characters thought they knew.`,
                duration: `${40 + Math.floor(Math.random() * 25)}m`,
                image: `https://picsum.photos/seed/ep${movie.id}${i}/400/225`,
            })
        )
    }, [movie])

    if (!movie) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-white text-lg">Title not found</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar profile={profile} onSwitchProfile={onSwitchProfile} />

            {/* Hero / Preview section */}
            <div className="relative w-full h-[70vh] md:h-[80vh]">
                <img
                    src={movie.backdrop}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
                <div className="hero-gradient absolute inset-0" />
                <div className="hero-gradient-left absolute inset-0" />

                {/* Close button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-20 right-4 md:right-8 z-20 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                    <X className="w-5 h-5 text-white" />
                </button>

                {/* Mute button */}
                <button
                    onClick={() => setMuted(!muted)}
                    className="absolute bottom-[15%] right-16 z-20 w-9 h-9 rounded-full border border-white/40 flex items-center justify-center hover:border-white transition-colors"
                >
                    {muted ? (
                        <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                    )}
                </button>

                {/* Rating badge */}
                <div className="absolute right-0 bottom-[15%] z-20 bg-black/60 border-l-2 border-white/40 px-3 py-1 text-sm text-white/80">
                    {movie.rating}
                </div>

                {/* Content */}
                <div className="absolute bottom-[10%] left-4 md:left-12 z-10 max-w-2xl">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                        {movie.title}
                    </h1>

                    <div className="flex items-center gap-3">
                        <Button variant="default" size="xl" className="gap-2">
                            <Play className="w-6 h-6 fill-black" />
                            Play
                        </Button>
                    </div>
                </div>
            </div>

            {/* Details section */}
            <div className="relative z-10 -mt-4 px-4 md:px-12 pb-8">
                <div className="max-w-5xl">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                        {/* Left column */}
                        <div className="flex-1">
                            {/* Metadata */}
                            <div className="flex items-center gap-3 mb-3 text-sm">
                                <span className="text-[#46d369] font-semibold">
                                    {movie.match}% Match
                                </span>
                                <span className="text-white/70">
                                    {movie.year}
                                </span>
                                <span className="border border-white/40 px-1.5 py-0.5 text-[11px] text-white/70 leading-none">
                                    {movie.rating}
                                </span>
                                <span className="text-white/70">
                                    {movie.duration}
                                </span>
                                <span className="border border-white/40 px-1 py-0.5 text-[10px] text-white/60 leading-none">
                                    HD
                                </span>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3 mb-5">
                                <button
                                    onClick={() => setInMyList(!inMyList)}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <div className="w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center hover:border-white transition-colors">
                                        {inMyList ? (
                                            <Check className="w-5 h-5 text-white" />
                                        ) : (
                                            <Plus className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                    <span className="text-[11px] text-white/60">
                                        My List
                                    </span>
                                </button>
                                <button
                                    onClick={() => setLiked(!liked)}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${liked ? "border-white bg-white/10" : "border-white/40 hover:border-white"}`}
                                    >
                                        <ThumbsUp
                                            className={`w-5 h-5 ${liked ? "text-white" : "text-white"}`}
                                        />
                                    </div>
                                    <span className="text-[11px] text-white/60">
                                        Rate
                                    </span>
                                </button>
                            </div>

                            <p className="text-sm text-white/90 leading-relaxed mb-4">
                                {movie.description}
                            </p>
                        </div>

                        {/* Right column */}
                        <div className="w-full md:w-[260px] flex-shrink-0 text-sm">
                            <p className="text-white/50 mb-2">
                                <span className="text-white/30">Cast: </span>
                                <span className="text-white/70">
                                    {movie.cast.join(", ")}
                                </span>
                            </p>
                            <p className="text-white/50 mb-2">
                                <span className="text-white/30">Genres: </span>
                                <span className="text-white/70">
                                    {movie.genres.join(", ")}
                                </span>
                            </p>
                            {movie.type === "series" && (
                                <p className="text-white/50 mb-2">
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

                    {/* Episodes section for series */}
                    {movie.type === "series" && (
                        <div className="mt-10">
                            <div className="flex items-center justify-between mb-4">
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
                                        className="flex gap-4 p-3 rounded-sm hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <div className="w-8 flex-shrink-0 flex items-center justify-center text-lg text-white/50">
                                            {episode.id}
                                        </div>
                                        <div className="relative w-[130px] flex-shrink-0 aspect-video rounded-sm overflow-hidden">
                                            <img
                                                src={episode.image}
                                                alt={episode.title}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                                <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
                                                    <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-sm font-medium text-white">
                                                    {episode.title}
                                                </h3>
                                                <span className="text-xs text-white/50">
                                                    {episode.duration}
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
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

            {/* More Like This */}
            <div className="mt-4">
                <ContentRow title="More Like This" movies={similarMovies} />
            </div>

            <Footer />
        </div>
    )
}
