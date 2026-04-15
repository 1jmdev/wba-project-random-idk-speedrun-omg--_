import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState } from "react"
import TitleCard from "@/components/TitleCard"
import type { Movie } from "@/lib/neflix"

interface ContentRowProps {
    title: string
    movies: Movie[]
    profileId?: number
}

export default function ContentRow({
    title,
    movies,
    profileId,
}: ContentRowProps) {
    const rowRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

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
                {title}
            </h2>

            <div className="relative">
                {/* Left Arrow */}
                {canScrollLeft && (
                    <button
                        type="button"
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-0 bottom-0 z-20 w-12 md:w-14 flex items-center justify-center bg-black/50 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/70"
                    >
                        <ChevronLeft className="w-8 h-8 text-white" />
                    </button>
                )}

                {/* Row */}
                <div
                    ref={rowRef}
                    onScroll={checkScroll}
                    className="slider-row flex gap-1 overflow-x-scroll px-4 md:px-12 py-3"
                >
                    {movies.map((movie) => (
                        <TitleCard
                            key={movie.id}
                            movie={movie}
                            profileId={profileId}
                        />
                    ))}
                </div>

                {/* Right Arrow */}
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
