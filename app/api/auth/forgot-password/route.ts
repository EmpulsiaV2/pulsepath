import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const requestSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'reset') {
      const { token, password } = resetSchema.parse(body);

      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: { gt: new Date() },
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
      }

      const hashed = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashed,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return NextResponse.json({ success: true });
    }

    // Request password reset
    const { email } = requestSchema.parse(body);
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = nanoid(32);
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    // In production, send email here. For now, return token in dev.
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    console.log(`[PASSWORD RESET] ${email}: ${resetUrl}`);

    return NextResponse.json({
      success: true,
      // Only expose in dev for testing
      ...(process.env.NODE_ENV === 'development' && { resetUrl }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('[FORGOT_PASSWORD]', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
