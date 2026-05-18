import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  tasks: z.array(z.object({
    id: z.string(),
    order: z.number(),
  })),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { tasks } = schema.parse(body);

    await Promise.all(
      tasks.map((t) =>
        prisma.task.updateMany({
          where: { id: t.id, userId: session.user.id },
          data: { order: t.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[REORDER]', error);
    return NextResponse.json({ error: 'Failed to reorder tasks' }, { status: 500 });
  }
}
