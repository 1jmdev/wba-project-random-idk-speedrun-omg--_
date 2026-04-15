import { useCallback, useEffect, useState } from "react"
import { Route, Routes } from "react-router"
import { ApiError, type ApiFamily, apiClient } from "@/lib/api"
import { mapProfile, type Profile } from "@/lib/netflix"
import NetflixLogo from "@/components/NetflixLogo"
import AuthScreen from "@/pages/AuthScreen"
import Browse from "@/pages/Browse"
import MyList from "@/pages/MyList"
import Player from "@/pages/Player"
import ProfileSelect from "@/pages/ProfileSelect"
import Search from "@/pages/Search"
import TitleDetail from "@/pages/TitleDetail"

export default function App() {
    const [family, setFamily] = useState<ApiFamily | null>(null)
    const [loading, setLoading] = useState(true)
    const [authLoading, setAuthLoading] = useState(false)
    const [authError, setAuthError] = useState<string | null>(null)
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [profile, setProfile] = useState<Profile | null>(null)

    const loadSession = useCallback(async () => {
        setLoading(true)

        try {
            const session = await apiClient.getMe()
            const mappedProfiles = session.profiles.map(mapProfile)

            setFamily(session.family)
            setProfiles(mappedProfiles)
            setProfile(
                session.selectedProfile
                    ? mapProfile(session.selectedProfile)
                    : null
            )
            setAuthError(null)
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                setFamily(null)
                setProfiles([])
                setProfile(null)
                setAuthError(null)
            } else {
                setAuthError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load session"
                )
            }
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadSession()
    }, [loadSession])

    const handleLogin = async (payload: {
        email: string
        password: string
    }) => {
        setAuthLoading(true)
        setAuthError(null)

        try {
            await apiClient.login(payload)
            await loadSession()
        } catch (error) {
            setAuthError(
                error instanceof Error ? error.message : "Login failed"
            )
        } finally {
            setAuthLoading(false)
        }
    }

    const handleRegister = async (payload: {
        email: string
        password: string
    }) => {
        setAuthLoading(true)
        setAuthError(null)

        try {
            await apiClient.register(payload)
            await loadSession()
        } catch (error) {
            setAuthError(
                error instanceof Error ? error.message : "Registration failed"
            )
        } finally {
            setAuthLoading(false)
        }
    }

    const handleSelectProfile = async (nextProfile: Profile) => {
        await apiClient.selectProfile(nextProfile.id)
        setProfile(nextProfile)
    }

    const handleCreateProfile = async (payload: { name: string }) => {
        await apiClient.createProfile(payload)
        await loadSession()
    }

    const handleDeleteProfile = async (profileId: number) => {
        await apiClient.deleteProfile(profileId)
        await loadSession()
    }

    const handleSwitchProfile = async () => {
        await apiClient.clearSelectedProfile()
        await loadSession()
    }

    const handleLogout = async () => {
        await apiClient.logout()
        setFamily(null)
        setProfiles([])
        setProfile(null)
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-netflix-black">
                <div className="netflix-pulse">
                    <NetflixLogo className="h-12 md:h-16" />
                </div>
            </div>
        )
    }

    if (!family) {
        return (
            <AuthScreen
                onLogin={handleLogin}
                onRegister={handleRegister}
                loading={authLoading}
                error={authError}
            />
        )
    }

    if (!profile) {
        return (
            <ProfileSelect
                profiles={profiles}
                onSelect={handleSelectProfile}
                onCreateProfile={handleCreateProfile}
                onDeleteProfile={handleDeleteProfile}
                onLogout={handleLogout}
            />
        )
    }

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Browse
                        profile={profile}
                        onSwitchProfile={handleSwitchProfile}
                        onLogout={handleLogout}
                    />
                }
            />
            <Route
                path="/title/:id"
                element={
                    <TitleDetail
                        profile={profile}
                        onSwitchProfile={handleSwitchProfile}
                        onLogout={handleLogout}
                    />
                }
            />
            <Route
                path="/search"
                element={
                    <Search
                        profile={profile}
                        onSwitchProfile={handleSwitchProfile}
                        onLogout={handleLogout}
                    />
                }
            />
            <Route
                path="/my-list"
                element={
                    <MyList
                        profile={profile}
                        onSwitchProfile={handleSwitchProfile}
                        onLogout={handleLogout}
                    />
                }
            />
            <Route
                path="/tv-shows"
                element={
                    <Browse
                        profile={profile}
                        onSwitchProfile={handleSwitchProfile}
                        onLogout={handleLogout}
                        filter="series"
                    />
                }
            />
            <Route
                path="/movies"
                element={
                    <Browse
                        profile={profile}
                        onSwitchProfile={handleSwitchProfile}
                        onLogout={handleLogout}
                        filter="movie"
                    />
                }
            />
            <Route
                path="/new"
                element={
                    <Browse
                        profile={profile}
                        onSwitchProfile={handleSwitchProfile}
                        onLogout={handleLogout}
                        filter="new"
                    />
                }
            />
            <Route path="/watch/:id" element={<Player />} />
        </Routes>
    )
}
