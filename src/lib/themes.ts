import type { Theme, ThemeName } from './types';

export const THEMES: Record<ThemeName, Theme> = {
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

export const THEME_LABELS: Record<ThemeName, string> = {
    midnight: 'Midnight',
    sunrise: 'Sunrise',
    forest: 'Forest',
    mono: 'Mono',
};
