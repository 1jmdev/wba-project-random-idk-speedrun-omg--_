import { Plus } from "lucide-react"
import { useState } from "react"
import type { Profile } from "@/lib/netflix"

interface ProfileSelectProps {
    familyName: string
    profiles: Profile[]
    onSelect: (profile: Profile) => Promise<void>
    onCreateProfile: (payload: {
        email: string
        name: string
        profileName?: string
        avatarUrl?: string
    }) => Promise<void>
    onLogout: () => Promise<void>
}

export default function ProfileSelect({
    familyName,
    profiles,
    onSelect,
    onCreateProfile,
    onLogout,
}: ProfileSelectProps) {
    const [hoveredId, setHoveredId] = useState<number | null>(null)
    const [creating, setCreating] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [avatarUrl, setAvatarUrl] = useState("")
    const [error, setError] = useState<string | null>(null)

    const handleSelect = async (profile: Profile) => {
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
                email,
                name,
                profileName: name,
                avatarUrl: avatarUrl || undefined,
            })
            setCreating(false)
            setName("")
            setEmail("")
            setAvatarUrl("")
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

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#141414]">
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/35">
                {familyName}
            </p>
            <h1 className="mb-8 text-3xl font-medium text-white md:mb-12 md:text-5xl">
                Who&apos;s watching?
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 px-4 md:gap-6">
                {profiles.map((profile) => (
                    <button
                        type="button"
                        key={profile.id}
                        onClick={() => void handleSelect(profile)}
                        onMouseEnter={() => setHoveredId(profile.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="group flex flex-col items-center gap-2"
                        disabled={loading}
                    >
                        <div
                            className={`h-[100px] w-[100px] overflow-hidden rounded-sm transition-all md:h-[140px] md:w-[140px] ${
                                hoveredId === profile.id
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
                ))}

                <button
                    type="button"
                    onClick={() => setCreating((value) => !value)}
                    className="group flex flex-col items-center gap-2"
                    disabled={loading}
                >
                    <div className="flex h-[100px] w-[100px] items-center justify-center rounded-sm bg-netflix-gray/50 transition-colors hover:bg-netflix-gray/70 md:h-[140px] md:w-[140px]">
                        <Plus className="h-12 w-12 text-netflix-light-gray transition-colors group-hover:text-white" />
                    </div>
                    <span className="text-sm text-netflix-light-gray transition-colors group-hover:text-white md:text-base">
                        Add Profile
                    </span>
                </button>
            </div>

            {creating && (
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
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Profile email"
                            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
                            required
                        />
                        <input
                            value={avatarUrl}
                            onChange={(event) =>
                                setAvatarUrl(event.target.value)
                            }
                            placeholder="Avatar URL (optional)"
                            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white outline-none"
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
                    className="border border-netflix-light-gray/50 px-6 py-2 text-sm tracking-widest text-netflix-light-gray transition-colors hover:border-white hover:text-white"
                >
                    MANAGE PROFILES
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
