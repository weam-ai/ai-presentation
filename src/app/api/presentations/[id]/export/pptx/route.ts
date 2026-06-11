import { NextResponse } from 'next/server';
import { exportService } from '@/lib/export';
import { nodeRuntime, withHandler } from '@/lib/route-handler';

export const runtime = nodeRuntime.runtime;
export const dynamic = nodeRuntime.dynamic;

type Params = { params: Promise<{ id: string }> };

export const GET = withHandler(async (_req: Request, { params }: Params) => {
    const { id } = await params;
    const { buffer, filename } = await exportService.exportPptx(id);

    return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
});
