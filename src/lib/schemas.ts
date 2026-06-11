import { z } from 'zod';

export const TONES = ['default', 'casual', 'professional', 'funny', 'educational', 'sales_pitch'] as const;
export const VERBOSITIES = ['concise', 'standard', 'text-heavy'] as const;

const toneSchema = z.enum(TONES);
const verbositySchema = z.enum(VERBOSITIES);

const userSchema = z.object({
    id: z.string().min(1),
    email: z.string().email(),
    name: z.string().min(1),
});

const slideLayoutSchema = z.enum([
    'title',
    'section',
    'bullets',
    'two-column',
    'image-right',
    'image-left',
    'image-full',
    'quote',
]);

const outlineItemSchema = z.object({
    title: z.string(),
    summary: z.string(),
    layout: slideLayoutSchema,
});

const outlineSchema = z.object({
    title: z.string(),
    items: z.array(outlineItemSchema),
});

export const generateOutlineSchema = z.object({
    content: z.string().min(3),
    instructions: z.string().optional(),
    tone: toneSchema.optional(),
    nSlides: z.number().int().min(1).max(30).optional(),
    language: z.string().optional(),
});

export const generatePresentationSchema = z.object({
    content: z.string().min(3),
    instructions: z.string().optional(),
    tone: toneSchema.optional(),
    verbosity: verbositySchema.optional(),
    nSlides: z.number().int().min(1).max(30).optional(),
    language: z.string().optional(),
    theme: z.string().optional(),
    includeTitleSlide: z.boolean().optional(),
    includeImages: z.boolean().optional(),
    user: userSchema,
});

export const createFromOutlineSchema = z.object({
    title: z.string().min(1),
    outline: outlineSchema,
    tone: toneSchema.optional(),
    verbosity: verbositySchema.optional(),
    language: z.string().optional(),
    theme: z.string().optional(),
    user: userSchema,
});

const themeSchema = z.object({
    primary: z.string(),
    secondary: z.string(),
    background: z.string(),
    text: z.string(),
    accent: z.string(),
    fontHeading: z.string(),
    fontBody: z.string(),
});

export const updatePresentationSchema = z.object({
    title: z.string().optional(),
    theme: themeSchema.optional(),
    slides: z.array(z.any()).optional(),
});

export type GenerateOutlineDto = z.infer<typeof generateOutlineSchema>;
export type GeneratePresentationDto = z.infer<typeof generatePresentationSchema>;
export type CreateFromOutlineDto = z.infer<typeof createFromOutlineSchema>;
export type UpdatePresentationDto = z.infer<typeof updatePresentationSchema>;
