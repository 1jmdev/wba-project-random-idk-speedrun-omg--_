import { Routes, Route } from "react-router"
import { useState } from "react"
import Browse from "@/pages/Browse"
import ProfileSelect from "@/pages/ProfileSelect"
import TitleDetail from "@/pages/TitleDetail"
import Search from "@/pages/Search"
import MyList from "@/pages/MyList"
import type { Profile } from "@/data/mock"

export default function App() {
    const [profile, setProfile] = useState<Profile | null>(null)

    if (!profile) {
        return <ProfileSelect onSelect={setProfile} />
    }

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Browse
                        profile={profile}
                        onSwitchProfile={() => setProfile(null)}
                    />
                }
            />
            <Route
                path="/title/:id"
                element={
                    <TitleDetail
                        profile={profile}
                        onSwitchProfile={() => setProfile(null)}
                    />
                }
            />
            <Route
                path="/search"
                element={
                    <Search
                        profile={profile}
                        onSwitchProfile={() => setProfile(null)}
                    />
                }
            />
            <Route
                path="/my-list"
                element={
                    <MyList
                        profile={profile}
                        onSwitchProfile={() => setProfile(null)}
                    />
                }
            />
            <Route
                path="/tv-shows"
                element={
                    <Browse
                        profile={profile}
                        onSwitchProfile={() => setProfile(null)}
                        filter="series"
                    />
                }
            />
            <Route
                path="/movies"
                element={
                    <Browse
                        profile={profile}
                        onSwitchProfile={() => setProfile(null)}
                        filter="movie"
                    />
                }
            />
            <Route
                path="/new"
                element={
                    <Browse
                        profile={profile}
                        onSwitchProfile={() => setProfile(null)}
                        filter="new"
                    />
                }
            />
        </Routes>
    )
}
