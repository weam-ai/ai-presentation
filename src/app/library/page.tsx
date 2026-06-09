'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Presentation } from '@/lib/types';
import { ScaledSlide } from '@/components/ScaledSlide';

export default function LibraryPage() {
    const [items, setItems] = useState<Presentation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.list()
            .then(setItems)
            .finally(() => setLoading(false));
    }, []);

    async function handleDelete(id: string) {
        if (!confirm('Delete this presentation?')) return;
        await api.remove(id);
        setItems((prev) => prev.filter((p) => p.id !== id));
    }

    return (
        <main className="min-h-screen">
            <header className="border-b border-slate-200 bg-white">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500" />
                        <span className="font-heading font-bold text-lg">PresentAI</span>
                    </Link>
                    <Link
                        href="/"
                        className="text-sm rounded-lg bg-indigo-600 text-white px-4 py-1.5 font-medium hover:bg-indigo-700"
                    >
                        + New presentation
                    </Link>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-10">
                <h1 className="font-heading text-3xl font-extrabold mb-6">My presentations</h1>

                {loading ? (
                    <p className="text-slate-400">Loading…</p>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <p>No presentations yet.</p>
                        <Link
                            href="/"
                            className="text-indigo-600 mt-2 inline-block hover:underline"
                        >
                            Create your first one →
                        </Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {items.map((p) => (
                            <div
                                key={p.id}
                                className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition"
                            >
                                <Link href={`/editor/${p.id}`}>
                                    <ScaledSlide
                                        slide={p.slides[0]}
                                        theme={p.theme}
                                    />
                                </Link>
                                <div className="p-3">
                                    <div className="font-semibold truncate">{p.title}</div>
                                    <div className="text-xs text-slate-400 mt-0.5">
                                        {p.slides.length} slides · {new Date(p.updatedAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-3 mt-2 text-sm">
                                        <Link
                                            href={`/editor/${p.id}`}
                                            className="text-indigo-600 hover:underline"
                                        >
                                            Edit
                                        </Link>
                                        <a
                                            href={api.pptxUrl(p.id)}
                                            className="text-slate-600 hover:underline"
                                        >
                                            PPTX
                                        </a>
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="text-red-500 hover:underline ml-auto"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
