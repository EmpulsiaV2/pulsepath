'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      const result = await res.json();
      setSent(true);
      if (result.resetUrl) setDevLink(result.resetUrl);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090c] flex flex-col items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_24px_rgba(99,102,241,0.5)]">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold">PulsePath</span>
          </Link>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-xl font-bold mb-2">Check your inbox</h1>
            <p className="text-white/40 text-sm mb-6">
              If an account exists for that email, we&apos;ve sent a password reset link.
            </p>
            {devLink && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-6 text-left">
                <p className="text-yellow-400 text-xs font-mono break-all">
                  <strong>[DEV]</strong> {devLink}
                </p>
              </div>
            )}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-1">Reset password</h1>
              <p className="text-white/40 text-sm">Enter your email to receive a reset link</p>
            </div>

            <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Email address</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="input-base w-full px-4 py-3 text-sm"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send reset link'}
                </button>
              </form>
            </div>

            <p className="text-center text-sm text-white/40 mt-6">
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
