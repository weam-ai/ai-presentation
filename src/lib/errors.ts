import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

/** Thrown by the service layer when an entity cannot be found. */
export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

/** Thrown for caller mistakes that aren't covered by zod (e.g. bad ObjectId). */
export class BadRequestError extends Error {
    messages: string[];
    constructor(message: string | string[]) {
        const messages = Array.isArray(message) ? message : [message];
        super(messages.join(', '));
        this.name = 'BadRequestError';
        this.messages = messages;
    }
}

function badRequest(messages: string[]) {
    return NextResponse.json(
        { statusCode: 400, error: 'Bad Request', message: messages },
        { status: 400 },
    );
}

/**
 * Maps known error shapes to HTTP responses. Never leaks stack traces:
 * - zod / Mongoose validation / cast / BadRequest -> 400
 * - NotFound -> 404
 * - anything else -> 500
 */
export function handleError(err: unknown): NextResponse {
    if (err instanceof ZodError) {
        const messages = err.issues.map((i) => {
            const path = i.path.join('.');
            if (i.code === 'invalid_type' && (i as { received?: string }).received === 'undefined') {
                return path ? `${path} is required` : 'Required';
            }
            return path ? `${path}: ${i.message}` : i.message;
        });
        return badRequest(messages);
    }

    if (err instanceof BadRequestError) {
        return badRequest(err.messages);
    }

    if (err instanceof mongoose.Error.ValidationError) {
        const messages = Object.values(err.errors).map((e) => e.message);
        return badRequest(messages.length ? messages : [err.message]);
    }

    if (err instanceof mongoose.Error.CastError) {
        return badRequest([`Invalid value for ${err.path}`]);
    }

    if (err instanceof NotFoundError) {
        return NextResponse.json(
            { statusCode: 404, error: 'Not Found', message: err.message },
            { status: 404 },
        );
    }

    // Unexpected: log server-side, return a generic message.
    console.error('Unhandled API error:', err);
    return NextResponse.json(
        { statusCode: 500, error: 'Internal Server Error', message: 'Something went wrong' },
        { status: 500 },
    );
}
