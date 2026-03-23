import type { Context, Next } from "hono"
import type { AppEnv } from "../types"

const createRequestId = () => crypto.randomUUID()

export const loggerMiddleware = async (c: Context<AppEnv>, next: Next) => {
    const requestId = c.req.header("x-request-id") ?? createRequestId()
    const start = performance.now()

    c.set("requestId", requestId)
    c.header("x-request-id", requestId)

    await next()

    const duration = Math.round(performance.now() - start)

    console.info(
        JSON.stringify({
            requestId,
            method: c.req.method,
            path: c.req.path,
            status: c.res.status,
            durationMs: duration,
        })
    )
}
