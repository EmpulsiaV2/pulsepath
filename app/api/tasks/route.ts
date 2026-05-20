import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getTodayString, getCurrentDayAbbr } from '@/lib/utils';

function deriveTimeOfDay(t?: string | null): 'morning'|'afternoon'|'evening' {
  if (!t) return 'morning';
  const h = parseInt(t.split(':')[0], 10);
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const clean = (v?: string | null) => (v && v.trim() ? v : undefined);

const createSchema = z.object({
  title:            z.string().min(1).max(100),
  emoji:            z.string().default('⚡'),
  color:            z.string().default('#D4612A'),
  timeOfDay:        z.enum(['morning','afternoon','evening']).default('morning'),
  scheduledTime:    z.string().optional().transform(clean),
  scheduledEndTime: z.string().optional().transform(clean),
  isRecurring:      z.boolean().default(true),
  recurDays:        z.array(z.string()).default(['mon','tue','wed','thu','fri','sat','sun']),
  notes:            z.string().optional().transform(clean),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today    = getTodayString();
    const todayDay = getCurrentDayAbbr();

    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id, isActive: true },
      include: { completions: { where: { date: today } } },
      orderBy: [{ timeOfDay: 'asc' }, { order: 'asc' }, { scheduledTime: 'asc' }],
    });

    const filtered = tasks.filter((t: typeof tasks[0]) => {
      if (!t.isRecurring) return true;
      if (!t.recurDays || t.recurDays.length === 0) return true;
      return t.recurDays.includes(todayDay);
    });

    return NextResponse.json({
      tasks: filtered.map((t: typeof tasks[0]) => ({ ...t, isCompleted: t.completions.length > 0 })),
    });
  } catch (e) {
    console.error('[TASKS_GET]', e);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = createSchema.parse(await req.json());
    const timeOfDay = data.scheduledTime ? deriveTimeOfDay(data.scheduledTime) : data.timeOfDay;

    const last = await prisma.task.findFirst({
      where: { userId: session.user.id, timeOfDay },
      orderBy: { order: 'desc' },
    });

    const task = await prisma.task.create({
      data: { ...data, timeOfDay, userId: session.user.id, order: (last?.order ?? -1) + 1 },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    console.error('[TASKS_POST]', e);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
