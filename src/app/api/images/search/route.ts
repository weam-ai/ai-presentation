import { NextResponse } from 'next/server';
import { images } from '@/lib/images';
import { withHandler } from '@/lib/route-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withHandler(async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') ?? '';
    const url = await images.search(q);
    return NextResponse.json({ url, configured: images.isConfigured });
});
