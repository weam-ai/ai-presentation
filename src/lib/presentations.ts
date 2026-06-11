import mongoose from 'mongoose';
import { NotFoundError } from './errors';
import { generation } from './generation';
import { PresentationModel, toDomain } from './models/presentation';
import type { CreateFromOutlineDto, GeneratePresentationDto, UpdatePresentationDto } from './schemas';
import { resolveTheme } from './types';
import type { Outline, Presentation, PresentationUser } from './types';

function assertValidId(id: string): void {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotFoundError(`Presentation ${id} not found`);
    }
}

export const presentations = {
    async generateAndSave(dto: GeneratePresentationDto): Promise<Presentation> {
        const { title, slides } = await generation.generateFull({
            content: dto.content,
            instructions: dto.instructions,
            tone: dto.tone,
            nSlides: dto.nSlides,
            language: dto.language,
            verbosity: dto.verbosity,
            includeImages: dto.includeImages,
        });

        const doc = await PresentationModel.create({
            title,
            topic: dto.content,
            tone: dto.tone ?? 'default',
            language: dto.language ?? 'English',
            theme: resolveTheme(dto.theme),
            slides,
            user: dto.user,
        });

        return toDomain(doc);
    },

    async createFromOutline(dto: CreateFromOutlineDto): Promise<Presentation> {
        const tone = dto.tone ?? 'default';
        const language = dto.language ?? 'English';
        const slides = await generation.generateSlidesFromOutline(dto.outline as Outline, {
            tone,
            verbosity: dto.verbosity,
            language,
        });

        const doc = await PresentationModel.create({
            title: dto.title,
            topic: dto.title,
            tone,
            language,
            theme: resolveTheme(dto.theme),
            slides,
            user: dto.user,
        });

        return toDomain(doc);
    },

    async findAll(userId?: string): Promise<Presentation[]> {
        const filter = userId ? { 'user.id': userId } : {};
        const docs = await PresentationModel.find(filter).sort({ updatedAt: -1 });
        return docs.map(toDomain);
    },

    async findOne(id: string): Promise<Presentation> {
        assertValidId(id);
        const doc = await PresentationModel.findById(id);
        if (!doc) {
            throw new NotFoundError(`Presentation ${id} not found`);
        }
        return toDomain(doc);
    },

    async update(id: string, dto: UpdatePresentationDto): Promise<Presentation> {
        const doc = await PresentationModel.findById(id);
        if (!doc) {
            throw new NotFoundError(`Presentation ${id} not found`);
        }

        if (dto.title !== undefined) doc.title = dto.title;
        if (dto.theme !== undefined) doc.theme = dto.theme;
        if (dto.slides !== undefined) doc.slides = dto.slides;

        await doc.save();
        return toDomain(doc);
    },

    async remove(id: string): Promise<{ id: string }> {
        const doc = await PresentationModel.findById(id);
        if (!doc) {
            throw new NotFoundError(`Presentation ${id} not found`);
        }
        await doc.deleteOne();
        return { id };
    },
};

export function sessionToUser(sessionUser: {
    _id: string;
    email: string;
    name?: string;
}): PresentationUser {
    return {
        id: sessionUser._id,
        email: sessionUser.email,
        name: sessionUser.name ?? sessionUser.email,
    };
}
