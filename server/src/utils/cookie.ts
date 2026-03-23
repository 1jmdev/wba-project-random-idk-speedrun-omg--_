import { Context } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { env } from '../config/env';
import { CookieOptions } from 'hono/utils/cookie';

const isProduction = env.nodeEnv === 'production';
const frontendDomain = env.frontendUrl
    ? new URL(env.frontendUrl).hostname
    : undefined;

const rootDomain = frontendDomain
    ? '.' + frontendDomain.split('.').slice(-2).join('.')
    : undefined;

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict',
    path: '/',
    ...(rootDomain && { domain: rootDomain }),
};

export const setAccessTokenCookie = (c: Context, accessToken: string) => {
    setCookie(c, 'accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60, // 15 minutes in seconds
    });
};

export const setRefreshTokenCookie = (c: Context, refreshToken: string) => {
    setCookie(c, 'refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });
};

export const clearAuthCookies = (c: Context) => {
    deleteCookie(c, 'accessToken', cookieOptions);
    deleteCookie(c, 'refreshToken', cookieOptions);
};

export const setFilesTokenCookie = (c: Context, filesToken: string) => {
    setCookie(c, 'filesToken', filesToken, {
        ...cookieOptions,
        maxAge: 3 * 60 * 60, // 3 hours in seconds
    });
};