import { Context, Next } from 'hono';
import { logger, logs } from '../utils/logger';
import { randomUUIDv7 as uuidv7 } from 'bun';
import { env } from '../config/env';
import { AppEnv } from '../types';

export const loggerMiddleware = async (c: Context<AppEnv>, next: Next) => {
    const requestId = c.req.header('x-request-id') || uuidv7();
    c.set('requestId', requestId);
    c.header('x-request-id', requestId);

    const startTime = Date.now();

    // Initialize the wide event with request context
    const event: Record<string, unknown> = {
        'request.id': requestId,
        'request.timestamp': new Date().toISOString(),
        'request.method': c.req.method,
        'request.path': c.req.path,
        'service.name': 'backend',
        'service.environment': env.nodeEnv,
        'service.region': env.region,
        'request.user_agent': c.req.header('user-agent'),
        'request.ip':
            c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip'),
    };

    // Make the event accessible to handlers
    c.set('wideEvent', event);

    try {
        await next();

        logs(c, {
            'response.status_code': c.res.status,
            'response.outcome': c.res.status >= 400 ? 'error' : 'success',
        });

        // Add user context if available (populated by auth middleware)
        const user = c.get('user');
        if (user) {
            logs(c, {
                'user.id': user.id,
                'user.org_id': user.organizationId,
            });
        }
    } catch (error: unknown) {
        const errorObj = error as Error & { code?: unknown };
        logs(c, {
            'response.status_code': 500,
            'response.outcome': 'error',
            'error.type': errorObj.name,
            'error.message': errorObj.message,
            'error.stack': errorObj.stack,
            'error.code': errorObj.code,
        });
        throw error;
    } finally {
        const duration = Date.now() - startTime;
        logs(c, { 'response.duration_ms': duration });

        // Schedule logging in background without blocking response
        setImmediate(() => {
            if (shouldSample(event)) {
                try {
                    logger.info(event);
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('Failed to log event', err);
                }
            }
        });
    }
};

function shouldSample(event: Record<string, unknown>): boolean {
    // Always keep errors
    if ((event['response.status_code'] as number) >= 400) return true;
    if (event['response.outcome'] === 'error') return true;
    if (event['error.type']) return true;

    // Always keep slow requests (e.g., > 1s)
    if ((event['response.duration_ms'] as number) > 1000) return true;

    // Always keep specific paths (e.g., billing, critical flows)
    const path = event['request.path'] as string;
    if (path?.startsWith('/billing')) return true;
    if (path?.startsWith('/onboarding')) return true;

    /* return Math.random() < 0.1; */

    return true;
}