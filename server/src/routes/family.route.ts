import { Hono } from "hono"
import * as familyController from "../controllers/family.controller"
import { authRequired } from "../middleware/auth.middleware"
import { validate } from "../middleware/validation.middleware"
import type { AppEnv } from "../types"
import {
    changePasswordSchema,
    loginSchema,
    registerSchema,
} from "../validations/family.validation"

const router = new Hono<AppEnv>()

router.post("/register", validate(registerSchema), familyController.register)
router.post("/login", validate(loginSchema), familyController.login)
router.post("/logout", familyController.logout)
router.get("/me", authRequired, familyController.me)
router.post(
    "/change-password",
    authRequired,
    validate(changePasswordSchema),
    familyController.changePassword
)

export default router
