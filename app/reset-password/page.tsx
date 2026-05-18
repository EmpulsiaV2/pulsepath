'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    if (!token) return toast.error('Invalid reset link');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password?action=reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090c] flex flex-col items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_24px_rgba(99,102,241,0.5)]">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold">PulsePath</span>
          </Link>
        </div>

        {done ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-xl font-bold mb-2">Password reset!</h1>
            <p className="text-white/40 text-sm">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-1">Set new password</h1>
              <p className="text-white/40 text-sm">Enter your new secure password</p>
            </div>
            <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
              <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">New password</label>
                  <div className="relative">
                    <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" className="input-base w-full px-4 py-3 pr-11 text-sm" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{String(errors.password.message)}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Confirm password</label>
                  <input {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="input-base w-full px-4 py-3 text-sm" />
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{String(errors.confirmPassword.message)}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset password'}
                </button>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
