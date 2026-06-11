import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import type { Presentation, PresentationUser } from '../types';

const userSchema = new Schema(
    {
        id: { type: String, required: true },
        email: { type: String, required: true },
        name: { type: String, required: true },
    },
    { _id: false },
);

const presentationSchema = new Schema(
    {
        title: { type: String, required: true },
        topic: { type: String, required: true },
        tone: { type: String, default: 'default' },
        language: { type: String, default: 'English' },
        theme: { type: Schema.Types.Mixed, required: true },
        slides: { type: [Schema.Types.Mixed], default: [] },
        user: { type: userSchema, required: true },
    },
    {
        collection: 'solution_presentation',
        timestamps: true,
    },
);

presentationSchema.index({ 'user.id': 1, updatedAt: -1 });

export type PresentationDocument = InferSchemaType<typeof presentationSchema> & {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
};

export const PresentationModel =
    (mongoose.models.Presentation as mongoose.Model<PresentationDocument>) ||
    mongoose.model<PresentationDocument>('Presentation', presentationSchema);

export function toDomain(doc: PresentationDocument): Presentation {
    return {
        id: doc._id.toString(),
        title: doc.title,
        topic: doc.topic,
        tone: doc.tone ?? 'default',
        language: doc.language ?? 'English',
        theme: doc.theme as Presentation['theme'],
        slides: (doc.slides ?? []) as Presentation['slides'],
        user: doc.user as PresentationUser,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    };
}
