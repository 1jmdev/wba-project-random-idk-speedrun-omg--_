import type { Context } from 'hono';

export interface User {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
    status: string;
}

export interface AuthPayload {
    sub: string;
    email: string;
    role: string;
    status: string;
}

export type Variables = {
    user: User;
    requestId: string;
    validated: Record<string, unknown>;
    wideEvent: Record<string, unknown>;
};

export type AppEnv = {
    Variables: Variables;
};

export type AppContext = Context<AppEnv>;