import { GEMINI } from '@/app/config/config';
import { GoogleGenAI } from '@google/genai';

const model = 'gemini-3-flash-preview';

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
    const apiKey = GEMINI.API_KEY;
    if (!apiKey) {
        throw new Error('Gemini is not configured. Set GEMINI_API_KEY in your environment.');
    }
    if (!client) {
        client = new GoogleGenAI({ apiKey });
    }
    return client;
}

function parseJson<T>(raw: string): T {
    let text = raw.trim();
    if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    try {
        return JSON.parse(text) as T;
    } catch {
        const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (match) {
            return JSON.parse(match[1]) as T;
        }
        throw new Error('Failed to parse JSON from Gemini response');
    }
}

export const gemini = {
    get isConfigured(): boolean {
        return Boolean(GEMINI.API_KEY);
    },

    async generateJson<T>(
        prompt: string,
        options?: { systemInstruction?: string; temperature?: number },
    ): Promise<T> {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                temperature: options?.temperature ?? 0.7,
                ...(options?.systemInstruction ? { systemInstruction: options.systemInstruction } : {}),
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error('Empty response from Gemini');
        }

        return parseJson<T>(text);
    },
};
