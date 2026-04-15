interface NetflixLogoProps {
    className?: string
}

export default function NetflixLogo({ className = "h-6" }: NetflixLogoProps) {
    return (
        <img src="/neflix-logo.webp" className={className} />
    )
}
