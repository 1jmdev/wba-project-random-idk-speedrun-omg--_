import { useState } from "react"

interface AuthScreenProps {
    onLogin: (payload: { email: string; password: string }) => Promise<void>
    onRegister: (payload: { email: string; password: string }) => Promise<void>
    loading: boolean
    error: string | null
}

export default function AuthScreen({
    onLogin,
    onRegister,
    loading,
    error,
}: AuthScreenProps) {
    const [mode, setMode] = useState<"login" | "register">("login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (mode === "login") {
            await onLogin({ email, password })
            return
        }

        await onRegister({ email, password })
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.18),transparent_32%),linear-gradient(180deg,#151515_0%,#080808_100%)] text-white">
            <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
                <div className="grid w-full overflow-hidden rounded-2xl border border-white/10 bg-black/55 shadow-2xl backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
                    <div className="hidden flex-col justify-between border-r border-white/10 bg-[linear-gradient(160deg,rgba(229,9,20,0.18),rgba(0,0,0,0.2)_35%,rgba(0,0,0,0.85)_100%)] p-10 md:flex">
                        <div>
                            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-white/45">
                                Netflix Clone
                            </p>
                            <h1 className="max-w-md text-5xl font-semibold leading-[1.05]">
                                Stream your catalog through a real backend.
                            </h1>
                        </div>
                        <div className="space-y-3 text-sm text-white/65">
                            <p>Family auth is backed by secure cookies.</p>
                            <p>
                                Profiles are loaded from Prisma instead of mock
                                arrays.
                            </p>
                            <p>
                                Browse, search, and title pages now read from
                                `/api`.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 sm:p-10">
                        <div className="mb-8 flex gap-2 rounded-full bg-white/5 p-1">
                            <button
                                type="button"
                                onClick={() => setMode("login")}
                                className={`flex-1 rounded-full px-4 py-2 text-sm transition ${mode === "login" ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("register")}
                                className={`flex-1 rounded-full px-4 py-2 text-sm transition ${mode === "register" ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
                            >
                                Register
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <h2 className="text-3xl font-semibold">
                                    {mode === "login"
                                        ? "Welcome back"
                                        : "Create family login"}
                                </h2>
                                <p className="mt-2 text-sm text-white/50">
                                    {mode === "login"
                                        ? "Sign in and choose a profile."
                                        : "Register one family login, then create profiles."}
                                </p>
                            </div>

                            <label className="block">
                                <span className="mb-2 block text-sm text-white/70">
                                    Email
                                </span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-white/35"
                                    placeholder="family@example.com"
                                    required
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm text-white/70">
                                    Password
                                </span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-white/35"
                                    placeholder="At least 6 characters"
                                    required
                                />
                            </label>

                            {error && (
                                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-netflix-red px-4 py-3 text-sm font-medium text-white transition hover:bg-netflix-red-hover disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Please wait..."
                                    : mode === "login"
                                      ? "Sign In"
                                      : "Create Account"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
