import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = schema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        streaks: { create: {} },
        notificationPrefs: { create: {} },
      },
    });

    // Create default starter tasks
    await prisma.task.createMany({
      data: [
        { userId: user.id, title: 'Wake up', emoji: '🌅', color: '#f59e0b', timeOfDay: 'morning', scheduledTime: '07:00', order: 0 },
        { userId: user.id, title: 'Brush teeth', emoji: '🦷', color: '#06b6d4', timeOfDay: 'morning', scheduledTime: '07:05', order: 1 },
        { userId: user.id, title: 'Morning shower', emoji: '🚿', color: '#3b82f6', timeOfDay: 'morning', scheduledTime: '07:15', order: 2 },
        { userId: user.id, title: 'Exercise', emoji: '💪', color: '#10b981', timeOfDay: 'morning', scheduledTime: '08:00', order: 3 },
        { userId: user.id, title: 'Breakfast', emoji: '🥗', color: '#f97316', timeOfDay: 'morning', scheduledTime: '08:45', order: 4 },
        { userId: user.id, title: 'Deep work block', emoji: '💻', color: '#6366f1', timeOfDay: 'afternoon', scheduledTime: '14:00', order: 5 },
        { userId: user.id, title: 'Evening walk', emoji: '🌙', color: '#8b5cf6', timeOfDay: 'evening', scheduledTime: '19:00', order: 6 },
      ],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('[REGISTER]', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
