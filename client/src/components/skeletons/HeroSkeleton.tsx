export default function HeroSkeleton() {
    return (
        <div className="relative w-full h-[80vh] md:h-[85vh] bg-netflix-dark">
            {/* Background shimmer */}
            <div className="absolute inset-0 skeleton-shimmer" />

            {/* Gradient overlays */}
            <div className="hero-gradient absolute inset-0" />
            <div className="hero-gradient-left absolute inset-0" />

            {/* Content skeleton */}
            <div className="absolute bottom-[20%] md:bottom-[30%] left-4 md:left-12 z-10 max-w-xl">
                {/* Title */}
                <div className="h-10 md:h-14 w-80 md:w-105 rounded skeleton-shimmer mb-4" />

                {/* Meta info */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-4 w-20 rounded skeleton-shimmer" />
                    <div className="h-4 w-12 rounded skeleton-shimmer" />
                    <div className="h-4 w-10 rounded skeleton-shimmer" />
                    <div className="h-4 w-16 rounded skeleton-shimmer" />
                </div>

                {/* Description */}
                <div className="space-y-2 mb-6">
                    <div className="h-4 w-full rounded skeleton-shimmer" />
                    <div className="h-4 w-[90%] rounded skeleton-shimmer" />
                    <div className="h-4 w-[60%] rounded skeleton-shimmer" />
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                    <div className="h-11 w-32 rounded skeleton-shimmer" />
                    <div className="h-11 w-36 rounded skeleton-shimmer" />
                </div>
            </div>

            {/* Rating badge */}
            <div className="absolute right-0 bottom-[25%] z-10">
                <div className="h-8 w-16 skeleton-shimmer" />
            </div>
        </div>
    )
}
