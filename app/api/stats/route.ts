import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getLast7Days, getTodayString } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const last7Days = getLast7Days();
    const today = getTodayString();

    // Get streak
    const streak = await prisma.streak.findUnique({ where: { userId } });

    // Get all active tasks
    const totalTasks = await prisma.task.count({
      where: { userId, isActive: true },
    });

    // Get completions for last 7 days
    const completions = await prisma.taskCompletion.findMany({
      where: {
        userId,
        date: { in: last7Days },
      },
    });

    // Build daily stats
    const dayStats = last7Days.map((date) => {
      const dayCompletions = completions.filter((c: {date: string}) => c.date === date);
      return {
        date,
        total: totalTasks,
        completed: dayCompletions.length,
        percentage: totalTasks > 0 ? Math.round((dayCompletions.length / totalTasks) * 100) : 0,
      };
    });

    // Today's progress
    const todayCompleted = completions.filter((c: {date: string}) => c.date === today).length;

    // Most completed tasks
    const taskCompletionCounts = await prisma.taskCompletion.groupBy({
      by: ['taskId'],
      where: { userId, date: { in: last7Days } },
      _count: { taskId: true },
      orderBy: { _count: { taskId: 'desc' } },
      take: 5,
    });

    const topTaskIds = taskCompletionCounts.map((t: {taskId: string}) => t.taskId);
    const topTasks = await prisma.task.findMany({
      where: { id: { in: topTaskIds } },
    });

    const topTasksWithCount = taskCompletionCounts.map((t: {taskId: string; _count: {taskId: number}}) => ({
      task: topTasks.find((task: {id: string}) => task.id === t.taskId),
      completions: t._count.taskId,
    }));

    return NextResponse.json({
      streak: {
        current: streak?.currentStreak ?? 0,
        longest: streak?.longestStreak ?? 0,
      },
      todayProgress: {
        completed: todayCompleted,
        total: totalTasks,
        percentage: totalTasks > 0 ? Math.round((todayCompleted / totalTasks) * 100) : 0,
      },
      dayStats,
      topTasks: topTasksWithCount,
      totalTasks,
    });
  } catch (error) {
    console.error('[STATS_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
