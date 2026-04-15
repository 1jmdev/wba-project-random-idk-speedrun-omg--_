type ProxyEnv = {
    PROXY_API_KEY: string
}

const API_KEY_HEADER = "x-api-key"

function createForwardHeaders(request: Request, url: URL): Headers {
    const bodyAllowed = request.method !== "GET" && request.method !== "HEAD"
    const defaultHeaders = new Request(url.toString(), {
        method: request.method,
        body: bodyAllowed ? request.body : undefined,
    }).headers
    const headers = new Headers()

    for (const [name, value] of request.headers) {
        if (name === API_KEY_HEADER || name === "host") {
            continue
        }

        if (defaultHeaders.has(name)) {
            continue
        }

        headers.set(name, value)
    }

    return headers
}

function createResponse(message: string, status: number): Response {
    return new Response(message, { status })
}

export default {
    async fetch(request: Request, env: ProxyEnv): Promise<Response> {
        const apiKey = request.headers.get(API_KEY_HEADER)

        if (apiKey === null || apiKey !== env.PROXY_API_KEY) {
            return createResponse("Unauthorized", 401)
        }

        const requestUrl = new URL(request.url)
        const target = requestUrl.searchParams.get("url")

        if (target === null || target.length === 0) {
            return createResponse("Missing url query parameter", 400)
        }

        let targetUrl: URL
        try {
            targetUrl = new URL(target)
        } catch {
            return createResponse("Invalid url query parameter", 400)
        }

        if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
            return createResponse("Only http and https URLs are supported", 400)
        }

        const bodyAllowed =
            request.method !== "GET" && request.method !== "HEAD"
        const upstreamResponse = await fetch(targetUrl, {
            method: request.method,
            headers: createForwardHeaders(request, targetUrl),
            body: bodyAllowed ? request.body : undefined,
            redirect: "manual",
        })

        return new Response(upstreamResponse.body, {
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
            headers: upstreamResponse.headers,
        })
    },
} satisfies ExportedHandler<ProxyEnv>
