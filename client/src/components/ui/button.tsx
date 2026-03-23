import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap font-semibold transition-all duration-200 outline-none select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default:
                    "bg-white text-black hover:bg-white/75 active:bg-white/60 rounded-[4px]",
                netflix:
                    "bg-[#e50914] text-white hover:bg-[#c11119] active:bg-[#a00d12] rounded-[4px]",
                secondary:
                    "bg-[rgba(109,109,110,0.7)] text-white hover:bg-[rgba(109,109,110,0.4)] active:bg-[rgba(109,109,110,0.3)] rounded-[4px]",
                outline:
                    "border border-[rgba(255,255,255,0.5)] bg-transparent text-white hover:border-white hover:bg-[rgba(255,255,255,0.05)] rounded-[4px]",
                ghost:
                    "text-white hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.05)] rounded-[4px]",
                destructive:
                    "bg-[#e50914] text-white hover:bg-[#c11119] active:bg-[#a00d12] rounded-[4px]",
                link:
                    "text-white underline-offset-4 hover:underline hover:text-[#e5e5e5]",
            },
            size: {
                default: "h-9 gap-2 px-4 text-sm",
                xs: "h-6 gap-1 px-2 text-xs",
                sm: "h-8 gap-1.5 px-3 text-sm",
                lg: "h-11 gap-2 px-6 text-base",
                xl: "h-12 gap-2 px-8 text-base",
                icon: "size-9",
                "icon-xs": "size-6",
                "icon-sm": "size-8",
                "icon-lg": "size-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

function Button({
    className,
    variant = "default",
    size = "default",
    ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
    return (
        <ButtonPrimitive
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Button, buttonVariants }
