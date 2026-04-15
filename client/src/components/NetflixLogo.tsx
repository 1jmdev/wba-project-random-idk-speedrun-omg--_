interface NetflixLogoProps {
    className?: string
}

export default function NetflixLogo({ className = "h-6" }: NetflixLogoProps) {
    return (
        <svg
            viewBox="0 0 111 30"
            className={`fill-netflix-red ${className}`}
            aria-label="Netflix"
        >
            <path
                d="M105.062,14.28 L111,30 C109.249,29.75 107.5,29.437 105.718,29.151 L102.374,20.429 L99.299,29.151 C97.577,29.37 95.796,29.653 94.064,29.871 L99.993,14.281 L94.247,0 L99.299,0 L102.374,8.753 L105.449,0 L110.5,0 L105.062,14.28 Z"
                fill="currentColor"
            />
            <path
                d="M90.469,0 L90.469,26.731 C88.719,26.95 86.936,27.201 85.186,27.483 L85.186,0 L90.469,0 Z"
                fill="currentColor"
            />
            <path
                d="M81.846,0 L76.563,0 L76.563,27.983 C78.281,27.735 80.063,27.485 81.846,27.267 L81.846,0 Z"
                fill="currentColor"
            />
            <path
                d="M73.248,0 L67.966,0 L67.966,28.556 C69.748,28.377 71.531,28.215 73.248,28.075 L73.248,0 Z"
                fill="currentColor"
            />
            <path
                d="M52.5,7.846 L52.5,30 L47.217,30 L47.217,7.846 L42.689,7.846 L42.689,3.669 L56.724,3.669 L56.724,7.846 L52.5,7.846 Z"
                fill="currentColor"
            />
            <path
                d="M30.0,0 L24.717,0 L24.717,12.614 L18.303,0 L13.5,0 L13.5,24.938 C11.951,24.674 10.397,24.453 8.837,24.278 L8.837,0 L3.554,0 L3.554,23.775 C2.369,23.7 1.185,23.649 0,23.626 L0,0 L3.554,0"
                fill="currentColor"
            />
        </svg>
    )
}
