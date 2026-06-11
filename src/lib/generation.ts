import { randomUUID } from 'node:crypto';
import { gemini } from './gemini';
import { images } from './images';
import type { GenerateOutlineDto } from './schemas';
import type { Outline, OutlineItem, Slide, SlideLayout } from './types';

export const LAYOUTS: SlideLayout[] = [
    'title',
    'section',
    'bullets',
    'two-column',
    'image-right',
    'image-left',
    'image-full',
    'quote',
];

export function coerceLayout(layout: string, index: number): SlideLayout {
    if (LAYOUTS.includes(layout as SlideLayout)) {
        return layout as SlideLayout;
    }
    return index === 0 ? 'title' : 'bullets';
}

export const generation = {
    async generateOutline(dto: GenerateOutlineDto): Promise<Outline> {
        const nSlides = dto.nSlides ?? 8;
        const tone = dto.tone ?? 'default';
        const language = dto.language ?? 'English';

        const prompt = `Create a presentation outline with exactly ${nSlides} slides.
Tone: ${tone}
Language: ${language}
Topic/content:
${dto.content}
${dto.instructions ? `\nAdditional instructions:\n${dto.instructions}` : ''}

Rules:
- The first slide MUST use layout "title".
- Use varied layouts from this allowed list: ${LAYOUTS.join(', ')}.
- Return ONLY valid JSON in this shape:
{
  "title": "Presentation title",
  "items": [
    { "title": "Slide title", "summary": "Brief summary", "layout": "bullets" }
  ]
}`;

        const raw = await gemini.generateJson<{ title?: string; items?: Array<Partial<OutlineItem>> }>(prompt, {
            temperature: 0.8,
        });

        const items = (raw.items ?? []).map((item, index) => ({
            title: item.title?.trim() || `Slide ${index + 1}`,
            summary: item.summary?.trim() ?? '',
            layout: coerceLayout(item.layout ?? '', index),
        }));

        return {
            title: raw.title?.trim() || 'Untitled Presentation',
            items,
        };
    },

    async generateSlidesFromOutline(
        outline: Outline,
        options?: {
            tone?: string;
            verbosity?: string;
            language?: string;
            includeImages?: boolean;
        },
    ): Promise<Slide[]> {
        const tone = options?.tone ?? 'default';
        const verbosity = options?.verbosity ?? 'standard';
        const language = options?.language ?? 'English';
        const includeImages = options?.includeImages !== false;

        const densityGuide =
            verbosity === 'concise'
                ? '3-4 short bullets max'
                : verbosity === 'text-heavy'
                  ? '5-6 bullets or longer paragraphs'
                  : '4-5 concise bullets';

        const outlineDescription = outline.items
            .map(
                (item, i) =>
                    `${i + 1}. [${item.layout}] ${item.title} — ${item.summary || 'No summary'}`,
            )
            .join('\n');

        const prompt = `Generate slide content for a presentation titled "${outline.title}".
Tone: ${tone}
Language: ${language}
Density: ${densityGuide}

Outline (preserve this order):
${outlineDescription}

Per-layout JSON shapes:
- title / section: { "title", "subtitle" }
- bullets: { "title", "bullets": ["..."] }
- two-column: { "title", "columns": [{ "heading", "bullets": ["..."] }, ...] }
- image-right / image-left: { "title", "bullets": ["..."], "imageQuery": "2-4 word stock photo term" }
- image-full: { "title", "subtitle", "imageQuery": "2-4 word stock photo term" }
- quote: { "quote", "attribution" }

Always include a short 1-2 sentence "notes" field for presenter notes.

Return ONLY valid JSON:
{
  "slides": [ ...one object per outline item in the same order... ]
}`;

        const raw = await gemini.generateJson<{ slides?: Array<Record<string, unknown>> }>(prompt, {
            temperature: 0.7,
        });

        const slides: Slide[] = (raw.slides ?? []).map((slide, index) => {
            const layout = coerceLayout(
                typeof slide.layout === 'string' ? slide.layout : outline.items[index]?.layout ?? '',
                index,
            );

            return {
                id: randomUUID(),
                layout,
                title: typeof slide.title === 'string' ? slide.title : outline.items[index]?.title,
                subtitle: typeof slide.subtitle === 'string' ? slide.subtitle : undefined,
                bullets: Array.isArray(slide.bullets) ? slide.bullets.map(String) : undefined,
                body: typeof slide.body === 'string' ? slide.body : undefined,
                columns: Array.isArray(slide.columns)
                    ? slide.columns.map((col) => {
                          const c = col as { heading?: string; bullets?: unknown[] };
                          return {
                              heading: typeof c.heading === 'string' ? c.heading : undefined,
                              bullets: Array.isArray(c.bullets) ? c.bullets.map(String) : [],
                          };
                      })
                    : undefined,
                quote: typeof slide.quote === 'string' ? slide.quote : undefined,
                attribution: typeof slide.attribution === 'string' ? slide.attribution : undefined,
                imageQuery: typeof slide.imageQuery === 'string' ? slide.imageQuery : undefined,
                notes: typeof slide.notes === 'string' ? slide.notes : undefined,
            };
        });

        if (includeImages && images.isConfigured) {
            const queries = slides
                .filter((s) => s.layout.startsWith('image') && s.imageQuery)
                .map((s) => s.imageQuery as string);

            const urlMap = await images.searchMany(queries);
            for (const slide of slides) {
                if (slide.imageQuery && urlMap[slide.imageQuery]) {
                    slide.imageUrl = urlMap[slide.imageQuery];
                }
            }
        }

        return slides;
    },

    async generateFull(dto: GenerateOutlineDto & { verbosity?: string; includeImages?: boolean }) {
        const outline = await this.generateOutline(dto);
        const slides = await this.generateSlidesFromOutline(outline, {
            tone: dto.tone,
            verbosity: dto.verbosity,
            language: dto.language,
            includeImages: dto.includeImages,
        });
        return { title: outline.title, slides };
    },
};
