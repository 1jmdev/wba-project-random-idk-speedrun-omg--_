import { Hono } from "hono"
import { cors } from "hono/cors"
import { loggerMiddleware } from "./src/middleware/logger.middleware"
import familyRouter from "./src/routes/family.route"
import movieRouter from "./src/routes/movie.route"
import profileRouter from "./src/routes/profile.route"
import type { AppEnv } from "./src/types"
import { toErrorResponse } from "./src/utils/error"

const app = new Hono<AppEnv>()

app.use(
    "*",
    cors({
        origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
        credentials: true,
    })
)
app.use("*", loggerMiddleware)

app.get("/", (c) =>
    c.json({
        success: true,
        message: "Netflix clone API is running",
    })
)
app.get("/health", (c) =>
    c.json({
        success: true,
        timestamp: new Date().toISOString(),
    })
)

app.route("/api/families", familyRouter)
app.route("/api/profiles", profileRouter)
app.route("/api/movies", movieRouter)

app.notFound((c) =>
    c.json(
        {
            success: false,
            message: "Route not found",
        },
        404
    )
)

app.onError((error, c) => {
    const response = toErrorResponse(error)
    return c.json(response.body, response.status as 500)
})

export default app
