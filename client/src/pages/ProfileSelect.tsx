import { useState } from "react"
import { Plus } from "lucide-react"
import { profiles } from "@/data/mock"
import type { Profile } from "@/data/mock"

interface ProfileSelectProps {
    onSelect: (profile: Profile) => void
}

export default function ProfileSelect({ onSelect }: ProfileSelectProps) {
    const [hoveredId, setHoveredId] = useState<number | null>(null)

    return (
        <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center">
            <h1 className="text-3xl md:text-5xl text-white font-medium mb-8 md:mb-12">
                Who's watching?
            </h1>

            <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center px-4">
                {profiles.map((profile) => (
                    <button
                        key={profile.id}
                        onClick={() => onSelect(profile)}
                        onMouseEnter={() => setHoveredId(profile.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div
                            className={`w-[100px] h-[100px] md:w-[140px] md:h-[140px] rounded-sm overflow-hidden transition-all ${
                                hoveredId === profile.id ? "ring-2 ring-white" : "ring-0"
                            }`}
                        >
                            <img
                                src={profile.avatar}
                                alt={profile.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span
                            className={`text-sm md:text-base transition-colors ${
                                hoveredId === profile.id ? "text-white" : "text-netflix-light-gray"
                            }`}
                        >
                            {profile.name}
                        </span>
                    </button>
                ))}

                {/* Add Profile */}
                <button className="flex flex-col items-center gap-2 group">
                    <div className="w-[100px] h-[100px] md:w-[140px] md:h-[140px] rounded-sm bg-netflix-gray/50 flex items-center justify-center hover:bg-netflix-gray/70 transition-colors">
                        <Plus className="w-12 h-12 text-netflix-light-gray group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm md:text-base text-netflix-light-gray group-hover:text-white transition-colors">
                        Add Profile
                    </span>
                </button>
            </div>

            <button className="mt-10 md:mt-16 px-6 py-2 border border-netflix-light-gray/50 text-netflix-light-gray text-sm tracking-widest hover:text-white hover:border-white transition-colors">
                MANAGE PROFILES
            </button>
        </div>
    )
}
