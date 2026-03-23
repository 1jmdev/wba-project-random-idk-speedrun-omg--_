import { useRef, useState } from "react"
import { useNavigate } from "react-router"
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react"
import type { Movie } from "@/data/mock"

interface ContinueWatchingRowProps {
    items: { movie: Movie; progress: number }[]
}

export default function ContinueWatchingRow({ items }: ContinueWatchingRowProps) {
    const rowRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)
    const navigate = useNavigate()

    const checkScroll = () => {
        if (!rowRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = rowRef.current
        setCanScrollLeft(scrollLeft > 10)
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
    }

    const scroll = (direction: "left" | "right") => {
        if (!rowRef.current) return
        const scrollAmount = rowRef.current.clientWidth * 0.85
        rowRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        })
        setTimeout(checkScroll, 350)
    }

    return (
        <div className="relative group/row mb-8 md:mb-10">
            <h2 className="text-base md:text-xl font-semibold text-white px-4 md:px-12 mb-2">
                Continue Watching
            </h2>

            <div className="relative">
                {canScrollLeft && (
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-0 bottom-0 z-20 w-12 md:w-14 flex items-center justify-center bg-black/50 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/70"
                    >
                        <ChevronLeft className="w-8 h-8 text-white" />
                    </button>
                )}

                <div
                    ref={rowRef}
                    onScroll={checkScroll}
                    className="slider-row flex gap-1 overflow-x-scroll px-4 md:px-12 py-3"
                >
                    {items.map(({ movie, progress }) => (
                        <div
                            key={movie.id}
                            className="relative flex-shrink-0 w-[160px] md:w-[230px] cursor-pointer group/card"
                            onClick={() => navigate(`/title/${movie.id}`)}
                        >
                            <div className="relative aspect-video rounded-sm overflow-hidden">
                                <img
                                    src={movie.backdrop}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/40 transition-colors flex items-center justify-center">
                                    <div className="opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-2">
                                        <button className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white">
                                            <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                                        </button>
                                        <button className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center hover:border-white">
                                            <Info className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                                    <div
                                        className="h-full bg-netflix-red"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="mt-1.5 px-0.5">
                                <p className="text-xs text-white/90 font-medium truncate">{movie.title}</p>
                                <p className="text-[10px] text-white/50">
                                    {movie.type === "series"
                                        ? `S${movie.seasons} E${Math.ceil(Math.random() * 10)}`
                                        : `${progress}% watched`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {canScrollRight && (
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-0 bottom-0 z-20 w-12 md:w-14 flex items-center justify-center bg-black/50 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/70"
                    >
                        <ChevronRight className="w-8 h-8 text-white" />
                    </button>
                )}
            </div>
        </div>
    )
}
