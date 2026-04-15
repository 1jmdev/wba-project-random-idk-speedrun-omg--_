export default function TitleDetailSkeleton() {
    const episodeSkeletonKeys = Array.from(
        { length: 5 },
        (_, index) => `episode-skeleton-${index}`
    )

    return (
        <>
            {/* Hero backdrop skeleton */}
            <div className="relative h-[70vh] w-full md:h-[80vh] bg-neflix-dark">
                <div className="absolute inset-0 skeleton-shimmer" />
                <div className="hero-gradient absolute inset-0" />
                <div className="hero-gradient-left absolute inset-0" />

                {/* Title & button skeleton */}
                <div className="absolute bottom-[10%] left-4 z-10 max-w-2xl md:left-12">
                    <div className="h-10 md:h-14 w-72 md:w-96 rounded skeleton-shimmer mb-4" />
                    <div className="h-11 w-28 rounded skeleton-shimmer" />
                </div>
            </div>

            {/* Details section skeleton */}
            <div className="relative z-10 -mt-4 px-4 pb-8 md:px-12">
                <div className="max-w-5xl">
                    <div className="flex flex-col gap-6 md:flex-row md:gap-10">
                        {/* Main content */}
                        <div className="flex-1">
                            {/* Meta */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-4 w-20 rounded skeleton-shimmer" />
                                <div className="h-4 w-12 rounded skeleton-shimmer" />
                                <div className="h-4 w-10 rounded skeleton-shimmer" />
                                <div className="h-4 w-16 rounded skeleton-shimmer" />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 mb-5">
                                <div className="h-10 w-10 rounded-full skeleton-shimmer" />
                                <div className="h-10 w-10 rounded-full skeleton-shimmer" />
                            </div>

                            {/* Description */}
                            <div className="space-y-2 mb-4">
                                <div className="h-4 w-full rounded skeleton-shimmer" />
                                <div className="h-4 w-[85%] rounded skeleton-shimmer" />
                                <div className="h-4 w-[70%] rounded skeleton-shimmer" />
                            </div>
                        </div>

                        {/* Side info */}
                        <div className="w-full shrink-0 md:w-65">
                            <div className="h-4 w-full rounded skeleton-shimmer mb-3" />
                            <div className="h-4 w-3/4 rounded skeleton-shimmer mb-3" />
                            <div className="h-4 w-1/2 rounded skeleton-shimmer" />
                        </div>
                    </div>

                    {/* Episode list skeleton */}
                    <div className="mt-10">
                        <div className="h-6 w-24 rounded skeleton-shimmer mb-4" />
                        <div className="space-y-3">
                            {episodeSkeletonKeys.map((key) => (
                                <div key={key} className="flex gap-4 p-3">
                                    <div className="w-8 h-8 rounded skeleton-shimmer shrink-0" />
                                    <div className="w-32.5 aspect-video rounded-sm skeleton-shimmer shrink-0" />
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="h-4 w-32 rounded skeleton-shimmer" />
                                        <div className="h-3 w-full rounded skeleton-shimmer" />
                                        <div className="h-3 w-3/4 rounded skeleton-shimmer" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
