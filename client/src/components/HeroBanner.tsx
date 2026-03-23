import { Play, Info } from "lucide-react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import type { Movie } from "@/data/mock"

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
            <div className="absolute bottom-[20%] md:bottom-[30%] left-4 md:left-12 z-10 max-w-xl">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 drop-shadow-lg leading-tight">
                    {movie.title}
                </h1>

                <div className="flex items-center gap-2 mb-3 text-sm">
                    <span className="text-[#46d369] font-semibold">
                        {movie.match}% Match
                    </span>
                    <span className="text-white/70">{movie.year}</span>
                    <span className="border border-white/40 px-1.5 py-0.5 text-[11px] text-white/70 leading-none">
                        {movie.rating}
                    </span>
                    <span className="text-white/70">{movie.duration}</span>
                </div>

                <p className="text-sm md:text-base text-white/90 mb-5 line-clamp-3 leading-relaxed drop-shadow-md">
                    {movie.description}
                </p>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => navigate(`/title/${movie.id}`)}
                        variant="default"
                        size="xl"
                        className="gap-2"
                    >
                        <Play className="w-6 h-6 fill-black" />
                        Play
                    </Button>
                    <Button
                        onClick={() => navigate(`/title/${movie.id}`)}
                        variant="secondary"
                        size="xl"
                        className="gap-2"
                    >
                        <Info className="w-6 h-6" />
                        More Info
                    </Button>
                </div>
            </div>

            {/* Maturity rating badge */}
            <div className="absolute right-0 bottom-[25%] flex items-center gap-3 z-10">
                <span className="bg-black/60 border-l-2 border-white/40 px-3 py-1 text-sm text-white/80">
                    {movie.rating}
                </span>
            </div>
        </div>
    )
}
