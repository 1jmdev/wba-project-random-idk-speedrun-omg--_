import {
    ArrowLeft,
    Maximize,
    Minimize,
    Pause,
    Play,
    Volume2,
    VolumeX,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import NeflixLogo from "@/components/NeflixLogo"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { mapMovie } from "@/lib/neflix"

interface StreamState {
    url: string | null
    title: string
    loading: boolean
    error: string | null
}

export default function Player() {
    const { id } = useParams()
    const navigate = useNavigate()

    const videoRef = useRef<HTMLVideoElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    )

    const [stream, setStream] = useState<StreamState>({
        url: null,
        title: "",
        loading: true,
        error: null,
    })
    const [movieTitle, setMovieTitle] = useState("")

    const [playing, setPlaying] = useState(false)
    const [muted, setMuted] = useState(false)
    const [volume, setVolume] = useState(1)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [fullscreen, setFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)

    useEffect(() => {
        const movieId = Number(id)
        if (!movieId) return

        const load = async () => {
            setStream({ url: null, title: "", loading: true, error: null })

            try {
                const [apiMovie, streamData] = await Promise.all([
                    apiClient.getMovie(movieId),
                    apiClient.getMovieStream(movieId),
                ])

                const mapped = mapMovie(apiMovie)
                setMovieTitle(mapped.title)
                setStream({
                    url: streamData.url,
                    title: streamData.title,
                    loading: false,
                    error: null,
                })
            } catch {
                setStream({
                    url: null,
                    title: "",
                    loading: false,
                    error: "Could not load video source. The title may not be available for streaming.",
                })
            }
        }

        void load()
    }, [id])

    const resetControlsTimer = useCallback(() => {
        setShowControls(true)
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current)
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (playing) setShowControls(false)
        }, 3000)
    }, [playing])

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
            }
        }
    }, [])

    const togglePlay = useCallback(() => {
        const video = videoRef.current
        if (!video) return
        if (video.paused) {
            void video.play()
        } else {
            video.pause()
        }
    }, [])

    const seekBy = useCallback(
        (seconds: number) => {
            const video = videoRef.current
            if (!video) return
            video.currentTime = Math.max(
                0,
                Math.min(video.duration || 0, video.currentTime + seconds)
            )
            setCurrentTime(video.currentTime)
            resetControlsTimer()
        },
        [resetControlsTimer]
    )

    const adjustVolume = useCallback(
        (delta: number) => {
            const video = videoRef.current
            if (!video) return
            const next = Math.max(0, Math.min(1, video.volume + delta))
            video.volume = next
            setVolume(next)
            if (next > 0 && video.muted) {
                video.muted = false
                setMuted(false)
            }
            resetControlsTimer()
        },
        [resetControlsTimer]
    )

    const toggleMute = useCallback(() => {
        const video = videoRef.current
        if (!video) return
        video.muted = !video.muted
        setMuted(video.muted)
    }, [])

    const handleVolumeChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const video = videoRef.current
            if (!video) return
            const val = Number(e.target.value)
            video.volume = val
            setVolume(val)
            if (val === 0) {
                video.muted = true
                setMuted(true)
            } else if (video.muted) {
                video.muted = false
                setMuted(false)
            }
        },
        []
    )

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current
        if (!video) return
        const val = Number(e.target.value)
        video.currentTime = val
        setCurrentTime(val)
    }, [])

    const toggleFullscreen = useCallback(async () => {
        const el = containerRef.current
        if (!el) return
        if (!document.fullscreenElement) {
            await el.requestFullscreen()
            setFullscreen(true)
        } else {
            await document.exitFullscreen()
            setFullscreen(false)
        }
    }, [])

    // Keyboard controls: Space, Arrows, M, F, J/K/L
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement).tagName
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
                return
            }

            switch (e.code) {
                case "Space":
                case "KeyK": {
                    e.preventDefault()
                    togglePlay()
                    break
                }
                case "ArrowLeft":
                case "KeyJ": {
                    e.preventDefault()
                    seekBy(-10)
                    break
                }
                case "ArrowRight":
                case "KeyL": {
                    e.preventDefault()
                    seekBy(10)
                    break
                }
                case "ArrowUp": {
                    e.preventDefault()
                    adjustVolume(0.05)
                    break
                }
                case "ArrowDown": {
                    e.preventDefault()
                    adjustVolume(-0.05)
                    break
                }
                case "KeyM": {
                    e.preventDefault()
                    toggleMute()
                    break
                }
                case "KeyF": {
                    e.preventDefault()
                    void toggleFullscreen()
                    break
                }
                default:
                    break
            }
        }
        document.addEventListener("keydown", onKeyDown)
        return () => document.removeEventListener("keydown", onKeyDown)
    }, [togglePlay, seekBy, adjustVolume, toggleMute, toggleFullscreen])

    const formatTime = (seconds: number) => {
        if (!Number.isFinite(seconds)) return "0:00"
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = Math.floor(seconds % 60)
        if (h > 0)
            return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        return `${m}:${String(s).padStart(2, "0")}`
    }

    if (stream.loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black">
                <div className="neflix-pulse">
                    <NeflixLogo className="h-10" />
                </div>
                <p className="text-xs text-white/40">
                    {movieTitle || "Loading..."}
                </p>
            </div>
        )
    }

    if (stream.error || !stream.url) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6 text-center">
                <NeflixLogo className="h-8" />
                <p className="max-w-md text-base text-white/70">
                    {stream.error ?? "Video not available"}
                </p>
                <Button
                    variant="outline"
                    size="lg"
                    className="mt-2 rounded-full"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Go back
                </Button>
            </div>
        )
    }

    const progressPct = duration ? (currentTime / duration) * 100 : 0

    return (
        <div
            ref={containerRef}
            className="relative flex min-h-screen items-center justify-center bg-black"
        >
            {/* Invisible play/pause click target behind the video */}
            <Button
                variant="ghost"
                aria-label={playing ? "Pause" : "Play"}
                className="absolute inset-0 h-full w-full cursor-default rounded-none opacity-0"
                onClick={togglePlay}
            />

            {/* Video */}
            {/* biome-ignore lint/a11y/useMediaCaption: provider content has no caption track */}
            <video
                ref={videoRef}
                src={stream.url}
                className="relative h-screen w-full object-contain"
                onMouseMove={resetControlsTimer}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onTimeUpdate={() =>
                    setCurrentTime(videoRef.current?.currentTime ?? 0)
                }
                onDurationChange={() =>
                    setDuration(videoRef.current?.duration ?? 0)
                }
                onVolumeChange={() => {
                    setMuted(videoRef.current?.muted ?? false)
                    setVolume(videoRef.current?.volume ?? 1)
                }}
            />

            {/* Controls overlay — pointer-events disabled on the wrapper so only explicit interactive children capture events */}
            <div
                className={`pointer-events-none absolute inset-0 flex flex-col justify-between bg-linear-to-b from-black/70 via-transparent to-black/80 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
            >
                {/* Top bar */}
                <div className="pointer-events-auto flex items-center gap-3 px-4 py-4 md:px-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-black/50 text-white hover:bg-black/80"
                        onClick={() => navigate(-1)}
                        aria-label="Back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <p className="truncate text-sm font-semibold text-white md:text-base">
                        {movieTitle}
                    </p>
                </div>

                {/* Bottom controls */}
                <div className="pointer-events-auto space-y-2 px-4 pb-4 md:px-8 md:pb-6">
                    {/* Seek bar */}
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.5}
                        value={currentTime}
                        onChange={handleSeek}
                        aria-label="Seek"
                        className="w-full cursor-pointer"
                        style={{
                            accentColor: "#e50914",
                            background: `linear-gradient(to right, #e50914 ${progressPct}%, rgba(255,255,255,0.3) ${progressPct}%)`,
                        }}
                    />

                    <div className="flex items-center justify-between">
                        {/* Play/pause + volume */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="default"
                                size="icon-lg"
                                className="rounded-full"
                                onClick={togglePlay}
                                aria-label={playing ? "Pause" : "Play"}
                            >
                                {playing ? (
                                    <Pause className="h-5 w-5 fill-black" />
                                ) : (
                                    <Play className="h-5 w-5 fill-black ml-0.5" />
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white"
                                onClick={toggleMute}
                                aria-label={muted ? "Unmute" : "Mute"}
                            >
                                {muted || volume === 0 ? (
                                    <VolumeX className="h-5 w-5" />
                                ) : (
                                    <Volume2 className="h-5 w-5" />
                                )}
                            </Button>

                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={muted ? 0 : volume}
                                onChange={handleVolumeChange}
                                aria-label="Volume"
                                className="w-20 cursor-pointer md:w-28"
                                style={{ accentColor: "#ffffff" }}
                            />

                            <span className="text-xs text-white/70 tabular-nums">
                                {formatTime(currentTime)}
                                {" / "}
                                {formatTime(duration)}
                            </span>
                        </div>

                        {/* Fullscreen */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white"
                            onClick={toggleFullscreen}
                            aria-label={
                                fullscreen ? "Exit fullscreen" : "Fullscreen"
                            }
                        >
                            {fullscreen ? (
                                <Minimize className="h-5 w-5" />
                            ) : (
                                <Maximize className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Centre play button — clickable when paused */}
            {!playing && showControls && (
                <Button
                    variant="default"
                    aria-label="Play"
                    onClick={togglePlay}
                    className="absolute h-20 w-20 rounded-full"
                >
                    <Play className="size-7 fill-black ml-0.5" />
                </Button>
            )}
        </div>
    )
}
