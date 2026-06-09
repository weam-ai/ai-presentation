'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Presentation, Slide, ThemeName } from '@/lib/types';
import { THEMES } from '@/lib/themes';
import { SlideRenderer } from '@/components/SlideRenderer';
import { SlideThumbnail } from '@/components/SlideThumbnail';
import { Inspector } from '@/components/Inspector';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function newSlide(): Slide {
    return {
        id: crypto.randomUUID(),
        layout: 'bullets',
        title: 'New slide',
        bullets: ['Add your points here'],
    };
}

function themeNameFor(p: Presentation): ThemeName | null {
    const entries = Object.entries(THEMES) as [ThemeName, (typeof THEMES)[ThemeName]][];
    const match = entries.find(([, t]) => t.primary === p.theme.primary && t.background === p.theme.background);
    return match ? match[0] : null;
}

export default function EditorPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [presentation, setPresentation] = useState<Presentation | null>(null);
    const [selected, setSelected] = useState(0);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const dragIndex = useRef<number | null>(null);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dirty = useRef(false);

    useEffect(() => {
        api.get(id)
            .then((p) => setPresentation(p))
            .catch((e) => setLoadError(e instanceof Error ? e.message : 'Failed to load'));
    }, [id]);

    const scheduleSave = useCallback((next: Presentation) => {
        dirty.current = true;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
            setSaveState('saving');
            try {
                await api.update(next.id, {
                    title: next.title,
                    theme: next.theme,
                    slides: next.slides,
                });
                setSaveState('saved');
                dirty.current = false;
            } catch {
                setSaveState('error');
            }
        }, 900);
    }, []);

    const mutate = useCallback(
        (updater: (p: Presentation) => Presentation) => {
            setPresentation((prev) => {
                if (!prev) return prev;
                const next = updater(prev);
                scheduleSave(next);
                return next;
            });
        },
        [scheduleSave],
    );

    const updateSlide = useCallback(
        (index: number, patch: Partial<Slide>) => {
            mutate((p) => ({
                ...p,
                slides: p.slides.map((s, i) => (i === index ? { ...s, ...patch } : s)),
            }));
        },
        [mutate],
    );

    function addSlide() {
        mutate((p) => {
            const slides = [...p.slides];
            slides.splice(selected + 1, 0, newSlide());
            return { ...p, slides };
        });
        setSelected((s) => s + 1);
    }

    function duplicateSlide() {
        mutate((p) => {
            const slides = [...p.slides];
            slides.splice(selected + 1, 0, {
                ...p.slides[selected],
                id: crypto.randomUUID(),
            });
            return { ...p, slides };
        });
        setSelected((s) => s + 1);
    }

    function deleteSlide() {
        mutate((p) => {
            if (p.slides.length <= 1) return p;
            return { ...p, slides: p.slides.filter((_, i) => i !== selected) };
        });
        setSelected((s) => Math.max(0, s - 1));
    }

    function reorder(from: number, to: number) {
        if (from === to) return;
        mutate((p) => {
            const slides = [...p.slides];
            const [moved] = slides.splice(from, 1);
            slides.splice(to, 0, moved);
            return { ...p, slides };
        });
        setSelected(to);
    }

    if (loadError) {
        return (
            <Centered>
                <p className="text-red-600">{loadError}</p>
                <Link
                    href="/"
                    className="text-indigo-600 mt-3 inline-block"
                >
                    ← Back home
                </Link>
            </Centered>
        );
    }

    if (!presentation) {
        return <Centered>Loading…</Centered>;
    }

    const slide = presentation.slides[selected] ?? presentation.slides[0];
    const activeThemeName = themeNameFor(presentation);

    return (
        <div className="h-screen flex flex-col bg-slate-100">
            {/* Top bar */}
            <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="text-slate-400 hover:text-slate-700"
                    >
                        ←
                    </Link>
                    <input
                        value={presentation.title}
                        onChange={(e) => mutate((p) => ({ ...p, title: e.target.value }))}
                        className="font-heading font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded px-1"
                    />
                    <SaveBadge state={saveState} />
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/editor/${id}/present`}
                        className="text-sm rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
                    >
                        Present / PDF
                    </Link>
                    <a
                        href={api.pptxUrl(id)}
                        className="text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 font-medium"
                    >
                        Export PPTX
                    </a>
                </div>
            </header>

            <div className="flex-1 flex min-h-0">
                {/* Slide list */}
                <aside className="w-60 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
                    <div className="p-2 space-y-1">
                        {presentation.slides.map((s, i) => (
                            <SlideThumbnail
                                key={s.id}
                                slide={s}
                                theme={presentation.theme}
                                index={i}
                                active={i === selected}
                                onSelect={() => setSelected(i)}
                                onDragStart={() => (dragIndex.current = i)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                    if (dragIndex.current !== null) reorder(dragIndex.current, i);
                                    dragIndex.current = null;
                                }}
                            />
                        ))}
                    </div>
                    <div className="p-2 border-t border-slate-100 sticky bottom-0 bg-white">
                        <button
                            onClick={addSlide}
                            className="w-full text-sm rounded-lg bg-slate-800 text-white py-2 hover:bg-slate-700"
                        >
                            + Add slide
                        </button>
                    </div>
                </aside>

                {/* Canvas */}
                <main className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 overflow-auto flex items-center justify-center p-8">
                        <div
                            className="w-full"
                            style={{ maxWidth: 'min(100%, calc((100vh - 220px) * 1.7778))' }}
                        >
                            <div
                                className="relative w-full"
                                style={{ aspectRatio: '16 / 9' }}
                            >
                                <div
                                    className="absolute inset-0"
                                    style={{ transform: 'scale(var(--s))' }}
                                >
                                    <EditorCanvas
                                        slide={slide}
                                        theme={presentation.theme}
                                        onChange={(patch) => updateSlide(selected, patch)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-12 shrink-0 border-t border-slate-200 bg-white flex items-center justify-center gap-2 text-sm">
                        <ToolButton onClick={duplicateSlide}>Duplicate</ToolButton>
                        <ToolButton
                            onClick={deleteSlide}
                            danger
                        >
                            Delete
                        </ToolButton>
                        <span className="text-slate-400 ml-3">
                            Slide {selected + 1} / {presentation.slides.length} · click text to edit
                        </span>
                    </div>
                </main>

                {/* Inspector */}
                <Inspector
                    slide={slide}
                    theme={presentation.theme}
                    activeThemeName={activeThemeName}
                    onSlideChange={(patch) => updateSlide(selected, patch)}
                    onThemeChange={(name) => mutate((p) => ({ ...p, theme: THEMES[name] }))}
                />
            </div>
        </div>
    );
}

/** Renders the editable slide and scales it to fill its 16:9 container. */
function EditorCanvas({
    slide,
    theme,
    onChange,
}: {
    slide: Slide;
    theme: Presentation['theme'];
    onChange: (patch: Partial<Slide>) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.5);
    useEffect(() => {
        const el = ref.current?.parentElement;
        if (!el) return;
        const update = () => setScale(el.clientWidth / 1280);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return (
        <div
            ref={ref}
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: 1280,
                height: 720,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            }}
        >
            <SlideRenderer
                slide={slide}
                theme={theme}
                editable
                onChange={onChange}
            />
        </div>
    );
}

function SaveBadge({ state }: { state: SaveState }) {
    const map: Record<SaveState, { text: string; cls: string }> = {
        idle: { text: '', cls: '' },
        saving: { text: 'Saving…', cls: 'text-slate-400' },
        saved: { text: 'All changes saved', cls: 'text-emerald-600' },
        error: { text: 'Save failed', cls: 'text-red-600' },
    };
    const { text, cls } = map[state];
    return <span className={`text-xs ${cls}`}>{text}</span>;
}

function ToolButton({
    children,
    onClick,
    danger,
}: {
    children: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`rounded-lg px-3 py-1.5 border transition ${
                danger
                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
        >
            {children}
        </button>
    );
}

function Centered({ children }: { children: React.ReactNode }) {
    return <div className="h-screen flex flex-col items-center justify-center text-slate-500">{children}</div>;
}
