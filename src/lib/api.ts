import type { Outline, Presentation, Slide, Theme, Tone, Verbosity } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
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
        return request<Outline>('/presentations/outline', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    createFromOutline(body: FromOutlineRequest): Promise<Presentation> {
        return request<Presentation>('/presentations/from-outline', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    list(): Promise<Presentation[]> {
        return request<Presentation[]>('/presentations');
    },

    get(id: string): Promise<Presentation> {
        return request<Presentation>(`/presentations/${id}`);
    },

    update(id: string, body: { title?: string; theme?: Theme; slides?: Slide[] }): Promise<Presentation> {
        return request<Presentation>(`/presentations/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    },

    remove(id: string): Promise<{ id: string }> {
        return request<{ id: string }>(`/presentations/${id}`, {
            method: 'DELETE',
        });
    },

    searchImage(q: string): Promise<{ url: string | null; configured: boolean }> {
        return request<{ url: string | null; configured: boolean }>(`/images/search?q=${encodeURIComponent(q)}`);
    },

    pptxUrl(id: string): string {
        return `${API_URL}/presentations/${id}/export/pptx`;
    },
};
