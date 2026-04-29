import { Hono } from "hono"
import * as movieController from "../controllers/movie.controller"
import { validate } from "../middleware/validation.middleware"
import type { AppEnv } from "../types"
import {
    browseHomeQuerySchema,
    listMoviesQuerySchema,
    movieIdParamSchema,
    movieStreamParamSchema,
} from "../validations/movie.validation"

const router = new Hono<AppEnv>()

router.get("/", validate(listMoviesQuerySchema), movieController.list)
router.get(
    "/browse/home",
    validate(browseHomeQuerySchema),
    movieController.browseHome
)
router.get("/featured", movieController.featured)
router.get("/genres", movieController.listGenres)
router.get("/:id", validate(movieIdParamSchema), movieController.getById)
router.get(
    "/:id/stream",
    validate(movieStreamParamSchema),
    movieController.stream
)

export default router
