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

export type Presentation = {
    id: string;
    title: string;
    topic: string;
    tone: string;
    language: string;
    theme: Theme;
    slides: Slide[];
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
