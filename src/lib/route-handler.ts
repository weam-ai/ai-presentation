import { NextResponse } from 'next/server';
import { connectDB } from './db';
import { handleError } from './errors';

/** Wrap a route handler with DB connect + centralized error handling. */
export function withHandler<T extends unknown[]>(
    handler: (...args: T) => Promise<NextResponse>,
): (...args: T) => Promise<NextResponse> {
    return async (...args: T) => {
        try {
            await connectDB();
            return await handler(...args);
        } catch (err) {
            return handleError(err);
        }
    };
}
