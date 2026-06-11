/**
 * Frontend mirror of backend/src/common/slide.types.ts.
 * Keep both in sync when changing the schema.
 */

export type SlideLayout =
    | 'title'
    | 'section'
    | 'bullets'
    | 'two-column'
    | 'image-right'
    | 'image-left'
    | 'image-full'
    | 'quote';

export type SlideColumn = {
    heading?: string;
    bullets: string[];
};

export type Slide = {
    id: string;
    layout: SlideLayout;
    title?: string;
    subtitle?: string;
    bullets?: string[];
    body?: string;
    columns?: SlideColumn[];
    quote?: string;
    attribution?: string;
    imageQuery?: string;
    imageUrl?: string;
    notes?: string;
};

export type Theme = {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
    fontHeading: string;
    fontBody: string;
};

export type PresentationUser = {
    id: string;
    email: string;
    name: string;
};

export type Presentation = {
    id: string;
    title: string;
    topic: string;
    tone: string;
    language: string;
    theme: Theme;
    slides: Slide[];
    user: PresentationUser;
    createdAt: string;
    updatedAt: string;
};

export type OutlineItem = {
    title: string;
    summary: string;
    layout: SlideLayout;
};

export type Outline = {
    title: string;
    items: OutlineItem[];
};

export type Tone = 'default' | 'casual' | 'professional' | 'funny' | 'educational' | 'sales_pitch';

export type Verbosity = 'concise' | 'standard' | 'text-heavy';

export type ThemeName = 'midnight' | 'sunrise' | 'forest' | 'mono';

export const SLIDE_LAYOUTS: SlideLayout[] = [
    'title',
    'section',
    'bullets',
    'two-column',
    'image-right',
    'image-left',
    'image-full',
    'quote',
];

export const DEFAULT_THEMES: Record<string, Theme> = {
    midnight: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        background: '#0f172a',
        text: '#e2e8f0',
        accent: '#22d3ee',
        fontHeading: 'Poppins',
        fontBody: 'Inter',
    },
    sunrise: {
        primary: '#f97316',
        secondary: '#ef4444',
        background: '#fffbeb',
        text: '#1f2937',
        accent: '#f59e0b',
        fontHeading: 'Poppins',
        fontBody: 'Inter',
    },
    forest: {
        primary: '#059669',
        secondary: '#10b981',
        background: '#f0fdf4',
        text: '#14532d',
        accent: '#84cc16',
        fontHeading: 'Poppins',
        fontBody: 'Inter',
    },
    mono: {
        primary: '#111827',
        secondary: '#374151',
        background: '#ffffff',
        text: '#111827',
        accent: '#6b7280',
        fontHeading: 'Poppins',
        fontBody: 'Inter',
    },
};

export function resolveTheme(name?: string): Theme {
    return (name && DEFAULT_THEMES[name]) || DEFAULT_THEMES.midnight;
}
