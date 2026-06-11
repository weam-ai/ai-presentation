import { NextResponse } from 'next/server';
import { generation } from '@/lib/generation';
import { withHandler } from '@/lib/route-handler';
import { generateOutlineSchema } from '@/lib/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withHandler(async (req: Request) => {
    const body = generateOutlineSchema.parse(await req.json());
    const outline = await generation.generateOutline(body);
    return NextResponse.json(outline);
});
