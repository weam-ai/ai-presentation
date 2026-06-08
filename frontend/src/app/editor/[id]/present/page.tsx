'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Presentation } from '@/lib/types';
import { SlideRenderer } from '@/components/SlideRenderer';

export default function PresentPage() {
    const params = useParams<{ id: string }>();
    const [presentation, setPresentation] = useState<Presentation | null>(null);
    const [index, setIndex] = useState(0);
    const stageRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.6);

    useEffect(() => {
        api.get(params.id)
            .then(setPresentation)
            .catch(() => undefined);
    }, [params.id]);

    const total = presentation?.slides.length ?? 0;

    const next = useCallback(() => setIndex((i) => Math.min(total - 1, i + 1)), [total]);
    const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') next();
            if (e.key === 'ArrowLeft') prev();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [next, prev]);

    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const update = () => {
            const s = Math.min(el.clientWidth / 1280, el.clientHeight / 720);
            setScale(s);
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [presentation]);

    if (!presentation) {
        return <div className="h-screen flex items-center justify-center text-slate-400">Loading…</div>;
    }

    const slide = presentation.slides[index];

    return (
        <div className="h-screen flex flex-col bg-slate-900">
            {/* Screen-only presenter UI */}
            <div className="screen-ui no-print flex flex-col h-full">
                <header className="h-14 shrink-0 flex items-center justify-between px-4 text-white/80">
                    <Link
                        href={`/editor/${params.id}`}
                        className="hover:text-white"
                    >
                        ← Back to editor
                    </Link>
                    <span className="text-sm font-medium">{presentation.title}</span>
                    <button
                        onClick={() => window.print()}
                        className="rounded-lg bg-white text-slate-900 px-4 py-1.5 text-sm font-medium hover:bg-slate-200"
                    >
                        Download PDF
                    </button>
                </header>

                <div
                    ref={stageRef}
                    className="flex-1 flex items-center justify-center p-4 min-h-0"
                >
                    <div
                        style={{
                            width: 1280 * scale,
                            height: 720 * scale,
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
                                width: 1280,
                                height: 720,
                                borderRadius: 8,
                                overflow: 'hidden',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            }}
                        >
                            <SlideRenderer
                                slide={slide}
                                theme={presentation.theme}
                            />
                        </div>
                    </div>
                </div>

                <footer className="h-16 shrink-0 flex items-center justify-center gap-4 text-white">
                    <button
                        onClick={prev}
                        disabled={index === 0}
                        className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 disabled:opacity-30"
                    >
                        ←
                    </button>
                    <span className="text-sm tabular-nums">
                        {index + 1} / {total}
                    </span>
                    <button
                        onClick={next}
                        disabled={index === total - 1}
                        className="rounded-lg bg-white/10 hover:bg-white/20 px-4 py-2 disabled:opacity-30"
                    >
                        →
                    </button>
                    <span className="text-xs text-white/40 ml-4">
                        Use ← → keys · &ldquo;Download PDF&rdquo; prints all slides
                    </span>
                </footer>
            </div>

            {/* Print-only deck: every slide at full 1280x720, one per page */}
            <div
                className="print-deck"
                style={{ display: 'none' }}
            >
                {presentation.slides.map((s) => (
                    <div
                        key={s.id}
                        className="print-slide"
                    >
                        <SlideRenderer
                            slide={s}
                            theme={presentation.theme}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
