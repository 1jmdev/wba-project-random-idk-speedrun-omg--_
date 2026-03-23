import type { Context, Next } from "hono"
import type { ZodObject, ZodRawShape } from "zod"

const convertValues = (input: Record<string, string>) => {
    const output: Record<string, string | number | boolean> = {}

    for (const [key, value] of Object.entries(input)) {
        if (value === "true") {
            output[key] = true
            continue
        }

        if (value === "false") {
            output[key] = false
            continue
        }

        if (value !== "" && !Number.isNaN(Number(value))) {
            output[key] = Number(value)
            continue
        }

        output[key] = value
    }

    return output
}

export const validate = (schema: ZodObject<ZodRawShape>) => {
    return async (c: Context, next: Next) => {
        let body: unknown = {}

        if (c.req.header("content-type")?.includes("application/json")) {
            try {
                body = await c.req.json()
            } catch {
                body = {}
            }
        }

        const result = schema.safeParse({
            body,
            query: convertValues(c.req.query()),
            params: convertValues(c.req.param()),
            headers: c.req.header(),
        })

        if (!result.success) {
            const errors = Object.fromEntries(
                result.error.issues.map((issue) => [
                    issue.path.join("."),
                    issue.message,
                ])
            )

            return c.json(
                {
                    success: false,
                    errors,
                },
                400
            )
        }

        c.set("validated", result.data)
        await next()
    }
}
