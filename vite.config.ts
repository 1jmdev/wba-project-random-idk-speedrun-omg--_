import { cloudflare } from "@cloudflare/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
    root: path.resolve(__dirname, "client"),
    plugins: [cloudflare(), react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "client/src"),
        },
    },
    build: {
        outDir: path.resolve(__dirname, "dist"),
        emptyOutDir: true,
    },
})
