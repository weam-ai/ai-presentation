import { type NextRequest } from 'next/server';

export function getHostnameFromRequest(request: NextRequest) {
    try {
        const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
        if (!host) {
            return null;
        }
        const proto =
            request.headers.get('x-forwarded-proto') || (request.url?.startsWith('https://') ? 'https' : 'http');

        return `${proto}://${host}`;
    } catch (error) {
        console.error('Error getting hostname from request:', error);
        return null;
    }
}
