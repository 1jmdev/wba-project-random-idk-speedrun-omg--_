import { Bell, ChevronDown, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import NetflixLogo from "@/components/NetflixLogo"
import type { Profile } from "@/lib/netflix"

interface NavbarProps {
    profile: Profile
    onSwitchProfile: () => void
    onLogout: () => Promise<void>
}

export default function Navbar({
    profile,
    onSwitchProfile,
    onLogout,
}: NavbarProps) {
    const [scrolled, setScrolled] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 py-0 h-[68px] transition-colors duration-500 ${
                scrolled
                    ? "bg-netflix-dark"
                    : "bg-gradient-to-b from-black/80 to-transparent"
            }`}
        >
            {/* Left section */}
            <div className="flex items-center gap-6">
                {/* Netflix Logo */}
                <Link to="/" className="flex-shrink-0">
                    <NetflixLogo className="h-6 md:h-7" />
                </Link>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-5">
                    <Link
                        to="/"
                        className="text-[14px] font-medium text-white hover:text-netflix-light-gray transition-colors"
                    >
                        Home
                    </Link>
                    <Link
                        to="/tv-shows"
                        className="text-[14px] text-netflix-light-gray hover:text-white/70 transition-colors"
                    >
                        TV Shows
                    </Link>
                    <Link
                        to="/movies"
                        className="text-[14px] text-netflix-light-gray hover:text-white/70 transition-colors"
                    >
                        Movies
                    </Link>
                    <Link
                        to="/new"
                        className="text-[14px] text-netflix-light-gray hover:text-white/70 transition-colors"
                    >
                        New &amp; Popular
                    </Link>
                    <Link
                        to="/my-list"
                        className="text-[14px] text-netflix-light-gray hover:text-white/70 transition-colors"
                    >
                        My List
                    </Link>
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative flex items-center">
                    {searchOpen ? (
                        <form
                            onSubmit={handleSearch}
                            className="flex items-center"
                        >
                            <div className="flex items-center bg-black border border-white/60 px-2.5">
                                <Search className="w-4 h-4 text-white" />
                                <input
                                    type="text"
                                    placeholder="Titles, people, genres"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onBlur={() => {
                                        if (!searchQuery) setSearchOpen(false)
                                    }}
                                    className="bg-transparent text-white text-sm pl-2 py-1.5 w-[180px] md:w-[250px] outline-none placeholder:text-[#8c8c8c]"
                                    // biome-ignore lint/a11y/noAutofocus: search UX requires focus
                                    autoFocus
                                />
                            </div>
                        </form>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setSearchOpen(true)}
                            className="text-white hover:text-gray-300 transition-colors"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Notifications */}
                <button
                    type="button"
                    className="text-white hover:text-gray-300 transition-colors relative"
                >
                    <Bell className="w-5 h-5" />
                </button>

                {/* Profile */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className="flex items-center gap-1.5 group"
                    >
                        <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-8 h-8 rounded"
                        />
                        <ChevronDown
                            className={`w-4 h-4 text-white transition-transform duration-200 ${profileMenuOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {profileMenuOpen && (
                        <>
                            <button
                                type="button"
                                className="fixed inset-0"
                                onClick={() => setProfileMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-14 w-52 bg-black/90 border border-white/20 py-2 shadow-2xl">
                                {/* Caret */}
                                <div className="absolute -top-2 right-6 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[7px] border-b-white/20" />

                                <div className="px-3 py-2 flex items-center gap-3">
                                    <img
                                        src={profile.avatar}
                                        alt={profile.name}
                                        className="w-8 h-8 rounded"
                                    />
                                    <span className="text-[13px] text-white">
                                        {profile.name}
                                    </span>
                                </div>

                                <div className="border-t border-white/20 my-1" />

                                <button
                                    type="button"
                                    onClick={() => {
                                        setProfileMenuOpen(false)
                                        onSwitchProfile()
                                    }}
                                    className="w-full px-3 py-1.5 text-left text-[13px] text-white/70 hover:text-white hover:underline"
                                >
                                    Switch Profiles
                                </button>
                                <button
                                    type="button"
                                    className="w-full px-3 py-1.5 text-left text-[13px] text-white/70 hover:text-white hover:underline"
                                >
                                    Account
                                </button>
                                <button
                                    type="button"
                                    className="w-full px-3 py-1.5 text-left text-[13px] text-white/70 hover:text-white hover:underline"
                                >
                                    Help Center
                                </button>

                                <div className="border-t border-white/20 my-1" />

                                <button
                                    type="button"
                                    onClick={() => {
                                        setProfileMenuOpen(false)
                                        void onLogout()
                                    }}
                                    className="w-full px-3 py-1.5 text-center text-[13px] text-white/70 hover:text-white hover:underline"
                                >
                                    Sign out of Netflix
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
