import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState } from "react"
import { useNavigate } from "react-router"
import type { Movie } from "@/lib/neflix"

interface TopTenRowProps {
    movies: Movie[]
}

export default function TopTenRow({ movies }: TopTenRowProps) {
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
                Top 10 in Your Country Today
            </h2>

            <div className="relative">
                {canScrollLeft && (
                    <button
                        type="button"
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-0 bottom-0 z-20 w-12 md:w-14 flex items-center justify-center bg-black/50 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/70"
                    >
                        <ChevronLeft className="w-8 h-8 text-white" />
                    </button>
                )}

                <div
                    ref={rowRef}
                    onScroll={checkScroll}
                    className="slider-row flex gap-3 overflow-x-scroll px-4 md:px-12 py-3"
                >
                    {movies.slice(0, 10).map((movie, index) => (
                        <button
                            type="button"
                            key={movie.id}
                            className="relative shrink-0 flex items-end cursor-pointer group/card"
                            onClick={() => navigate(`/title/${movie.id}`)}
                        >
                            {/* Big number */}
                            <span
                                className="text-[120px] md:text-[160px] font-black leading-none select-none -mr-5 z-10"
                                style={{
                                    color: "transparent",
                                    WebkitTextStroke:
                                        "3px rgba(255,255,255,0.5)",
                                    paintOrder: "stroke fill",
                                }}
                            >
                                {index + 1}
                            </span>

                            {/* Poster */}
                            <div className="w-25 md:w-32.5 aspect-2/3 rounded-sm overflow-hidden group-hover/card:scale-105 transition-transform">
                                <img
                                    src={movie.image}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                        </button>
                    ))}
                </div>

                {canScrollRight && (
                    <button
                        type="button"
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
