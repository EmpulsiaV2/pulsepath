'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface F { name: string; email: string; password: string; confirm: string; }

export default function SignupPage() {
  const router = useRouter();
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<F>();
  const pwd = watch('password', '');

  const onSubmit = async (d: F) => {
    setLoading(true);
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: d.name, email: d.email, password: d.password }),
      });
      const j = await r.json();
      if (!r.ok) { toast.error(j.error); return; }
      const s = await signIn('credentials', { email: d.email, password: d.password, redirect: false });
      if (s?.error) { router.push('/login'); } else { router.push('/dashboard'); router.refresh(); }
    } catch { toast.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(123,104,238,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: '100%', maxWidth: 360, position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit', marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(123,104,238,0.35)' }}>
              <Zap size={18} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>PulsePath</span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>Create account</h1>
          <p style={{ fontSize: 14, color: 'var(--tx-3)' }}>Start building your perfect routine</p>
        </div>

        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 16, padding: '24px' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx-2)', marginBottom: 7 }}>Name</label>
              <input {...register('name', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })} placeholder="Alex Johnson" autoComplete="name" className="field" />
              {errors.name && <p style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.name.message}</p>}
            </div>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx-2)', marginBottom: 7 }}>Email</label>
              <input {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid' } })} type="email" placeholder="you@example.com" autoComplete="email" className="field" />
              {errors.email && <p style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.email.message}</p>}
            </div>
            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx-2)', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} type={show ? 'text' : 'password'} placeholder="Min. 8 characters" autoComplete="new-password" className="field" style={{ paddingRight: 42 }} />
                <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--tx-3)', cursor: 'pointer', display: 'flex', padding: 4 }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.password.message}</p>}
            </div>
            {/* Confirm */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx-2)', marginBottom: 7 }}>Confirm password</label>
              <input {...register('confirm', { required: 'Required', validate: v => v === pwd || "Passwords don't match" })} type={show ? 'text' : 'password'} placeholder="••••••••" autoComplete="new-password" className="field" />
              {errors.confirm && <p style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.confirm.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn btn-accent btn-full" style={{ marginTop: 4 }}>
              {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Creating…</> : <>Create account <ArrowRight size={14} /></>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--tx-3)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent-text)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
