'use client';

import { useEffect, useRef, useState } from 'react';
import type { Slide, Theme } from '@/lib/types';
import { SlideRenderer } from './SlideRenderer';

type ScaledSlideProps = {
    slide: Slide;
    theme: Theme;
    editable?: boolean;
    onChange?: (patch: Partial<Slide>) => void;
    /** Optional fixed width; otherwise fills the parent's width. */
    width?: number;
    className?: string;
};

const BASE_W = 1280;
const BASE_H = 720;

/**
 * Wraps SlideRenderer (fixed 1280x720) and scales it down to fit the available
 * width while preserving the 16:9 aspect ratio.
 */
export function ScaledSlide({ slide, theme, editable, onChange, width, className }: ScaledSlideProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(width ? width / BASE_W : 0.25);

    useEffect(() => {
        if (width) {
            setScale(width / BASE_W);
            return;
        }
        const el = containerRef.current;
        if (!el) return;
        const update = () => setScale(el.clientWidth / BASE_W);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [width]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full ${className ?? ''}`}
            style={{
                width: width ?? '100%',
                height: scale * BASE_H,
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                borderRadius: 8,
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: BASE_W,
                    height: BASE_H,
                }}
            >
                <SlideRenderer
                    slide={slide}
                    theme={theme}
                    editable={editable}
                    onChange={onChange}
                />
            </div>
        </div>
    );
}
