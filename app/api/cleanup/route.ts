import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { format, subDays } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    // Allow cron job via secret header OR Vercel cron auth
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cutoffDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');

    const deleted = await prisma.taskCompletion.deleteMany({
      where: {
        date: { lt: cutoffDate },
      },
    });

    // Also clean up inactive tasks older than 30 days
    const deletedTasks = await prisma.task.deleteMany({
      where: {
        isActive: false,
        updatedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    return NextResponse.json({
      success: true,
      deleted: {
        completions: deleted.count,
        inactiveTasks: deletedTasks.count,
      },
    });
  } catch (error) {
    console.error('[CLEANUP]', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
