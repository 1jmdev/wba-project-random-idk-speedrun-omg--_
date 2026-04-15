import { Check, ChevronDown, Play, Plus, ThumbsUp } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { isInMyList, type Movie, toggleMyList } from "@/lib/neflix"

interface TitleCardProps {
    movie: Movie
    grid?: boolean
    profileId?: number
}

export default function TitleCard({
    movie,
    grid = false,
    profileId,
}: TitleCardProps) {
    const navigate = useNavigate()
    const [inMyList, setInMyList] = useState(false)

    useEffect(() => {
        if (!profileId) {
            setInMyList(false)
            return
        }

        setInMyList(isInMyList(profileId, movie.id))
    }, [movie.id, profileId])

    return (
        <div
            className={`group/card relative cursor-pointer ${grid ? "w-full" : "flex-shrink-0 w-[160px] md:w-[230px]"}`}
        >
            {/* Base card */}
            <div className="relative aspect-video overflow-hidden rounded-sm transition-transform duration-300 group-hover/card:scale-105">
                <button
                    type="button"
                    aria-label={`Open ${movie.title}`}
                    onClick={() => navigate(`/title/${movie.id}`)}
                    className="absolute inset-0 z-0"
                />
                <img
                    src={movie.backdrop}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />

                {/* Title overlay — always visible at bottom */}
                <div className="absolute inset-0 z-10 flex flex-col justify-end transition-opacity duration-200">
                    <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5 pt-10">
                        <div className="group-hover/card:hidden">
                            <p className="truncate text-xs font-medium text-white md:text-sm">
                                {movie.title}
                            </p>
                        </div>

                        <div className="hidden group-hover/card:block">
                            <div className="mb-1.5 flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(`/title/${movie.id}`)
                                    }}
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white transition-colors hover:bg-white/80"
                                >
                                    <Play className="ml-0.5 h-3.5 w-3.5 fill-black text-black" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        if (!profileId) {
                                            return
                                        }

                                        setInMyList(
                                            toggleMyList(profileId, movie.id)
                                        )
                                    }}
                                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/40 transition-colors hover:border-white"
                                >
                                    {inMyList ? (
                                        <Check className="h-3.5 w-3.5 text-white" />
                                    ) : (
                                        <Plus className="h-3.5 w-3.5 text-white" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/40 transition-colors hover:border-white"
                                >
                                    <ThumbsUp className="h-3.5 w-3.5 text-white" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        navigate(`/title/${movie.id}`)
                                    }}
                                    className="ml-auto flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/40 transition-colors hover:border-white"
                                >
                                    <ChevronDown className="h-3.5 w-3.5 text-white" />
                                </button>
                            </div>

                            <div className="mb-1 flex items-center gap-1.5 text-[10px]">
                                <span className="font-semibold text-[#46d369]">
                                    {movie.match}%
                                </span>
                                <span className="border border-white/40 px-1 py-px text-[9px] leading-none text-white/70">
                                    {movie.rating}
                                </span>
                                <span className="text-white/60">
                                    {movie.type === "series"
                                        ? `${movie.seasons}S`
                                        : movie.duration}
                                </span>
                                <span className="border border-white/40 px-1 py-px text-[9px] leading-none text-white/60">
                                    HD
                                </span>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] text-white/70">
                                {movie.genres.slice(0, 3).map((genre, i) => (
                                    <span
                                        key={genre}
                                        className="flex items-center gap-1"
                                    >
                                        {i > 0 && (
                                            <span className="h-0.5 w-0.5 rounded-full bg-white/40" />
                                        )}
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
