'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, Zap, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPage() {
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoad]  = useState(false);
  const [devLink, setDev]   = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoad(true);
    try {
      const r = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const j = await r.json();
      setSent(true);
      if (j.resetUrl) setDev(j.resetUrl);
    } catch { toast.error('Something went wrong'); }
    finally { setLoad(false); }
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(123,104,238,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 360, position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit', marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>PulsePath</span>
          </Link>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--green-dim)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={24} color="var(--green)" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Check your inbox</h2>
            <p style={{ fontSize: 13, color: 'var(--tx-3)', marginBottom: 20, lineHeight: 1.6 }}>If an account exists for that email, we&apos;ve sent a password reset link.</p>
            {devLink && (
              <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 10, padding: '10px 12px', marginBottom: 16, textAlign: 'left' }}>
                <p style={{ fontSize: 10, color: 'rgb(251,191,36)', fontFamily: 'Geist Mono, monospace', wordBreak: 'break-all' }}>[DEV] {devLink}</p>
              </div>
            )}
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-text)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              <ArrowLeft size={13} /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 6 }}>Reset password</h1>
            <p style={{ fontSize: 14, color: 'var(--tx-3)', textAlign: 'center', marginBottom: 24 }}>We&apos;ll send a reset link to your email</p>

            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 16, padding: '24px' }}>
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx-2)', marginBottom: 7 }}>Email address</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="field" required />
                </div>
                <button type="submit" disabled={loading} className="btn btn-accent btn-full">
                  {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Sending…</> : 'Send reset link'}
                </button>
              </form>
            </div>

            <p style={{ textAlign: 'center', marginTop: 20 }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent-text)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                <ArrowLeft size={13} /> Back to sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
