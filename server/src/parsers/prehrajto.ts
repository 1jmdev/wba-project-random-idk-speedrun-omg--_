const SOURCE_TAG_REGEX =
    /<source[^>]*src=["']([^"']+)["'][^>]*(?:res|label)=["']?(\d+)(?:p)?["']?[^>]*>/gi
const JWPLAYER_SOURCE_REGEX =
    /\{\s*file:\s*"([^"]+\.mp4[^"]*)"(?:,\s*label:\s*['"]?(\d+)(?:p)?['"]?)?/g
const CONTENT_URL_REGEX = /itemprop="contentUrl"\s+content="([^"]+\.mp4[^"]*)"/i
const FILE_NAME_REGEX =
    /<span[^>]*>\s*Název souboru:\s*<\/span>\s*<span[^>]*>([\s\S]*?)<\/span>/i
const DURATION_REGEX =
    /<span[^>]*>\s*Délka:\s*<\/span>\s*<span[^>]*>(\d{2}:\d{2}:\d{2})<\/span>/i

type SourceCandidate = {
    url: string
    resolution: number | null
}

export type PrehrajtoVideoSource = {
    duration: number | null
    rawVideoUrl: string | null
    title: string | null
}

export const parsePrehrajtoVideoSource = async (
    movieId: string
): Promise<PrehrajtoVideoSource> => {
    const prehrajtoUrl = new URL(`https://prehrajto.cz/${movieId}`)
    const response = await fetch(`https://corsproxy.io?key=${process.env.CORSPROXY_API_KEY}&url=${prehrajtoUrl}`)
    const html = await response.text()

    const sources = parseSources(html)

    if (sources.length === 0) {
        return {
            duration: parseDurationSeconds(html),
            rawVideoUrl: null,
            title: parseTitle(html),
        }
    }

    const bestSource = sources.reduce((bestMatch, currentMatch) => {
        const bestResolution = bestMatch.resolution ?? -1
        const currentResolution = currentMatch.resolution ?? -1

        return currentResolution > bestResolution ? currentMatch : bestMatch
    })

    const rawVideoUrl = decodeHtmlEntities(bestSource.url)

    return {
        duration: parseDurationSeconds(html),
        rawVideoUrl,
        title: parseTitle(html),
    }
}

const parseSources = (html: string): SourceCandidate[] => {
    const tagSources = Array.from(
        html.matchAll(SOURCE_TAG_REGEX),
        ([, url, resolution]) => ({
            url,
            resolution: Number(resolution),
        })
    )

    const jwPlayerSources = Array.from(
        html.matchAll(JWPLAYER_SOURCE_REGEX),
        ([, url, resolution]) => ({
            url,
            resolution: resolution == null ? null : Number(resolution),
        })
    )

    const contentUrl = html.match(CONTENT_URL_REGEX)?.[1]
    const fallbackSources =
        contentUrl == null ? [] : [{ url: contentUrl, resolution: null }]

    return dedupeSources([
        ...tagSources,
        ...jwPlayerSources,
        ...fallbackSources,
    ])
}

const dedupeSources = (sources: SourceCandidate[]): SourceCandidate[] => {
    const seen = new Set<string>()

    return sources.filter((source) => {
        const normalizedUrl = decodeHtmlEntities(source.url)

        if (seen.has(normalizedUrl)) {
            return false
        }

        source.url = normalizedUrl
        seen.add(normalizedUrl)
        return true
    })
}

const decodeHtmlEntities = (value: string): string =>
    value
        .replaceAll("&amp;", "&")
        .replaceAll("&quot;", '"')
        .replaceAll("&#39;", "'")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&nbsp;", " ")

const parseTitle = (html: string): string | null => {
    const match = html.match(FILE_NAME_REGEX)

    if (match == null) {
        return null
    }

    return stripHtml(decodeHtmlEntities(match[1]))
}

const parseDurationSeconds = (html: string): number | null => {
    const rawDuration = html.match(DURATION_REGEX)?.[1]

    return parseClockToSeconds(rawDuration)
}

const parseClockToSeconds = (
    rawDuration: string | undefined
): number | null => {
    if (rawDuration == null) {
        return null
    }

    const parts = rawDuration.split(":").map((value) => Number(value))

    if (parts.length !== 3 || parts.some((value) => Number.isNaN(value))) {
        return null
    }

    const [hours, minutes, seconds] = parts

    return hours * 3600 + minutes * 60 + seconds
}

const stripHtml = (value: string): string =>
    value
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
