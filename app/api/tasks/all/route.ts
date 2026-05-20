import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id, isActive: true },
      orderBy: [{ timeOfDay: 'asc' }, { order: 'asc' }, { scheduledTime: 'asc' }],
    });

    return NextResponse.json({ tasks });
  } catch (e) {
    console.error('[ALL_TASKS]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
