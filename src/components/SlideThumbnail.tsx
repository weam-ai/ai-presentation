'use client';

import type { Slide, Theme } from '@/lib/types';
import { ScaledSlide } from './ScaledSlide';

type SlideThumbnailProps = {
    slide: Slide;
    theme: Theme;
    index: number;
    active: boolean;
    onSelect: () => void;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
};

export function SlideThumbnail({
    slide,
    theme,
    index,
    active,
    onSelect,
    onDragStart,
    onDragOver,
    onDrop,
}: SlideThumbnailProps) {
    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={onSelect}
            className={`group flex gap-2 cursor-pointer rounded-lg p-1.5 transition ${
                active ? 'bg-indigo-50 ring-2 ring-indigo-400' : 'hover:bg-slate-100'
            }`}
        >
            <span className="text-xs text-slate-400 w-5 text-right pt-1 select-none">{index + 1}</span>
            <div className="flex-1 pointer-events-none">
                <ScaledSlide
                    slide={slide}
                    theme={theme}
                />
            </div>
        </div>
    );
}
