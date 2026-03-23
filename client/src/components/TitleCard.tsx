import { useState } from "react"
import { useNavigate } from "react-router"
import { Play, Plus, ThumbsUp, ChevronDown } from "lucide-react"
import type { Movie } from "@/data/mock"

interface TitleCardProps {
    movie: Movie
    grid?: boolean
}

export default function TitleCard({ movie, grid = false }: TitleCardProps) {
    const navigate = useNavigate()
    const [hovered, setHovered] = useState(false)

    return (
        <div
            className={`relative cursor-pointer ${grid ? "w-full" : "flex-shrink-0 w-[160px] md:w-[230px]"}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => navigate(`/title/${movie.id}`)}
        >
            {/* Base card */}
            <div
                className={`relative overflow-hidden rounded-sm transition-transform duration-300 aspect-video ${
                    hovered ? "scale-105" : ""
                }`}
            >
                <img
                    src={movie.backdrop}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />

                {/* Title overlay — always visible at bottom */}
                <div
                    className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-200 ${
                        hovered ? "opacity-100" : "opacity-100"
                    }`}
                >
                    <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5 pt-10">
                        {/* Hover content */}
                        {hovered ? (
                            <>
                                {/* Action buttons */}
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigate(`/title/${movie.id}`)
                                        }}
                                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-white/80 transition-colors"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-black text-black ml-0.5" />
                                    </button>
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-7 h-7 rounded-full border-2 border-white/40 flex items-center justify-center hover:border-white transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-white" />
                                    </button>
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-7 h-7 rounded-full border-2 border-white/40 flex items-center justify-center hover:border-white transition-colors"
                                    >
                                        <ThumbsUp className="w-3.5 h-3.5 text-white" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            navigate(`/title/${movie.id}`)
                                        }}
                                        className="w-7 h-7 rounded-full border-2 border-white/40 flex items-center justify-center hover:border-white transition-colors ml-auto"
                                    >
                                        <ChevronDown className="w-3.5 h-3.5 text-white" />
                                    </button>
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center gap-1.5 text-[10px] mb-1">
                                    <span className="text-[#46d369] font-semibold">{movie.match}%</span>
                                    <span className="border border-white/40 px-1 py-px text-[9px] text-white/70 leading-none">
                                        {movie.rating}
                                    </span>
                                    <span className="text-white/60">
                                        {movie.type === "series"
                                            ? `${movie.seasons}S`
                                            : movie.duration}
                                    </span>
                                    <span className="border border-white/40 px-1 py-px text-[9px] text-white/60 leading-none">
                                        HD
                                    </span>
                                </div>

                                {/* Genres */}
                                <div className="flex items-center gap-1 text-[10px] text-white/70">
                                    {movie.genres.slice(0, 3).map((genre, i) => (
                                        <span key={genre} className="flex items-center gap-1">
                                            {i > 0 && (
                                                <span className="w-0.5 h-0.5 rounded-full bg-white/40" />
                                            )}
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-xs md:text-sm font-medium text-white truncate">
                                {movie.title}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
