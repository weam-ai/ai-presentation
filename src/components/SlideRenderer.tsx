'use client';

import type { Slide, Theme } from '@/lib/types';
import { Editable } from './Editable';

type SlideRendererProps = {
    slide: Slide;
    theme: Theme;
    editable?: boolean;
    onChange?: (patch: Partial<Slide>) => void;
};

/**
 * Renders a single slide into a fixed 1280x720 coordinate space (see
 * .slide-canvas in globals.css). Callers scale it with CSS transform.
 */
export function SlideRenderer({ slide, theme, editable = false, onChange }: SlideRendererProps) {
    const patch = (p: Partial<Slide>) => onChange?.(p);

    const commitBullets = (text: string) =>
        patch({
            bullets: text
                .split('\n')
                .map((l) => l.replace(/^[•\-\s]+/, '').trim())
                .filter(Boolean),
        });

    const headingFont = `'${theme.fontHeading}', sans-serif`;
    const bodyFont = `'${theme.fontBody}', sans-serif`;

    const bg = slide.layout === 'section' ? theme.primary : theme.background;

    return (
        <div
            className="slide-canvas"
            style={{ background: bg, color: theme.text, fontFamily: bodyFont }}
        >
            {/* ---- TITLE ---- */}
            {slide.layout === 'title' && (
                <div className="flex flex-col justify-center h-full px-24">
                    <div
                        style={{
                            width: 90,
                            height: 8,
                            background: theme.accent,
                            marginBottom: 32,
                        }}
                    />
                    <Editable
                        value={slide.title ?? ''}
                        onCommit={(v) => patch({ title: v })}
                        editable={editable}
                        placeholder="Presentation title"
                        style={{
                            fontSize: 76,
                            fontWeight: 800,
                            lineHeight: 1.05,
                            color: theme.text,
                            fontFamily: headingFont,
                        }}
                    />
                    <Editable
                        value={slide.subtitle ?? ''}
                        onCommit={(v) => patch({ subtitle: v })}
                        editable={editable}
                        placeholder="Subtitle"
                        style={{ fontSize: 32, marginTop: 28, color: theme.accent }}
                    />
                </div>
            )}

            {/* ---- SECTION ---- */}
            {slide.layout === 'section' && (
                <div className="flex flex-col justify-center h-full px-24">
                    <Editable
                        value={slide.title ?? ''}
                        onCommit={(v) => patch({ title: v })}
                        editable={editable}
                        placeholder="Section title"
                        style={{
                            fontSize: 68,
                            fontWeight: 800,
                            lineHeight: 1.05,
                            color: '#ffffff',
                            fontFamily: headingFont,
                        }}
                    />
                    <Editable
                        value={slide.subtitle ?? ''}
                        onCommit={(v) => patch({ subtitle: v })}
                        editable={editable}
                        placeholder="Section subtitle"
                        style={{
                            fontSize: 30,
                            marginTop: 24,
                            color: 'rgba(255,255,255,0.85)',
                        }}
                    />
                </div>
            )}

            {/* ---- BULLETS ---- */}
            {slide.layout === 'bullets' && (
                <div className="flex flex-col h-full px-24 py-20">
                    <SlideHeading
                        slide={slide}
                        theme={theme}
                        editable={editable}
                        onChange={patch}
                        headingFont={headingFont}
                    />
                    <BulletList
                        bullets={slide.bullets ?? []}
                        theme={theme}
                        editable={editable}
                        onCommit={commitBullets}
                        fontSize={32}
                    />
                </div>
            )}

            {/* ---- TWO COLUMN ---- */}
            {slide.layout === 'two-column' && (
                <div className="flex flex-col h-full px-24 py-20">
                    <SlideHeading
                        slide={slide}
                        theme={theme}
                        editable={editable}
                        onChange={patch}
                        headingFont={headingFont}
                    />
                    <div className="grid grid-cols-2 gap-16 mt-8 flex-1">
                        {[0, 1].map((i) => {
                            const col = slide.columns?.[i] ?? { bullets: [] };
                            return (
                                <div key={i}>
                                    <Editable
                                        value={col.heading ?? ''}
                                        onCommit={(v) => {
                                            const columns = [...(slide.columns ?? [])];
                                            columns[i] = { ...(columns[i] ?? { bullets: [] }), heading: v };
                                            patch({ columns });
                                        }}
                                        editable={editable}
                                        placeholder="Column heading"
                                        style={{
                                            fontSize: 30,
                                            fontWeight: 700,
                                            color: theme.secondary,
                                            marginBottom: 16,
                                            fontFamily: headingFont,
                                        }}
                                    />
                                    <BulletList
                                        bullets={col.bullets ?? []}
                                        theme={theme}
                                        editable={editable}
                                        fontSize={26}
                                        onCommit={(text) => {
                                            const columns = [...(slide.columns ?? [])];
                                            columns[i] = {
                                                ...(columns[i] ?? { bullets: [] }),
                                                bullets: text
                                                    .split('\n')
                                                    .map((l) => l.replace(/^[•\-\s]+/, '').trim())
                                                    .filter(Boolean),
                                            };
                                            patch({ columns });
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ---- IMAGE SIDE ---- */}
            {(slide.layout === 'image-right' || slide.layout === 'image-left') && (
                <div
                    className="flex h-full"
                    style={{
                        flexDirection: slide.layout === 'image-left' ? 'row-reverse' : 'row',
                    }}
                >
                    <div
                        className="flex flex-col justify-center px-20 py-16"
                        style={{ width: '56%' }}
                    >
                        <SlideHeading
                            slide={slide}
                            theme={theme}
                            editable={editable}
                            onChange={patch}
                            headingFont={headingFont}
                        />
                        <BulletList
                            bullets={slide.bullets ?? []}
                            theme={theme}
                            editable={editable}
                            onCommit={commitBullets}
                            fontSize={28}
                        />
                    </div>
                    <div style={{ width: '44%', height: '100%' }}>
                        <SlideImage
                            slide={slide}
                            theme={theme}
                        />
                    </div>
                </div>
            )}

            {/* ---- IMAGE FULL ---- */}
            {slide.layout === 'image-full' && (
                <div className="relative h-full w-full">
                    <SlideImage
                        slide={slide}
                        theme={theme}
                    />
                    <div
                        className="absolute bottom-0 left-0 right-0 px-24 pb-16 pt-32"
                        style={{
                            background: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0))',
                        }}
                    >
                        <Editable
                            value={slide.title ?? ''}
                            onCommit={(v) => patch({ title: v })}
                            editable={editable}
                            placeholder="Title"
                            style={{
                                fontSize: 56,
                                fontWeight: 800,
                                color: '#fff',
                                fontFamily: headingFont,
                            }}
                        />
                        <Editable
                            value={slide.subtitle ?? ''}
                            onCommit={(v) => patch({ subtitle: v })}
                            editable={editable}
                            placeholder="Caption"
                            style={{ fontSize: 26, color: 'rgba(255,255,255,0.85)', marginTop: 12 }}
                        />
                    </div>
                </div>
            )}

            {/* ---- QUOTE ---- */}
            {slide.layout === 'quote' && (
                <div className="flex flex-col justify-center items-center h-full px-32 text-center">
                    <div style={{ fontSize: 120, lineHeight: 0.5, color: theme.accent, fontFamily: headingFont }}>
                        &ldquo;
                    </div>
                    <Editable
                        value={slide.quote ?? ''}
                        onCommit={(v) => patch({ quote: v })}
                        editable={editable}
                        placeholder="Quote text"
                        multiline
                        style={{
                            fontSize: 46,
                            fontWeight: 700,
                            fontStyle: 'italic',
                            color: theme.primary,
                            lineHeight: 1.25,
                            fontFamily: headingFont,
                        }}
                    />
                    <Editable
                        value={slide.attribution ?? ''}
                        onCommit={(v) => patch({ attribution: v })}
                        editable={editable}
                        placeholder="Attribution"
                        style={{ fontSize: 26, color: theme.accent, marginTop: 32 }}
                    />
                </div>
            )}
        </div>
    );
}

function SlideHeading({
    slide,
    theme,
    editable,
    onChange,
    headingFont,
}: {
    slide: Slide;
    theme: Theme;
    editable: boolean;
    onChange: (patch: Partial<Slide>) => void;
    headingFont: string;
}) {
    return (
        <div className="mb-6">
            <Editable
                value={slide.title ?? ''}
                onCommit={(v) => onChange({ title: v })}
                editable={editable}
                placeholder="Slide title"
                style={{
                    fontSize: 46,
                    fontWeight: 700,
                    color: theme.primary,
                    fontFamily: headingFont,
                }}
            />
            <div
                style={{
                    width: 70,
                    height: 6,
                    background: theme.accent,
                    marginTop: 14,
                    borderRadius: 3,
                }}
            />
        </div>
    );
}

function BulletList({
    bullets,
    theme,
    editable,
    onCommit,
    fontSize,
}: {
    bullets: string[];
    theme: Theme;
    editable: boolean;
    onCommit: (text: string) => void;
    fontSize: number;
}) {
    if (editable) {
        return (
            <Editable
                value={bullets.join('\n')}
                onCommit={onCommit}
                editable
                multiline
                placeholder="One bullet per line"
                style={{ fontSize, lineHeight: 1.5, color: theme.text, marginTop: 8 }}
            />
        );
    }
    return (
        <ul
            className="space-y-3 mt-2"
            style={{ fontSize, color: theme.text }}
        >
            {bullets.map((b, i) => (
                <li
                    key={i}
                    className="flex gap-3"
                    style={{ lineHeight: 1.4 }}
                >
                    <span style={{ color: theme.accent, fontWeight: 700 }}>•</span>
                    <span>{b}</span>
                </li>
            ))}
        </ul>
    );
}

function SlideImage({ slide, theme }: { slide: Slide; theme: Theme }) {
    if (slide.imageUrl) {
        // Plain <img> (not next/image) so the same component works in the
        // print view and arbitrary remote hosts without loader config.
        // eslint-disable-next-line @next/next/no-img-element
        return (
            <img
                src={slide.imageUrl}
                alt={slide.imageQuery ?? slide.title ?? 'slide image'}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
            />
        );
    }
    return (
        <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: theme.secondary, color: 'rgba(255,255,255,0.7)' }}
        >
            <span style={{ fontSize: 24 }}>{slide.imageQuery ?? 'Image'}</span>
        </div>
    );
}
