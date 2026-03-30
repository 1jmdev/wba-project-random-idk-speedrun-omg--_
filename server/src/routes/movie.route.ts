import { Hono } from "hono"
import * as movieController from "../controllers/movie.controller"
import { authRequired } from "../middleware/auth.middleware"
import { validate } from "../middleware/validation.middleware"
import type { AppEnv } from "../types"
import {
    browseHomeQuerySchema,
    createMovieSchema,
    listMoviesQuerySchema,
    movieIdParamSchema,
    movieStreamParamSchema,
    updateMovieSchema,
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

router.post(
    "/",
    authRequired,
    validate(createMovieSchema),
    movieController.create
)
router.patch(
    "/:id",
    authRequired,
    validate(movieIdParamSchema),
    validate(updateMovieSchema),
    movieController.update
)
router.delete(
    "/:id",
    authRequired,
    validate(movieIdParamSchema),
    movieController.remove
)

export default router
