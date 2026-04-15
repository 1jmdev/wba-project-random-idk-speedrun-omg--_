interface CardGridSkeletonProps {
    count?: number
}

export default function CardGridSkeleton({
    count = 18,
}: CardGridSkeletonProps) {
    const skeletonKeys = Array.from(
        { length: count },
        (_, index) => `card-skeleton-${index}`
    )

    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {skeletonKeys.map((key) => (
                <div key={key} className="w-full">
                    <div className="aspect-video rounded-sm skeleton-shimmer" />
                </div>
            ))}
        </div>
    )
}
