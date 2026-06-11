import { NextResponse } from 'next/server';
import { getSession } from '@/app/config/withSession';
import { presentations } from '@/lib/presentations';
import { withHandler } from '@/lib/route-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withHandler(async () => {
    const session = await getSession();
    const userId = session?.user?._id;

    if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const items = await presentations.findAll(userId);
    return NextResponse.json(items);
});
