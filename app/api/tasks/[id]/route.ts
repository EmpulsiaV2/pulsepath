import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getTodayString } from '@/lib/utils';

const updateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  emoji: z.string().optional(),
  color: z.string().optional(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']).optional(),
  scheduledTime: z.string().nullable().optional(),
  isRecurring: z.boolean().optional(),
  recurDays: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
  order: z.number().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await req.json();

    // Handle completion toggle
    if ('completed' in body) {
      const today = getTodayString();
      if (body.completed) {
        await prisma.taskCompletion.upsert({
          where: { taskId_date: { taskId: params.id, date: today } },
          create: { userId: session.user.id, taskId: params.id, date: today },
          update: {},
        });

        // Update streak
        await updateStreak(session.user.id);
      } else {
        await prisma.taskCompletion.deleteMany({
          where: { taskId: params.id, date: today },
        });
      }
      return NextResponse.json({ success: true });
    }

    const data = updateSchema.parse(body);
    const updated = await prisma.task.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ task: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('[TASK_PATCH]', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await prisma.task.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TASK_DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}

async function updateStreak(userId: string) {
  const today = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const streak = await prisma.streak.findUnique({ where: { userId } });

  // Check if all today's tasks are completed
  const totalTasks = await prisma.task.count({
    where: { userId, isActive: true },
  });

  const completedToday = await prisma.taskCompletion.count({
    where: { userId, date: today },
  });

  if (completedToday < totalTasks) return;

  // All tasks completed
  if (!streak) {
    await prisma.streak.create({
      data: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today },
    });
    return;
  }

  let newCurrent = streak.currentStreak;
  if (streak.lastActiveDate === yesterdayStr || streak.lastActiveDate === today) {
    newCurrent = streak.lastActiveDate === today ? streak.currentStreak : streak.currentStreak + 1;
  } else {
    newCurrent = 1;
  }

  await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: newCurrent,
      longestStreak: Math.max(newCurrent, streak.longestStreak),
      lastActiveDate: today,
    },
  });
}
