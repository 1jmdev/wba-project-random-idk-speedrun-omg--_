import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import TitleCard from "@/components/TitleCard"
import { myList } from "@/data/mock"
import type { Profile } from "@/data/mock"

interface MyListProps {
    profile: Profile
    onSwitchProfile: () => void
}

export default function MyList({ profile, onSwitchProfile }: MyListProps) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar profile={profile} onSwitchProfile={onSwitchProfile} />

            <div className="pt-24 px-4 md:px-12 pb-8">
                <h1 className="text-2xl md:text-3xl font-semibold text-white mb-8">
                    My List
                </h1>

                {myList.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                        {myList.map((movie) => (
                            <div key={movie.id}>
                                <TitleCard movie={movie} grid />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <p className="text-lg text-white/70 mb-2">
                            Your list is empty.
                        </p>
                        <p className="text-sm text-white/40">
                            Add movies and shows to your list to watch them
                            later.
                        </p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}
