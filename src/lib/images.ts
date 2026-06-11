type ImageProvider = 'pexels' | 'pixabay' | 'none';

function getProvider(): ImageProvider {
    const raw = (process.env.IMAGE_PROVIDER ?? 'pexels').toLowerCase();
    if (raw === 'pixabay' || raw === 'none') {
        return raw;
    }
    return 'pexels';
}

async function searchPexels(query: string): Promise<string | null> {
    const key = process.env.PEXELS_API_KEY;
    if (!key) return null;

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
    const res = await fetch(url, { headers: { Authorization: key } });
    if (!res.ok) return null;

    const data = (await res.json()) as {
        photos?: Array<{ src?: { large2x?: string; large?: string; original?: string } }>;
    };
    const src = data.photos?.[0]?.src;
    return src?.large2x ?? src?.large ?? src?.original ?? null;
}

async function searchPixabay(query: string): Promise<string | null> {
    const key = process.env.PIXABAY_API_KEY;
    if (!key) return null;

    const url = `https://pixabay.com/api/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=3`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = (await res.json()) as {
        hits?: Array<{ largeImageURL?: string; webformatURL?: string }>;
    };
    const hit = data.hits?.[0];
    return hit?.largeImageURL ?? hit?.webformatURL ?? null;
}

export const images = {
    get provider(): ImageProvider {
        return getProvider();
    },

    get isConfigured(): boolean {
        const provider = getProvider();
        if (provider === 'none') return false;
        if (provider === 'pexels') return Boolean(process.env.PEXELS_API_KEY);
        return Boolean(process.env.PIXABAY_API_KEY);
    },

    async search(query: string): Promise<string | null> {
        if (!query.trim()) return null;

        try {
            const provider = getProvider();
            if (provider === 'none') return null;
            if (provider === 'pixabay') return await searchPixabay(query);
            return await searchPexels(query);
        } catch {
            return null;
        }
    },

    async searchMany(queries: string[]): Promise<Record<string, string>> {
        const unique = [...new Set(queries.map((q) => q.trim()).filter(Boolean))];
        const entries = await Promise.all(
            unique.map(async (query) => {
                const url = await this.search(query);
                return url ? ([query, url] as const) : null;
            }),
        );

        return Object.fromEntries(entries.filter((e): e is [string, string] => e !== null));
    },
};
