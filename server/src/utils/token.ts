import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { randomUUIDv7 as uuidv7 } from 'bun';
import { env } from '../config/env';
import { User } from '../types';

export const generateAccessToken = (user: User) => {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
            orgId: user.organizationId,
            status: user.status,
        },
        env.jwtAccessSecret,
        { expiresIn: '15m' }
    );
};

export const generateRefreshToken = (user: User) => {
    // Adding more randomless for security using uuidv4
    return jwt.sign(
        {
            sub: user.id,
            jti: uuidv7(),
        },
        env.jwtRefreshSecret,
        { expiresIn: '7d' }
    );
};

export const generateRefreshTokenHash = (refreshToken: string) => {
    return crypto.createHash('sha256').update(refreshToken).digest('hex');
};