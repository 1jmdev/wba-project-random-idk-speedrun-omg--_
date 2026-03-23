import { useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import HeroBanner from "@/components/HeroBanner"
import ContentRow from "@/components/ContentRow"
import ContinueWatchingRow from "@/components/ContinueWatchingRow"
import TopTenRow from "@/components/TopTenRow"
import { categories, movies, continueWatching } from "@/data/mock"
import type { Profile } from "@/data/mock"

interface BrowseProps {
    profile: Profile
    onSwitchProfile: () => void
    filter?: "movie" | "series" | "new"
}

export default function Browse({ profile, onSwitchProfile, filter }: BrowseProps) {
    const filteredCategories = useMemo(() => {
        if (!filter) return categories

        if (filter === "new") {
            return categories.map((cat) => ({
                ...cat,
                movies: cat.movies.filter((m) => m.year === 2024),
            })).filter((cat) => cat.movies.length > 0)
        }

        return categories.map((cat) => ({
            ...cat,
            movies: cat.movies.filter((m) => m.type === filter),
        })).filter((cat) => cat.movies.length > 0)
    }, [filter])

    const heroMovie = filter
        ? filteredCategories[0]?.movies[0] ?? movies[0]
        : movies[4] // The Last Kingdom: Rebirth as default hero

    return (
        <div className="min-h-screen bg-background">
            <Navbar profile={profile} onSwitchProfile={onSwitchProfile} />

            <HeroBanner movie={heroMovie} />

            {/* Content rows - pulled up over the hero */}
            <div className="relative z-10 -mt-20 md:-mt-32">
                {!filter && <ContinueWatchingRow items={continueWatching} />}

                {filteredCategories.slice(0, 2).map((category) => (
                    <ContentRow
                        key={category.title}
                        title={category.title}
                        movies={category.movies}
                    />
                ))}

                {!filter && <TopTenRow movies={movies.slice(0, 10)} />}

                {filteredCategories.slice(2).map((category) => (
                    <ContentRow
                        key={category.title}
                        title={category.title}
                        movies={category.movies}
                    />
                ))}
            </div>

            <Footer />
        </div>
    )
}
