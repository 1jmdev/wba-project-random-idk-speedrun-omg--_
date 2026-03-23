import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router"
import { Search, Bell, ChevronDown } from "lucide-react"
import type { Profile } from "@/data/mock"

interface NavbarProps {
    profile: Profile
    onSwitchProfile: () => void
}

export default function Navbar({ profile, onSwitchProfile }: NavbarProps) {
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
                    ? "bg-black"
                    : "bg-gradient-to-b from-black/80 to-transparent"
            }`}
        >
            {/* Left section */}
            <div className="flex items-center gap-6">
                {/* Netflix Logo */}
                <Link to="/" className="flex-shrink-0">
                    <svg
                        viewBox="0 0 111 30"
                        className="h-6 md:h-7 fill-netflix-red"
                        aria-label="Netflix"
                    >
                        <path
                            d="M105.06233,14.2806261 L110.999156,30 C109.249227,29.7497422 107.500234,29.4366498 105.718437,29.1511498 L ## 102.374168,20.4287498 L ## 99.2985498,29.1511498 C97.5765498,29.3699662 95.7## 955498,29.6531498 94.0## 355498,29.8## 71498 L99.9## 255498,14.2806261 L94.2## 65549,0 L99.2## 55498,0 L102.### 268,8.75## 2198 L105.### 437,0 L110.### 156,0 L105.062## ,14.2806261"
                            fill="currentColor"
                        ></path>
                        <path
                            d="M90.4686,0 L90.4686,26.7312 C88.7186,26.9498 86.9363,27.2006 85.1863,27.4830498 L85.1863,0 L90.4686,0 Z"
                            fill="currentColor"
                        ></path>
                        <path
                            d="M81.8456,0 L76.5634,0 L76.5634,27.9834 C78.2806,27.7350498 80.0634,27.4848498 81.8456,27.2670498 L81.8456,0 Z"
                            fill="currentColor"
                        ></path>
                        <path
                            d="M28.1884,9.8136 C27.0284,9.8136 26.0596,10.4496 25.5284,11.3496 L25.5284,11.3496 L25.4644,11.3496 L25.4644,0 L20.1812,0 L20.1812,30 L25.4644,30 L25.4644,18.1608 C25.4644,16.5888 26.2204,15.5256 27.5404,15.5256 C28.7964,15.5256 29.3924,16.4904 29.3924,18.0624 L29.3924,30 L34.6756,30 L34.6756,16.8168 C34.6756,12.7224 33.2756,9.8136 28.1884,9.8136 Z"
                            fill="currentColor"
                        ></path>
                        <path
                            d="M0,0 L5.3172,0 L5.3172,24.2892 L12.9372,24.2892 L12.9372,29.0124 L0,29.0124 L0,0 Z"
                            fill="currentColor"
                        ></path>
                    </svg>
                </Link>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-5">
                    <Link
                        to="/"
                        className="text-sm font-medium text-white hover:text-netflix-light-gray transition-colors"
                    >
                        Home
                    </Link>
                    <Link
                        to="/tv-shows"
                        className="text-sm text-netflix-light-gray hover:text-white transition-colors"
                    >
                        TV Shows
                    </Link>
                    <Link
                        to="/movies"
                        className="text-sm text-netflix-light-gray hover:text-white transition-colors"
                    >
                        Movies
                    </Link>
                    <Link
                        to="/new"
                        className="text-sm text-netflix-light-gray hover:text-white transition-colors"
                    >
                        New & Popular
                    </Link>
                    <Link
                        to="/my-list"
                        className="text-sm text-netflix-light-gray hover:text-white transition-colors"
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
                            <div className="flex items-center bg-black/90 border border-white/50 px-2">
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
                                    autoFocus
                                    className="bg-transparent text-white text-sm pl-2 py-1 w-[180px] md:w-[250px] outline-none placeholder:text-gray-400"
                                />
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="text-white hover:text-gray-300 transition-colors"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Notifications */}
                <button className="text-white hover:text-gray-300 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-netflix-red rounded-full text-[8px] flex items-center justify-center">
                        3
                    </span>
                </button>

                {/* Profile */}
                <div className="relative">
                    <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className="flex items-center gap-1 group"
                    >
                        <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-8 h-8 rounded-sm"
                        />
                        <ChevronDown
                            className={`w-4 h-4 text-white transition-transform ${profileMenuOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    {profileMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0"
                                onClick={() => setProfileMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-12 w-48 bg-black/95 border border-white/15 py-2 rounded-sm shadow-2xl">
                                <button
                                    onClick={() => {
                                        setProfileMenuOpen(false)
                                        onSwitchProfile()
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-white/80 hover:text-white hover:underline"
                                >
                                    Switch Profiles
                                </button>
                                <div className="border-t border-white/15 mt-1 pt-1">
                                    <button className="w-full px-4 py-2 text-left text-sm text-white/80 hover:text-white hover:underline">
                                        Account
                                    </button>
                                    <button className="w-full px-4 py-2 text-left text-sm text-white/80 hover:text-white hover:underline">
                                        Help Center
                                    </button>
                                    <button
                                        onClick={() => {
                                            setProfileMenuOpen(false)
                                            onSwitchProfile()
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-white/80 hover:text-white hover:underline"
                                    >
                                        Sign out of Netflix
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
