import type { Outline, Presentation, Slide, Theme, Tone, Verbosity } from './types';

// Same-origin API routes under /api (backend lives inside this Next.js app).
const API_BASE = '';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers ?? {}),
        },
    });

    if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
            const body = (await res.json()) as { message?: string | string[] };
            if (body?.message) {
                message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
            }
        } catch {
            /* ignore non-JSON error bodies */
        }
        throw new Error(message);
    }

    return res.json() as Promise<T>;
}

export type OutlineRequest = {
    content: string;
    instructions?: string;
    tone?: Tone;
    nSlides?: number;
    language?: string;
};

export type FromOutlineRequest = {
    title: string;
    outline: Outline;
    tone?: Tone;
    verbosity?: Verbosity;
    language?: string;
    theme?: string;
};

export const api = {
    generateOutline(body: OutlineRequest): Promise<Outline> {
        return request<Outline>('/api/presentations/outline', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    createFromOutline(body: FromOutlineRequest): Promise<Presentation> {
        return request<Presentation>('/api/presentations/from-outline', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    list(): Promise<Presentation[]> {
        return request<Presentation[]>('/api/presentations');
    },

    get(id: string): Promise<Presentation> {
        return request<Presentation>(`/api/presentations/${id}`);
    },

    update(id: string, body: { title?: string; theme?: Theme; slides?: Slide[] }): Promise<Presentation> {
        return request<Presentation>(`/api/presentations/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    },

    remove(id: string): Promise<{ id: string }> {
        return request<{ id: string }>(`/api/presentations/${id}`, {
            method: 'DELETE',
        });
    },

    searchImage(q: string): Promise<{ url: string | null; configured: boolean }> {
        return request<{ url: string | null; configured: boolean }>(
            `/api/images/search?q=${encodeURIComponent(q)}`,
        );
    },

    pptxUrl(id: string): string {
        return `/api/presentations/${id}/export/pptx`;
    },
};
