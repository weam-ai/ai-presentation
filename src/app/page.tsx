'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Outline, OutlineItem, Presentation, SlideLayout, ThemeName, Tone, Verbosity } from '@/lib/types';
import { SLIDE_LAYOUTS } from '@/lib/types';
import { THEMES, THEME_LABELS } from '@/lib/themes';

type Step = 'form' | 'outline';

const TONES: Tone[] = ['default', 'professional', 'casual', 'educational', 'funny', 'sales_pitch'];
const VERBOSITY: Verbosity[] = ['concise', 'standard', 'text-heavy'];

export default function HomePage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('form');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // form state
    const [content, setContent] = useState('');
    const [instructions, setInstructions] = useState('');
    const [nSlides, setNSlides] = useState(8);
    const [tone, setTone] = useState<Tone>('professional');
    const [verbosity, setVerbosity] = useState<Verbosity>('standard');
    const [language, setLanguage] = useState('English');
    const [themeName, setThemeName] = useState<ThemeName>('midnight');

    // outline state
    const [outline, setOutline] = useState<Outline | null>(null);

    const [recent, setRecent] = useState<Presentation[]>([]);
    useEffect(() => {
        api.list()
            .then(setRecent)
            .catch(() => undefined);
    }, []);

    async function handleGenerateOutline() {
        if (content.trim().length < 3) {
            setError('Please describe your presentation topic first.');
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const result = await api.generateOutline({
                content,
                instructions: instructions || undefined,
                tone,
                nSlides,
                language,
            });
            setOutline(result);
            setStep('outline');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to generate outline');
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate() {
        if (!outline) return;
        setError(null);
        setLoading(true);
        try {
            const presentation = await api.createFromOutline({
                title: outline.title,
                outline,
                tone,
                verbosity,
                language,
                theme: themeName,
            });
            router.push(`/editor/${presentation.id}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to create presentation');
            setLoading(false);
        }
    }

    function updateItem(idx: number, patch: Partial<OutlineItem>) {
        if (!outline) return;
        const items = outline.items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
        setOutline({ ...outline, items });
    }
    function removeItem(idx: number) {
        if (!outline) return;
        setOutline({
            ...outline,
            items: outline.items.filter((_, i) => i !== idx),
        });
    }
    function addItem() {
        if (!outline) return;
        setOutline({
            ...outline,
            items: [...outline.items, { title: 'New slide', summary: '', layout: 'bullets' }],
        });
    }
    function move(idx: number, dir: -1 | 1) {
        if (!outline) return;
        const target = idx + dir;
        if (target < 0 || target >= outline.items.length) return;
        const items = [...outline.items];
        [items[idx], items[target]] = [items[target], items[idx]];
        setOutline({ ...outline, items });
    }

    return (
        <main className="min-h-screen">
            <header className="border-b border-slate-200 bg-white">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500" />
                        <span className="font-heading font-bold text-lg">PresentAI</span>
                        <span className="text-xs text-slate-400 ml-2">powered by Weam</span>
                    </div>
                    <Link
                        href="/library"
                        className="text-sm text-slate-600 hover:text-indigo-600"
                    >
                        My presentations
                    </Link>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="font-heading text-4xl font-extrabold tracking-tight">Create a presentation with AI</h1>
                <p className="text-slate-500 mt-2">
                    Describe your topic, review the AI-generated outline, then edit and export to PowerPoint or PDF.
                </p>

                {error && (
                    <div className="mt-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                {step === 'form' && (
                    <section className="mt-8 space-y-6">
                        <Field label="What is your presentation about?">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={4}
                                placeholder="e.g. An introduction to machine learning for business leaders, covering key concepts, use cases, and getting started."
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </Field>

                        <Field label="Extra instructions (optional)">
                            <input
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="e.g. Emphasize ROI and include real-world examples"
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </Field>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Field label="Slides">
                                <input
                                    type="number"
                                    min={1}
                                    max={30}
                                    value={nSlides}
                                    onChange={(e) => setNSlides(Number(e.target.value))}
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                />
                            </Field>
                            <Field label="Tone">
                                <Select
                                    value={tone}
                                    onChange={(v) => setTone(v as Tone)}
                                    options={TONES.map((t) => ({ value: t, label: t.replace('_', ' ') }))}
                                />
                            </Field>
                            <Field label="Detail">
                                <Select
                                    value={verbosity}
                                    onChange={(v) => setVerbosity(v as Verbosity)}
                                    options={VERBOSITY.map((v) => ({ value: v, label: v }))}
                                />
                            </Field>
                            <Field label="Language">
                                <input
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                                />
                            </Field>
                        </div>

                        <Field label="Theme">
                            <div className="flex gap-3 flex-wrap">
                                {(Object.keys(THEMES) as ThemeName[]).map((name) => {
                                    const t = THEMES[name];
                                    const active = themeName === name;
                                    return (
                                        <button
                                            key={name}
                                            onClick={() => setThemeName(name)}
                                            className={`rounded-xl border-2 p-2 transition ${
                                                active ? 'border-indigo-500' : 'border-transparent'
                                            }`}
                                        >
                                            <div
                                                className="w-20 h-12 rounded-md flex items-center justify-center"
                                                style={{ background: t.background }}
                                            >
                                                <div
                                                    className="w-10 h-2 rounded"
                                                    style={{ background: t.primary }}
                                                />
                                            </div>
                                            <div className="text-xs mt-1 text-slate-600">{THEME_LABELS[name]}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </Field>

                        <button
                            onClick={handleGenerateOutline}
                            disabled={loading}
                            className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 disabled:opacity-50"
                        >
                            {loading ? 'Generating outline…' : 'Generate outline →'}
                        </button>
                    </section>
                )}

                {step === 'outline' && outline && (
                    <section className="mt-8">
                        <Field label="Presentation title">
                            <input
                                value={outline.title}
                                onChange={(e) => setOutline({ ...outline, title: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-heading font-bold text-lg"
                            />
                        </Field>

                        <div className="mt-6 space-y-3">
                            {outline.items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl border border-slate-200 bg-white p-4 flex gap-3 items-start"
                                >
                                    <div className="flex flex-col items-center gap-1 pt-1">
                                        <button
                                            onClick={() => move(idx, -1)}
                                            className="text-slate-400 hover:text-slate-700"
                                            aria-label="Move up"
                                        >
                                            ▲
                                        </button>
                                        <span className="text-xs text-slate-400">{idx + 1}</span>
                                        <button
                                            onClick={() => move(idx, 1)}
                                            className="text-slate-400 hover:text-slate-700"
                                            aria-label="Move down"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            value={item.title}
                                            onChange={(e) => updateItem(idx, { title: e.target.value })}
                                            className="w-full font-semibold border-b border-transparent focus:border-slate-300 focus:outline-none"
                                        />
                                        <textarea
                                            value={item.summary}
                                            onChange={(e) => updateItem(idx, { summary: e.target.value })}
                                            rows={2}
                                            className="w-full text-sm text-slate-500 mt-1 resize-none focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        <Select
                                            value={item.layout}
                                            onChange={(v) => updateItem(idx, { layout: v as SlideLayout })}
                                            options={SLIDE_LAYOUTS.map((l) => ({ value: l, label: l }))}
                                        />
                                        <button
                                            onClick={() => removeItem(idx)}
                                            className="text-xs text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addItem}
                            className="mt-4 text-sm text-indigo-600 hover:text-indigo-800"
                        >
                            + Add slide
                        </button>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setStep('form')}
                                className="rounded-xl border border-slate-300 px-5 py-3 font-medium"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 disabled:opacity-50"
                            >
                                {loading ? 'Writing slides…' : 'Generate slides →'}
                            </button>
                        </div>
                    </section>
                )}

                {recent.length > 0 && step === 'form' && (
                    <section className="mt-14">
                        <h2 className="font-heading font-semibold text-slate-700 mb-3">Recent</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {recent.slice(0, 4).map((p) => (
                                <Link
                                    key={p.id}
                                    href={`/editor/${p.id}`}
                                    className="rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 transition"
                                >
                                    <div className="font-semibold truncate">{p.title}</div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {p.slides.length} slides · {new Date(p.updatedAt).toLocaleDateString()}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>
            {children}
        </label>
    );
}

function Select({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white capitalize"
        >
            {options.map((o) => (
                <option
                    key={o.value}
                    value={o.value}
                >
                    {o.label}
                </option>
            ))}
        </select>
    );
}
