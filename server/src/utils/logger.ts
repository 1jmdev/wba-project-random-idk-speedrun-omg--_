import winston from 'winston';
import { WinstonTransport as AxiomTransport } from '@axiomhq/winston';
import { env } from '../config/env';
import { Context } from 'hono';

// Define log format for development (pretty print)
const devFormat = winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(
        ({ timestamp, level, message, requestId, ...meta }) => {
            const requestInfo = requestId ? `[${requestId}] ` : '';

            // If message is an object (wide event), treat it as meta for dev display
            let logMessage = message;
            let logMeta = meta;

            if (typeof message === 'object' && message !== null) {
                logMeta = { ...message, ...meta };
                logMessage = 'Wide Event';
            }

            const metaStr =
                Object.keys(logMeta).length > 0
                    ? ` | ${JSON.stringify(logMeta)}`
                    : '';

            return `${timestamp} ${level.toUpperCase()}: ${requestInfo}${logMessage}${metaStr}`;
        }
    )
);

// Define log format for production (JSON)
const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const transports: winston.transport[] = [
    new winston.transports.Console({
        format:
            env.nodeEnv === 'development'
                ? winston.format.combine(winston.format.colorize(), devFormat)
                : prodFormat,
    }),
];

// Add Axiom transport in production if configured
if (env.isProd && env.axiomToken && env.axiomDataset) {
    transports.push(
        new AxiomTransport({
            token: env.axiomToken,
            dataset: env.axiomDataset,
        })
    );
}

// Create Winston logger instance
export const logger = winston.createLogger({
    level: env.nodeEnv === 'development' ? 'debug' : 'info',
    transports,
    exitOnError: false,
});

/**
 * Helper to add context to the current request's wide event.
 * This allows enriching the log with business logic details.
 */
export const logs = (c: Context, data: Record<string, unknown>) => {
    try {
        const event = c.get('wideEvent');
        if (event && typeof event === 'object') {
            Object.assign(event, data);
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to add context to wide event', error);
    }
};