import { useState } from "react"
import NeflixLogo from "@/components/NeflixLogo"

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
        <div className="relative min-h-screen bg-neflix-black text-white">
            {/* Background image placeholder */}
            <div className="absolute inset-0 opacity-50">
                <div className="h-full w-full bg-gradient-to-b from-neflix-dark/80 via-neflix-black/60 to-neflix-black" />
            </div>

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Header with Neflix logo */}
            <header className="relative z-10 px-4 py-6 md:px-12">
                <NeflixLogo className="h-7 md:h-10" />
            </header>

            {/* Login form - centered */}
            <div className="relative z-10 mx-auto flex items-center justify-center px-4 pb-20">
                <div className="w-full max-w-[450px] rounded bg-black/75 px-[68px] py-12">
                    <h1 className="mb-7 text-[32px] font-bold text-white">
                        {mode === "login" ? "Sign In" : "Sign Up"}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email field - Neflix floating label style */}
                        <div className="relative">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                className="peer w-full rounded bg-[#333] px-5 pb-2 pt-6 text-white outline-none ring-0 focus:ring-2 focus:ring-white/50 placeholder-transparent"
                                placeholder="Email"
                                required
                            />
                            <label
                                htmlFor="email"
                                className="pointer-events-none absolute left-5 top-2 text-[11px] text-[#8c8c8c] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-[11px]"
                            >
                                Email or phone number
                            </label>
                        </div>

                        {/* Password field - Neflix floating label style */}
                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                className="peer w-full rounded bg-[#333] px-5 pb-2 pt-6 text-white outline-none ring-0 focus:ring-2 focus:ring-white/50 placeholder-transparent"
                                placeholder="Password"
                                required
                            />
                            <label
                                htmlFor="password"
                                className="pointer-events-none absolute left-5 top-2 text-[11px] text-[#8c8c8c] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-[11px]"
                            >
                                Password
                            </label>
                        </div>

                        {error && (
                            <div className="rounded bg-[#e87c03] px-5 py-2.5 text-sm text-white">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-6 w-full rounded bg-neflix-red py-3 text-base font-semibold text-white transition hover:bg-neflix-red-hover disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Please wait..."
                                : mode === "login"
                                  ? "Sign In"
                                  : "Sign Up"}
                        </button>

                        {/* Remember me + help */}
                        <div className="flex items-center justify-between text-[13px] text-[#b3b3b3]">
                            <label className="flex items-center gap-1.5">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-[#b3b3b3]"
                                />
                                Remember me
                            </label>
                            <span className="cursor-pointer hover:underline">
                                Need help?
                            </span>
                        </div>
                    </form>

                    {/* Toggle mode */}
                    <div className="mt-16 text-[#737373]">
                        {mode === "login" ? (
                            <p>
                                New to Neflix?{" "}
                                <button
                                    type="button"
                                    onClick={() => setMode("register")}
                                    className="text-white hover:underline"
                                >
                                    Sign up now
                                </button>
                                .
                            </p>
                        ) : (
                            <p>
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => setMode("login")}
                                    className="text-white hover:underline"
                                >
                                    Sign in
                                </button>
                                .
                            </p>
                        )}
                        <p className="mt-3 text-[13px]">
                            This page is protected by Google reCAPTCHA to ensure
                            you&apos;re not a bot.{" "}
                            <span className="cursor-pointer text-[#0071eb] hover:underline">
                                Learn more.
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
