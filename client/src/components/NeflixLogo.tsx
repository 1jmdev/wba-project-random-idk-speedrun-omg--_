interface NeflixLogoProps {
    className?: string
}

export default function NeflixLogo({ className = "h-6" }: NeflixLogoProps) {
    return (
        <img src="/neflix-logo.webp" className={className} />
    )
}
