import { Plus, X } from "lucide-react"
import { useState } from "react"
import type { Profile } from "@/lib/neflix"

interface ProfileSelectProps {
    profiles: Profile[]
    onSelect: (profile: Profile) => Promise<void>
    onCreateProfile: (payload: { name: string }) => Promise<void>
    onDeleteProfile: (profileId: number) => Promise<void>
    onLogout: () => Promise<void>
}

// Neflix profile icon colors
const PROFILE_COLORS = [
    "#e50914",
    "#0071eb",
    "#1ce783",
    "#e87c03",
    "#b9090b",
    "#6d28d9",
    "#0891b2",
    "#be123c",
]

export default function ProfileSelect({
    profiles,
    onSelect,
    onCreateProfile,
    onDeleteProfile,
    onLogout,
}: ProfileSelectProps) {
    const [hoveredId, setHoveredId] = useState<number | null>(null)
    const [manageMode, setManageMode] = useState(false)
    const [creating, setCreating] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [error, setError] = useState<string | null>(null)

    const handleSelect = async (profile: Profile) => {
        if (manageMode) {
            return
        }

        setLoading(true)
        setError(null)

        try {
            await onSelect(profile)
        } catch (nextError) {
            setError(
                nextError instanceof Error
                    ? nextError.message
                    : "Failed to select profile"
            )
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (event: React.FormEvent) => {
        event.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await onCreateProfile({
                name,
            })
            setCreating(false)
            setName("")
        } catch (nextError) {
            setError(
                nextError instanceof Error
                    ? nextError.message
                    : "Failed to create profile"
            )
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (profileId: number) => {
        setLoading(true)
        setError(null)

        try {
            await onDeleteProfile(profileId)
            setCreating(false)
        } catch (nextError) {
            setError(
                nextError instanceof Error
                    ? nextError.message
                    : "Failed to delete profile"
            )
        } finally {
            setLoading(false)
        }
    }

    const toggleManageMode = () => {
        setManageMode((value) => {
            const nextValue = !value

            if (!nextValue) {
                setCreating(false)
                setName("")
                setError(null)
            }

            return nextValue
        })
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neflix-dark">
            <h1 className="mb-8 text-3xl font-medium text-white md:mb-12 md:text-5xl">
                {manageMode ? "Manage Profiles:" : "Who\u0027s watching?"}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 px-4 md:gap-8">
                {profiles.map((profile, index) => {
                    const color = PROFILE_COLORS[index % PROFILE_COLORS.length]
                    const initial = profile.name.charAt(0).toUpperCase()

                    return (
                        <div
                            key={profile.id}
                            className={`group relative flex flex-col items-center gap-3 ${manageMode ? "cursor-default" : "cursor-pointer"}`}
                        >
                            {manageMode && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        void handleDelete(profile.id)
                                    }
                                    disabled={loading || profiles.length <= 1}
                                    className="absolute -right-1 -top-1 z-10 rounded-full bg-neflix-dark p-1 text-white transition hover:text-neflix-red disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label={`Delete ${profile.name}`}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => void handleSelect(profile)}
                                onMouseEnter={() => setHoveredId(profile.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                disabled={loading || manageMode}
                                className="flex flex-col items-center gap-3"
                            >
                                <div
                                    className={`relative h-21 w-21 overflow-hidden rounded md:h-35 md:w-35 transition-all ${
                                        !manageMode && hoveredId === profile.id
                                            ? "ring-3 ring-white"
                                            : "ring-0"
                                    } ${manageMode ? "opacity-50" : ""}`}
                                    style={{
                                        backgroundColor: color,
                                    }}
                                >
                                    {/* Profile initial */}
                                    <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white/90 md:text-5xl select-none">
                                        {initial}
                                    </span>

                                    {/* Manage overlay */}
                                    {manageMode && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                            <svg
                                                className="h-8 w-8 text-white md:h-10 md:w-10"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={1.5}
                                                aria-label="Edit"
                                            >
                                                <title>Edit profile</title>
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <span
                                    className={`text-sm transition-colors md:text-base ${
                                        hoveredId === profile.id
                                            ? "text-white"
                                            : "text-[#808080]"
                                    }`}
                                >
                                    {profile.name}
                                </span>
                            </button>
                        </div>
                    )
                })}

                {/* Add Profile */}
                {manageMode && (
                    <button
                        type="button"
                        onClick={() => setCreating((value) => !value)}
                        className="group flex flex-col items-center gap-3"
                        disabled={loading}
                    >
                        <div className="flex h-21 w-21 items-center justify-center rounded bg-neflix-dark border-2 border-[#808080] md:h-35 md:w-35 transition-colors group-hover:border-white">
                            <Plus className="h-12 w-12 text-[#808080] transition-colors group-hover:text-white md:h-16 md:w-16" />
                        </div>
                        <span className="text-sm text-[#808080] transition-colors group-hover:text-white md:text-base">
                            Add Profile
                        </span>
                    </button>
                )}
            </div>

            {manageMode && creating && (
                <form
                    onSubmit={handleCreate}
                    className="mt-10 w-full max-w-md border-t border-b border-[#333] bg-neflix-dark p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 shrink-0 rounded bg-[#333] flex items-center justify-center">
                            <Plus className="h-8 w-8 text-[#808080]" />
                        </div>
                        <div className="flex-1">
                            <input
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder="Name"
                                className="w-full bg-[#333] px-4 py-3 text-white outline-none"
                                required
                            />
                        </div>
                    </div>
                    {error && (
                        <p className="mt-4 text-sm text-[#e87c03]">{error}</p>
                    )}
                    <div className="mt-5 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={() => setCreating(false)}
                            className="border border-[#808080] px-6 py-1.5 text-sm text-[#808080] hover:text-white hover:border-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-white px-6 py-1.5 text-sm font-semibold text-neflix-dark hover:bg-neflix-red hover:text-white transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </form>
            )}

            {error && !creating && (
                <p className="mt-6 text-sm text-[#e87c03]">{error}</p>
            )}

            <div className="mt-10 flex gap-3 md:mt-16">
                <button
                    type="button"
                    onClick={toggleManageMode}
                    className={`border px-8 py-2 text-sm tracking-[0.2em] transition-colors ${
                        manageMode
                            ? "border-white bg-white text-neflix-dark hover:bg-neflix-red hover:text-white hover:border-neflix-red"
                            : "border-[#808080] text-[#808080] hover:border-white hover:text-white"
                    }`}
                >
                    {manageMode ? "DONE" : "MANAGE PROFILES"}
                </button>
                <button
                    type="button"
                    onClick={() => void onLogout()}
                    className="border border-[#808080]/50 px-8 py-2 text-sm tracking-[0.2em] text-[#808080] transition-colors hover:border-white hover:text-white"
                >
                    SIGN OUT
                </button>
            </div>
        </div>
    )
}
