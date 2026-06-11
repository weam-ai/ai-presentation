import { NextResponse } from 'next/server';
import { images } from '@/lib/images';
import { nodeRuntime, withHandler } from '@/lib/route-handler';

export const runtime = nodeRuntime.runtime;
export const dynamic = nodeRuntime.dynamic;

export const GET = withHandler(async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? '';
    const url = await images.search(q);
    return NextResponse.json({ url, configured: images.isConfigured });
});
