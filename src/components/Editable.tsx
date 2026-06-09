'use client';

import { useEffect, useRef } from 'react';

type EditableProps = {
    value: string;
    onCommit: (value: string) => void;
    editable: boolean;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
    /** When true, preserve line breaks (used for bullet/body editing). */
    multiline?: boolean;
};

/**
 * Uncontrolled contentEditable wrapper. Content is seeded once on mount (and
 * when `value` changes while NOT focused) to avoid the classic React caret-jump
 * problem. Changes are committed on blur.
 */
export function Editable({ value, onCommit, editable, className, style, placeholder, multiline }: EditableProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (document.activeElement === el) return;
        if (el.innerText !== value) el.innerText = value;
    }, [value]);

    if (!editable) {
        return (
            <div
                className={className}
                style={style}
            >
                {value || ''}
            </div>
        );
    }

    return (
        <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            data-placeholder={placeholder}
            className={`outline-none focus:ring-2 focus:ring-white/40 rounded transition ${className ?? ''}`}
            style={{ whiteSpace: multiline ? 'pre-wrap' : 'normal', ...style }}
            onBlur={(e) => onCommit(e.currentTarget.innerText)}
        />
    );
}
