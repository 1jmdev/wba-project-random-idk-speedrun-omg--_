import tailwind from "bun-plugin-tailwind"

const projectUrl = new URL("../", import.meta.url)
const outDir = new URL("dist/", projectUrl).pathname
const entrypointPath = new URL("client/index.html", projectUrl).pathname

async function main(): Promise<void> {
    const result = await Bun.build({
        entrypoints: [entrypointPath],
        outdir: outDir,
        target: "browser",
        minify: true,
        sourcemap: "none",
        packages: "bundle",
        plugins: [tailwind],
    })

    if (result.success) {
        return
    }

    for (const log of result.logs) {
        console.error(log)
    }

    process.exitCode = 1
}

await main()
