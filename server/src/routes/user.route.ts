import { Hono } from 'hono';
import * as userController from '../controllers/user.controller';
import { rateLimiter } from '../middlewares/ratelimit.middleware';
import { validate } from '../middlewares/validation.middleware';
import { authRequired, adminRequired } from '../middlewares/auth.middleware';
import {
    inviteUserSchema,
    listUsersQuerySchema,
    userIdParamSchema,
    updateUserBodySchema,
    resetUserPasswordBodySchema,
} from '../validations/user.validation';
import { AppEnv } from '../types';

const router = new Hono<AppEnv>();

router.use('*', authRequired, adminRequired);

router.post(
    '/invite',
    validate(inviteUserSchema),
    rateLimiter(25, '10 s'),
    userController.invite
);
router.get(
    '/list',
    validate(listUsersQuerySchema),
    rateLimiter(50, '10 s'),
    userController.listUsers
);
router.get(
    '/:id',
    validate(userIdParamSchema),
    rateLimiter(25, '10 s'),
    userController.getUser
);
router.put(
    '/:id',
    validate(userIdParamSchema),
    validate(updateUserBodySchema),
    rateLimiter(20, '10 s'),
    userController.updateUser
);
router.delete(
    '/:id',
    validate(userIdParamSchema),
    rateLimiter(15, '10 s'),
    userController.deleteUser
);
router.post(
    '/:id/reset-password',
    validate(userIdParamSchema),
    validate(resetUserPasswordBodySchema),
    rateLimiter(10, '10 s'),
    userController.resetUserPassword
);

export default router;