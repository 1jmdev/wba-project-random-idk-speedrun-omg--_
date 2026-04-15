interface RowSkeletonProps {
    titleWidth?: string
    cardCount?: number
}

export default function RowSkeleton({
    titleWidth = "w-48",
    cardCount = 6,
}: RowSkeletonProps) {
    const skeletonKeys = Array.from(
        { length: cardCount },
        (_, index) => `row-skeleton-${index}`
    )

    return (
        <div className="mb-8 md:mb-10">
            {/* Row title */}
            <div className="px-4 md:px-12 mb-3">
                <div
                    className={`h-5 md:h-6 ${titleWidth} rounded skeleton-shimmer`}
                />
            </div>

            {/* Cards */}
            <div className="flex gap-1 px-4 md:px-12">
                {skeletonKeys.map((key) => (
                    <div key={key} className="shrink-0 w-40 md:w-57.5">
                        <div className="aspect-video rounded-sm skeleton-shimmer" />
                    </div>
                ))}
            </div>
        </div>
    )
}
