import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getTodayString, getCurrentDayAbbr } from '@/lib/utils';

const createSchema = z.object({
  title: z.string().min(1).max(100),
  emoji: z.string().default('⚡'),
  color: z.string().default('#6366f1'),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
  scheduledTime: z.string().optional(),
  isRecurring: z.boolean().default(true),
  recurDays: z.array(z.string()).default(['mon','tue','wed','thu','fri','sat','sun']),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = getTodayString();
    const todayDay = getCurrentDayAbbr();

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        completions: {
          where: { date: today },
        },
      },
      orderBy: [
        { timeOfDay: 'asc' },
        { order: 'asc' },
        { scheduledTime: 'asc' },
      ],
    });

    // Filter by recurring days
    const filtered = tasks.filter((task: typeof tasks[0]) => {
      if (!task.isRecurring) return true;
      return task.recurDays.includes(todayDay);
    });

    const mapped = filtered.map((task: typeof tasks[0]) => ({
      ...task,
      isCompleted: task.completions.length > 0,
    }));

    return NextResponse.json({ tasks: mapped });
  } catch (error) {
    console.error('[TASKS_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = createSchema.parse(body);

    const lastTask = await prisma.task.findFirst({
      where: { userId: session.user.id, timeOfDay: data.timeOfDay },
      orderBy: { order: 'desc' },
    });

    const task = await prisma.task.create({
      data: {
        ...data,
        userId: session.user.id,
        order: (lastTask?.order ?? -1) + 1,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('[TASKS_POST]', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
