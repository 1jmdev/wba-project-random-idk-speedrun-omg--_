import { Info, Play } from "lucide-react"
import { useNavigate } from "react-router"
import type { Movie } from "@/lib/neflix"

interface HeroBannerProps {
    movie: Movie
}

export default function HeroBanner({ movie }: HeroBannerProps) {
    const navigate = useNavigate()

    return (
        <div className="relative w-full h-[80vh] md:h-[85vh]">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={movie.backdrop}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Gradient overlays */}
            <div className="hero-gradient absolute inset-0" />
            <div className="hero-gradient-left absolute inset-0" />

            {/* Content */}
            <div className="absolute bottom-[20%] md:bottom-[30%] left-4 md:left-12 z-10 max-w-lg">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg leading-tight">
                    {movie.title}
                </h1>

                <p className="hidden md:block text-sm md:text-base text-white/80 mb-5 line-clamp-3 leading-relaxed drop-shadow-md">
                    {movie.description}
                </p>

                <div className="flex items-center gap-2">
                    {/* Neflix Play button - white with black text */}
                    <button
                        type="button"
                        onClick={() => navigate(`/watch/${movie.id}`)}
                        className="flex items-center gap-2 bg-white hover:bg-white/75 text-black font-semibold px-5 md:px-8 py-2 md:py-2.5 rounded text-sm md:text-lg transition-colors"
                    >
                        <Play className="w-5 h-5 md:w-7 md:h-7 fill-black" />
                        Play
                    </button>

                    {/* Neflix More Info button - gray translucent */}
                    <button
                        type="button"
                        onClick={() => navigate(`/title/${movie.id}`)}
                        className="flex items-center gap-2 bg-[#6d6d6eb3] hover:bg-[#6d6d6e66] text-white font-semibold px-5 md:px-8 py-2 md:py-2.5 rounded text-sm md:text-lg transition-colors"
                    >
                        <Info className="w-5 h-5 md:w-7 md:h-7" />
                        More Info
                    </button>
                </div>
            </div>

            {/* Maturity rating badge - Neflix style right edge */}
            <div className="absolute right-0 bottom-[25%] flex items-center z-10">
                <span className="bg-black/60 border-l-[3px] border-white/40 px-3.5 py-1 text-sm text-white/80">
                    {movie.rating}
                </span>
            </div>
        </div>
    )
}
