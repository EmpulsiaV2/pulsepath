import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { getTodayString } from '@/lib/utils';

const clean = (v?: string | null) => (v && v.trim() ? v : null);

const updateSchema = z.object({
  title:            z.string().min(1).max(100).optional(),
  emoji:            z.string().optional(),
  color:            z.string().optional(),
  timeOfDay:        z.enum(['morning','afternoon','evening']).optional(),
  scheduledTime:    z.string().nullable().optional().transform(clean),
  scheduledEndTime: z.string().nullable().optional().transform(clean),
  isRecurring:      z.boolean().optional(),
  recurDays:        z.array(z.string()).optional(),
  notes:            z.string().nullable().optional(),
  order:            z.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const task = await prisma.task.findFirst({ where: { id: params.id, userId: session.user.id } });
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const body = await req.json();

    if ('completed' in body) {
      const today = getTodayString();
      if (body.completed) {
        await prisma.taskCompletion.upsert({
          where: { taskId_date: { taskId: params.id, date: today } },
          create: { userId: session.user.id, taskId: params.id, date: today },
          update: {},
        });
        await updateStreak(session.user.id);
      } else {
        await prisma.taskCompletion.deleteMany({ where: { taskId: params.id, date: today } });
      }
      return NextResponse.json({ success: true });
    }

    const data = updateSchema.parse(body);
    const updated = await prisma.task.update({ where: { id: params.id }, data });
    return NextResponse.json({ task: updated });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    console.error('[TASK_PATCH]', e);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const task = await prisma.task.findFirst({ where: { id: params.id, userId: session.user.id } });
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    await prisma.task.update({ where: { id: params.id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[TASK_DELETE]', e);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}

async function updateStreak(userId: string) {
  const today = getTodayString();
  const yest  = new Date(); yest.setDate(yest.getDate() - 1);
  const yesterdayStr = yest.toISOString().split('T')[0];

  const total     = await prisma.task.count({ where: { userId, isActive: true } });
  const completed = await prisma.taskCompletion.count({ where: { userId, date: today } });
  if (completed < total) return;

  const streak = await prisma.streak.findUnique({ where: { userId } });
  if (!streak) { await prisma.streak.create({ data: { userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today } }); return; }

  const cur = (streak.lastActiveDate === yesterdayStr) ? streak.currentStreak + 1
    : (streak.lastActiveDate === today) ? streak.currentStreak : 1;

  await prisma.streak.update({ where: { userId }, data: { currentStreak: cur, longestStreak: Math.max(cur, streak.longestStreak), lastActiveDate: today } });
}
