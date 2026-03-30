import type { Context, Next } from "hono"
import type { ZodIssue, ZodObject, ZodRawShape } from "zod"

const convertQueryParams = (
    obj: Record<string, unknown> | string[] | undefined
) => {
    if (!obj || typeof obj !== "object") return obj

    const converted: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
        // 1. Handle Numbers
        if (
            typeof value === "string" &&
            !Number.isNaN(Number(value)) &&
            value !== ""
        ) {
            converted[key] = Number(value)
        }
        // 2. Handle Booleans (Add this block)
        else if (value === "true") {
            converted[key] = true
        } else if (value === "false") {
            converted[key] = false
        }
        // 3. Keep as string
        else {
            converted[key] = value
        }
    }
    return converted
}

export const validate = (schema: ZodObject<ZodRawShape>) => {
    return async (c: Context, next: Next) => {
        try {
            let body = {}
            if (c.req.header("content-type") === "application/json") {
                try {
                    body = await c.req.json()
                } catch {
                    // Invalid JSON or empty body
                }
            }

            const query = c.req.query()
            const params = c.req.param()
            const headers = c.req.header()

            const result = schema.safeParse({
                body,
                query: convertQueryParams(query),
                params: convertQueryParams(params),
                headers,
            })

            if (!result.success) {
                const errors: Record<string, string> = {}

                result.error.issues.forEach((issue: ZodIssue) => {
                    const path = issue.path.join(".")
                    errors[path] = issue.message
                })

                console.log({
                    "validation.failed": true,
                    "validation.errors": errors,
                })

                return c.json(
                    {
                        success: false,
                        errors,
                    },
                    400
                )
            }

            // Store validated data in context
            c.set("validated", result.data)

            await next()
        } catch (error: unknown) {
            const errorObj = error as Error
            console.log({
                error: "validation_middleware_error",
                "error.message": errorObj.message,
                "error.stack": errorObj.stack,
                "error.name": errorObj.name,
            })
            return c.json(
                {
                    success: false,
                    message: "Internal server error",
                },
                500
            )
        }
    }
}
