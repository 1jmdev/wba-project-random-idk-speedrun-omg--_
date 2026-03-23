import { Hono } from 'hono';
import * as authController from '../controllers/family.controller';
import { validate } from '../middlewares/validation.middleware';
import { authRequired } from '../middlewares/auth.middleware';
import {
    loginSchema,
    changePasswordSchema,
} from '../validations/family.validation';
import type { AppEnv } from '../types';

const router = new Hono<AppEnv>();

// Public
router.post(
    '/login',
    validate(loginSchema),
    authController.login
);

// Protected
router.post('/logout', authController.logout);

router.get('/me', authRequired, authController.me);

router.post(
    '/change-password',
    validate(changePasswordSchema),
    authRequired,
    authController.changePassword
);

export default router;