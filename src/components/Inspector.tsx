'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type { Slide, SlideLayout, Theme, ThemeName } from '@/lib/types';
import { SLIDE_LAYOUTS } from '@/lib/types';
import { THEMES, THEME_LABELS } from '@/lib/themes';

type InspectorProps = {
    slide: Slide;
    theme: Theme;
    activeThemeName: ThemeName | null;
    onSlideChange: (patch: Partial<Slide>) => void;
    onThemeChange: (name: ThemeName) => void;
};

const usesImage = (layout: SlideLayout) => layout.startsWith('image');

export function Inspector({ slide, theme, activeThemeName, onSlideChange, onThemeChange }: InspectorProps) {
    const [imageQuery, setImageQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchMsg, setSearchMsg] = useState<string | null>(null);

    async function searchImage() {
        const q = imageQuery.trim() || slide.imageQuery || slide.title || '';
        if (!q) return;
        setSearching(true);
        setSearchMsg(null);
        try {
            const { url, configured } = await api.searchImage(q);
            if (!configured) {
                setSearchMsg('No image provider configured (set PEXELS_API_KEY).');
            } else if (url) {
                onSlideChange({ imageUrl: url, imageQuery: q });
            } else {
                setSearchMsg('No image found for that query.');
            }
        } catch {
            setSearchMsg('Image search failed.');
        } finally {
            setSearching(false);
        }
    }

    return (
        <aside className="w-72 shrink-0 border-l border-slate-200 bg-white overflow-y-auto">
            <div className="p-4 space-y-6">
                <Section title="Layout">
                    <div className="grid grid-cols-2 gap-2">
                        {SLIDE_LAYOUTS.map((l) => (
                            <button
                                key={l}
                                onClick={() => onSlideChange({ layout: l })}
                                className={`text-xs rounded-lg border px-2 py-2 capitalize transition ${
                                    slide.layout === l
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                {l.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                </Section>

                {usesImage(slide.layout) && (
                    <Section title="Image">
                        {slide.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={slide.imageUrl}
                                alt="preview"
                                className="w-full h-24 object-cover rounded-lg mb-2"
                            />
                        )}
                        <div className="flex gap-2">
                            <input
                                value={imageQuery}
                                onChange={(e) => setImageQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && searchImage()}
                                placeholder={slide.imageQuery ?? 'Search stock photos'}
                                className="flex-1 text-sm rounded-lg border border-slate-300 px-2 py-1.5"
                            />
                            <button
                                onClick={searchImage}
                                disabled={searching}
                                className="text-sm rounded-lg bg-slate-800 text-white px-3 disabled:opacity-50"
                            >
                                {searching ? '…' : 'Find'}
                            </button>
                        </div>
                        <input
                            value={slide.imageUrl ?? ''}
                            onChange={(e) => onSlideChange({ imageUrl: e.target.value })}
                            placeholder="…or paste an image URL"
                            className="w-full text-xs rounded-lg border border-slate-200 px-2 py-1.5 mt-2 text-slate-500"
                        />
                        {searchMsg && <p className="text-xs text-amber-600 mt-1">{searchMsg}</p>}
                    </Section>
                )}

                <Section title="Speaker notes">
                    <textarea
                        value={slide.notes ?? ''}
                        onChange={(e) => onSlideChange({ notes: e.target.value })}
                        rows={4}
                        placeholder="Notes shown in PPTX presenter view"
                        className="w-full text-sm rounded-lg border border-slate-300 px-2 py-1.5 resize-none"
                    />
                </Section>

                <Section title="Theme">
                    <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(THEMES) as ThemeName[]).map((name) => {
                            const t = THEMES[name];
                            const active = activeThemeName === name;
                            return (
                                <button
                                    key={name}
                                    onClick={() => onThemeChange(name)}
                                    className={`rounded-lg border-2 p-1.5 transition ${
                                        active ? 'border-indigo-500' : 'border-slate-200'
                                    }`}
                                >
                                    <div
                                        className="w-full h-8 rounded flex items-center justify-center"
                                        style={{ background: t.background }}
                                    >
                                        <div
                                            className="w-8 h-1.5 rounded"
                                            style={{ background: t.primary }}
                                        />
                                    </div>
                                    <div className="text-[11px] mt-1 text-slate-500">{THEME_LABELS[name]}</div>
                                </button>
                            );
                        })}
                    </div>
                </Section>

                <Section title="Current colors">
                    <div className="flex gap-2 flex-wrap">
                        {(
                            [
                                ['primary', theme.primary],
                                ['accent', theme.accent],
                                ['background', theme.background],
                                ['text', theme.text],
                            ] as const
                        ).map(([label, color]) => (
                            <div
                                key={label}
                                className="text-center"
                            >
                                <div
                                    className="w-9 h-9 rounded-lg border border-slate-200"
                                    style={{ background: color }}
                                />
                                <span className="text-[10px] text-slate-400">{label}</span>
                            </div>
                        ))}
                    </div>
                </Section>
            </div>
        </aside>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{title}</h3>
            {children}
        </div>
    );
}
