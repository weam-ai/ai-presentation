import { NextResponse } from 'next/server';
import { getSession } from '@/app/config/withSession';
import { presentations, sessionToUser } from '@/lib/presentations';
import { withHandler } from '@/lib/route-handler';
import { createFromOutlineSchema } from '@/lib/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withHandler(async (req: Request) => {
    const session = await getSession();
    if (!session?.user?._id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = createFromOutlineSchema.omit({ user: true }).parse(await req.json());
    const presentation = await presentations.createFromOutline({
        ...body,
        user: sessionToUser(session.user),
    });
    return NextResponse.json(presentation);
});
