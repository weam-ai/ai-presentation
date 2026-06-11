import PptxGenJS from 'pptxgenjs';
import { presentations } from './presentations';
import type { Presentation, Slide, Theme } from './types';

const W = 13.333;
const H = 7.5;

function hex(color: string): string {
    return color.replace('#', '').toUpperCase();
}

function safeName(title: string): string {
    const cleaned = title.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    return (cleaned || 'presentation').slice(0, 60);
}

async function fetchImageDataUri(url: string): Promise<string | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get('content-type') ?? 'image/jpeg';
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:${contentType};base64,${base64}`;
    } catch {
        return null;
    }
}

async function prefetchImages(slides: Slide[]): Promise<Map<string, string>> {
    const urls = [...new Set(slides.map((s) => s.imageUrl).filter((u): u is string => Boolean(u)))];
    const entries = await Promise.all(
        urls.map(async (url) => {
            const data = await fetchImageDataUri(url);
            return data ? ([url, data] as const) : null;
        }),
    );
    return new Map(entries.filter((e): e is [string, string] => e !== null));
}

function addHeading(slide: PptxGenJS.Slide, theme: Theme, title?: string) {
    if (!title) return;
    slide.addText(title, {
        x: 0.6,
        y: 0.5,
        w: W - 1.2,
        h: 0.8,
        fontSize: 30,
        bold: true,
        color: hex(theme.primary),
        fontFace: theme.fontHeading,
    });
    slide.addShape('rect', {
        x: 0.6,
        y: 1.25,
        w: 1.2,
        h: 0.06,
        fill: { color: hex(theme.accent) },
        line: { color: hex(theme.accent) },
    });
}

function renderSlide(
    pptxSlide: PptxGenJS.Slide,
    slide: Slide,
    theme: Theme,
    imageMap: Map<string, string>,
) {
    pptxSlide.background = { color: hex(theme.background) };
    if (slide.notes) {
        pptxSlide.addNotes(slide.notes);
    }

    const imageData = slide.imageUrl ? imageMap.get(slide.imageUrl) : undefined;

    switch (slide.layout) {
        case 'title': {
            pptxSlide.addShape('rect', {
                x: 0,
                y: H - 0.25,
                w: W,
                h: 0.25,
                fill: { color: hex(theme.primary) },
                line: { color: hex(theme.primary) },
            });
            if (slide.title) {
                pptxSlide.addText(slide.title, {
                    x: 0.8,
                    y: 2.2,
                    w: W - 1.6,
                    h: 1.5,
                    fontSize: 44,
                    bold: true,
                    color: hex(theme.text),
                    fontFace: theme.fontHeading,
                });
            }
            if (slide.subtitle) {
                pptxSlide.addText(slide.subtitle, {
                    x: 0.8,
                    y: 3.8,
                    w: W - 1.6,
                    h: 0.8,
                    fontSize: 20,
                    color: hex(theme.accent),
                    fontFace: theme.fontBody,
                });
            }
            break;
        }
        case 'section': {
            pptxSlide.background = { color: hex(theme.primary) };
            if (slide.title) {
                pptxSlide.addText(slide.title, {
                    x: 0.8,
                    y: 2.5,
                    w: W - 1.6,
                    h: 1.2,
                    fontSize: 40,
                    bold: true,
                    color: 'FFFFFF',
                    fontFace: theme.fontHeading,
                    align: 'center',
                });
            }
            if (slide.subtitle) {
                pptxSlide.addText(slide.subtitle, {
                    x: 0.8,
                    y: 4.0,
                    w: W - 1.6,
                    h: 0.8,
                    fontSize: 20,
                    color: 'FFFFFF',
                    fontFace: theme.fontBody,
                    align: 'center',
                });
            }
            break;
        }
        case 'bullets': {
            addHeading(pptxSlide, theme, slide.title);
            const bullets = slide.bullets?.length ? slide.bullets : slide.body ? [slide.body] : [];
            if (bullets.length) {
                pptxSlide.addText(
                    bullets.map((b) => ({ text: `• ${b}`, options: { breakLine: true } })),
                    {
                        x: 0.8,
                        y: 1.6,
                        w: W - 1.6,
                        h: H - 2.2,
                        fontSize: 18,
                        color: hex(theme.text),
                        fontFace: theme.fontBody,
                        lineSpacingMultiple: 1.3,
                    },
                );
            }
            break;
        }
        case 'two-column': {
            addHeading(pptxSlide, theme, slide.title);
            const cols = slide.columns ?? [];
            const colW = (W - 1.6) / 2;
            cols.slice(0, 2).forEach((col, i) => {
                const x = 0.6 + i * (colW + 0.2);
                if (col.heading) {
                    pptxSlide.addText(col.heading, {
                        x,
                        y: 1.6,
                        w: colW,
                        h: 0.5,
                        fontSize: 20,
                        bold: true,
                        color: hex(theme.secondary),
                        fontFace: theme.fontHeading,
                    });
                }
                if (col.bullets?.length) {
                    pptxSlide.addText(
                        col.bullets.map((b) => ({ text: `• ${b}`, options: { breakLine: true } })),
                        {
                            x,
                            y: 2.2,
                            w: colW,
                            h: H - 2.8,
                            fontSize: 16,
                            color: hex(theme.text),
                            fontFace: theme.fontBody,
                            lineSpacingMultiple: 1.2,
                        },
                    );
                }
            });
            break;
        }
        case 'image-left':
        case 'image-right': {
            const imageW = W * 0.42;
            const textX = slide.layout === 'image-left' ? imageW + 0.4 : 0.6;
            const imageX = slide.layout === 'image-left' ? 0 : W - imageW;
            const textW = W - imageW - 1.0;

            if (imageData) {
                pptxSlide.addImage({ data: imageData, x: imageX, y: 0, w: imageW, h: H, sizing: { type: 'cover', w: imageW, h: H } });
            } else {
                pptxSlide.addShape('rect', {
                    x: imageX,
                    y: 0,
                    w: imageW,
                    h: H,
                    fill: { color: hex(theme.secondary) },
                    line: { color: hex(theme.secondary) },
                });
            }

            if (slide.title) {
                pptxSlide.addText(slide.title, {
                    x: textX,
                    y: 0.6,
                    w: textW,
                    h: 0.8,
                    fontSize: 26,
                    bold: true,
                    color: hex(theme.text),
                    fontFace: theme.fontHeading,
                });
            }
            if (slide.bullets?.length) {
                pptxSlide.addText(
                    slide.bullets.map((b) => ({ text: `• ${b}`, options: { breakLine: true } })),
                    {
                        x: textX,
                        y: 1.6,
                        w: textW,
                        h: H - 2.2,
                        fontSize: 16,
                        color: hex(theme.text),
                        fontFace: theme.fontBody,
                        lineSpacingMultiple: 1.2,
                    },
                );
            }
            break;
        }
        case 'image-full': {
            if (imageData) {
                pptxSlide.addImage({ data: imageData, x: 0, y: 0, w: W, h: H, sizing: { type: 'cover', w: W, h: H } });
            } else {
                pptxSlide.background = { color: hex(theme.primary) };
            }
            pptxSlide.addShape('rect', {
                x: 0,
                y: H - 2.2,
                w: W,
                h: 2.2,
                fill: { color: '000000', transparency: 35 },
                line: { color: '000000', transparency: 35 },
            });
            if (slide.title) {
                pptxSlide.addText(slide.title, {
                    x: 0.8,
                    y: H - 1.8,
                    w: W - 1.6,
                    h: 0.8,
                    fontSize: 32,
                    bold: true,
                    color: 'FFFFFF',
                    fontFace: theme.fontHeading,
                });
            }
            if (slide.subtitle) {
                pptxSlide.addText(slide.subtitle, {
                    x: 0.8,
                    y: H - 1.0,
                    w: W - 1.6,
                    h: 0.5,
                    fontSize: 18,
                    color: 'FFFFFF',
                    fontFace: theme.fontBody,
                });
            }
            break;
        }
        case 'quote': {
            if (slide.quote) {
                pptxSlide.addText(slide.quote, {
                    x: 1.0,
                    y: 2.0,
                    w: W - 2.0,
                    h: 2.5,
                    fontSize: 32,
                    bold: true,
                    italic: true,
                    color: hex(theme.primary),
                    fontFace: theme.fontHeading,
                    align: 'center',
                    valign: 'middle',
                });
            }
            if (slide.attribution) {
                pptxSlide.addText(`— ${slide.attribution}`, {
                    x: 1.0,
                    y: 5.0,
                    w: W - 2.0,
                    h: 0.6,
                    fontSize: 18,
                    color: hex(theme.accent),
                    fontFace: theme.fontBody,
                    align: 'center',
                });
            }
            break;
        }
    }
}

function buildPptx(presentation: Presentation, imageMap: Map<string, string>): PptxGenJS {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'PresentAI';
    pptx.title = presentation.title;

    for (const slide of presentation.slides) {
        const pptxSlide = pptx.addSlide();
        renderSlide(pptxSlide, slide, presentation.theme, imageMap);
    }

    return pptx;
}

export const exportService = {
    async exportPptx(id: string): Promise<{ buffer: Buffer; filename: string }> {
        const presentation = await presentations.findOne(id);
        const imageMap = await prefetchImages(presentation.slides);
        const pptx = buildPptx(presentation, imageMap);
        const arrayBuffer = (await pptx.write({ outputType: 'arraybuffer' })) as ArrayBuffer;
        return {
            buffer: Buffer.from(arrayBuffer),
            filename: `${safeName(presentation.title)}.pptx`,
        };
    },
};
