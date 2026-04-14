import { Plus, X } from "lucide-react"
import { useState } from "react"
import type { Profile } from "@/lib/netflix"

interface ProfileSelectProps {
    profiles: Profile[]
    onSelect: (profile: Profile) => Promise<void>
    onCreateProfile: (payload: { name: string }) => Promise<void>
    onDeleteProfile: (profileId: number) => Promise<void>
    onLogout: () => Promise<void>
}

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
        <div className="flex min-h-screen flex-col items-center justify-center bg-netflix-dark">
            <h1 className="mb-8 text-3xl font-medium text-white md:mb-12 md:text-5xl">
                {manageMode ? "Manage profiles" : "Who&apos;s watching?"}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 px-4 md:gap-6">
                {profiles.map((profile) => (
                    <div
                        key={profile.id}
                        className={`group relative flex flex-col items-center gap-2 ${manageMode ? "cursor-default" : "cursor-pointer"}`}
                    >
                        {manageMode && (
                            <button
                                type="button"
                                onClick={() => void handleDelete(profile.id)}
                                disabled={loading || profiles.length <= 1}
                                className="absolute right-2 top-2 z-10 rounded-full bg-black/70 p-1 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
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
                            className="flex flex-col items-center gap-2"
                        >
                            <div
                                className={`h-25 w-25 overflow-hidden rounded-sm transition-all md:h-35 md:w-35 ${
                                    !manageMode && hoveredId === profile.id
                                        ? "ring-2 ring-white"
                                        : "ring-0"
                                }`}
                            >
                                <img
                                    src={profile.avatar}
                                    alt={profile.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <span
                                className={`text-sm transition-colors md:text-base ${
                                    hoveredId === profile.id
                                        ? "text-white"
                                        : "text-netflix-light-gray"
                                }`}
                            >
                                {profile.name}
                            </span>
                        </button>
                    </div>
                ))}

                {manageMode && (
                    <button
                        type="button"
                        onClick={() => setCreating((value) => !value)}
                        className="group flex flex-col items-center gap-2"
                        disabled={loading}
                    >
                        <div className="flex h-25 w-25 items-center justify-center rounded-sm bg-netflix-gray/50 transition-colors hover:bg-netflix-gray/70 md:h-35 md:w-35">
                            <Plus className="h-12 w-12 text-netflix-light-gray transition-colors group-hover:text-white" />
                        </div>
                        <span className="text-sm text-netflix-light-gray transition-colors group-hover:text-white md:text-base">
                            Add Profile
                        </span>
                    </button>
                )}
            </div>

            {manageMode && creating && (
                <form
                    onSubmit={handleCreate}
                    className="mt-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                    <h2 className="mb-4 text-lg font-medium text-white">
                        Add profile
                    </h2>
                    <div className="space-y-3">
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Profile name"
                            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                            required
                        />
                    </div>
                    {error && (
                        <p className="mt-4 text-sm text-red-300">{error}</p>
                    )}
                    <div className="mt-5 flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-netflix-red px-4 py-2 text-sm text-white"
                        >
                            Create
                        </button>
                        <button
                            type="button"
                            onClick={() => setCreating(false)}
                            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/75"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {error && !creating && (
                <p className="mt-6 text-sm text-red-300">{error}</p>
            )}

            <div className="mt-10 flex gap-3 md:mt-16">
                <button
                    type="button"
                    onClick={toggleManageMode}
                    className="border border-netflix-light-gray/50 px-6 py-2 text-sm tracking-widest text-netflix-light-gray transition-colors hover:border-white hover:text-white"
                >
                    {manageMode ? "DONE" : "MANAGE PROFILES"}
                </button>
                <button
                    type="button"
                    onClick={() => void onLogout()}
                    className="border border-white/20 px-6 py-2 text-sm tracking-widest text-white/70 transition-colors hover:border-white hover:text-white"
                >
                    SIGN OUT
                </button>
            </div>
        </div>
    )
}
