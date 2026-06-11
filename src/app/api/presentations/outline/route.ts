import { NextResponse } from 'next/server';
import { generation } from '@/lib/generation';
import { nodeRuntime, withHandler } from '@/lib/route-handler';
import { generateOutlineSchema } from '@/lib/schemas';

export const runtime = nodeRuntime.runtime;
export const dynamic = nodeRuntime.dynamic;

export const POST = withHandler(async (req: Request) => {
    const body = generateOutlineSchema.parse(await req.json());
    const outline = await generation.generateOutline(body);
    return NextResponse.json(outline);
});
