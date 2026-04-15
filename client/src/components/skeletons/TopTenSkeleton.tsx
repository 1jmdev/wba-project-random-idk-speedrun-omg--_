export default function TopTenSkeleton() {
    const skeletonKeys = Array.from(
        { length: 6 },
        (_, index) => `top-ten-skeleton-${index}`
    )

    return (
        <div className="mb-8 md:mb-10">
            {/* Row title */}
            <div className="px-4 md:px-12 mb-3">
                <div className="h-5 md:h-6 w-64 rounded skeleton-shimmer" />
            </div>

            {/* Top 10 cards */}
            <div className="flex gap-3 px-4 md:px-12">
                {skeletonKeys.map((key) => (
                    <div key={key} className="shrink-0 flex items-end">
                        {/* Number placeholder */}
                        <div className="w-15 md:w-20 h-30 md:h-40 -mr-5 z-10 skeleton-shimmer rounded" />

                        {/* Poster placeholder */}
                        <div className="w-25 md:w-32.5 aspect-2/3 rounded-sm skeleton-shimmer" />
                    </div>
                ))}
            </div>
        </div>
    )
}
