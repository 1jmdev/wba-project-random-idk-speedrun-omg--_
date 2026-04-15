import tailwind from "bun-plugin-tailwind"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"

const projectUrl = new URL("../", import.meta.url)
const outDir = new URL("dist/", projectUrl).pathname
const entrypointPath = new URL("client/index.html", projectUrl).pathname
const publicDir = new URL("client/public/", projectUrl).pathname

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
        await injectPublicStylesheet()
        await copyPublicAssets()
        return
    }

    for (const log of result.logs) {
        console.error(log)
    }

    process.exitCode = 1
}

async function copyPublicAssets(): Promise<void> {
    await copyDirectory(publicDir, outDir)
}

async function injectPublicStylesheet(): Promise<void> {
    const indexPath = `${outDir}index.html`
    const html = await readFile(indexPath, "utf8")
    const stylesheetTag = '<link rel="stylesheet" href="./fonts.css">'

    if (html.includes(stylesheetTag)) {
        return
    }

    await writeFile(
        indexPath,
        html.replace("</head>", `${stylesheetTag}</head>`)
    )
}

async function copyDirectory(fromDir: string, toDir: string): Promise<void> {
    await mkdir(toDir, { recursive: true })

    for (const entry of await readdir(fromDir, { withFileTypes: true })) {
        const sourcePath = `${fromDir}${entry.name}`
        const targetPath = `${toDir}${entry.name}`

        if (entry.isDirectory()) {
            await copyDirectory(`${sourcePath}/`, `${targetPath}/`)
            continue
        }

        await Bun.write(targetPath, Bun.file(sourcePath))
    }
}

await main()
