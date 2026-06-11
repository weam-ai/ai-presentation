import { NextResponse } from 'next/server';
import { presentations } from '@/lib/presentations';
import { withHandler } from '@/lib/route-handler';
import { updatePresentationSchema } from '@/lib/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export const GET = withHandler(async (_req: Request, { params }: Params) => {
    const { id } = await params;
    const presentation = await presentations.findOne(id);
    return NextResponse.json(presentation);
});

export const PATCH = withHandler(async (req: Request, { params }: Params) => {
    const { id } = await params;
    const body = updatePresentationSchema.parse(await req.json());
    const presentation = await presentations.update(id, body);
    return NextResponse.json(presentation);
});

export const DELETE = withHandler(async (_req: Request, { params }: Params) => {
    const { id } = await params;
    const result = await presentations.remove(id);
    return NextResponse.json(result);
});
