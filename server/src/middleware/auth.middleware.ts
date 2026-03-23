import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';
import prisma from '../lib/db';
import { setAccessTokenCookie, clearAuthCookies } from '../utils/cookie';
import { generateAccessToken, generateRefreshTokenHash } from '../utils/token';
import { logs } from '../utils/logger';
import { env } from '../config/env';
import { AuthPayload, User } from '../types';

export const authRequired = async (c: Context, next: Next) => {
    const accessToken = getCookie(c, 'accessToken');
    const refreshToken = getCookie(c, 'refreshToken');

    try {
        if (accessToken) {
            const decoded = jwt.verify(
                accessToken,
                env.jwtAccessSecret
            ) as AuthPayload;

            const user: User = {
                id: decoded.sub,
                email: decoded.email,
                role: decoded.role,
                organizationId: decoded.orgId,
                status: decoded.status,
            };

            c.set('user', user);
            return next();
        }
    } catch {
        // Fallthrough to refresh logic
    }

    if (!refreshToken) {
        logs(c, { 'auth.error': 'no_token_found' });
        return c.json({ message: 'Unauthorized: No token found' }, 401);
    }

    try {
        jwt.verify(refreshToken, env.jwtRefreshSecret);

        const tokenHash = generateRefreshTokenHash(refreshToken);

        const storedToken = await prisma.refreshToken.findUnique({
            where: {
                tokenHash: tokenHash,
            },
            include: {
                user: true,
            },
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            logs(c, {
                'auth.error': 'invalid_session',
                'auth.expired': !!(
                    storedToken && storedToken.expiresAt < new Date()
                ),
                'auth.token_found': !!storedToken,
            });
            clearAuthCookies(c);
            return c.json({ message: 'Unauthorized: Invalid session' }, 403);
        }

        // Map Prisma user to our User type
        const user: User = {
            id: storedToken.user.id,
            email: storedToken.user.email,
            role: storedToken.user.role,
            organizationId: storedToken.user.organizationId || undefined, // Handle null vs undefined
            status: storedToken.user.status,
        };

        const newAccessToken = generateAccessToken(user);

        // 6. Set New Cookie
        setAccessTokenCookie(c, newAccessToken);

        c.set('user', user);

        logs(c, {
            'auth.success': true,
            'auth.refresh': true,
            'user.id': user.id,
            'user.role': user.role,
            'user.status': user.status,
        });

        return next();
    } catch (error) {
        logs(c, { 'auth.error': 'exception_during_refresh' });
        logs(c, { 'auth.error.message': error });
        return c.json({ message: 'Unauthorized' }, 401);
    }
};

export const adminRequired = async (c: Context, next: Next) => {
    const user = c.get('user') as User | undefined;
    if (!user || user.role !== 'ADMIN') {
        logs(c, {
            'auth.error': 'admin_access_denied',
            'user.id': user?.id,
            'user.role': user?.role,
        });
        return c.json({ message: 'Access denied. Admins only.' }, 403);
    }
    await next();
};