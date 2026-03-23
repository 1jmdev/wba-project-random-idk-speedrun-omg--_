import { Hono } from "hono"
import * as profileController from "../controllers/profile.controller"
import { authRequired } from "../middleware/auth.middleware"
import { validate } from "../middleware/validation.middleware"
import type { AppEnv } from "../types"
import {
    createProfileSchema,
    profileIdParamSchema,
    updateProfileSchema,
} from "../validations/profile.validation"

const router = new Hono<AppEnv>()

router.use("*", authRequired)

router.get("/", profileController.list)
router.get("/:id", validate(profileIdParamSchema), profileController.getById)
router.post("/", validate(createProfileSchema), profileController.create)
router.patch(
    "/:id",
    validate(profileIdParamSchema),
    validate(updateProfileSchema),
    profileController.update
)
router.delete("/:id", validate(profileIdParamSchema), profileController.remove)
router.post(
    "/:id/select",
    validate(profileIdParamSchema),
    profileController.selectProfile
)
router.post("/clear-selection", profileController.clearSelectedProfile)

export default router
