'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, Zap, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function ResetForm() {
  const router = useRouter();
  const token  = useSearchParams().get('token');
  const [pwd, setPwd]     = useState('');
  const [conf, setConf]   = useState('');
  const [show, setShow]   = useState(false);
  const [load, setLoad]   = useState(false);
  const [done, setDone]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token)          return toast.error('Invalid reset link');
    if (pwd.length < 8)  return toast.error('Min 8 characters');
    if (pwd !== conf)    return toast.error("Passwords don't match");
    setLoad(true);
    try {
      const r = await fetch('/api/auth/forgot-password?action=reset', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: pwd }),
      });
      if (!r.ok) { const j = await r.json(); throw new Error(j.error); }
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setLoad(false); }
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 400, background: 'radial-gradient(ellipse, rgba(123,104,238,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 360, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>PulsePath</span>
          </Link>
        </div>
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--green-dim)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={24} color="var(--green)" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Password updated</h2>
            <p style={{ fontSize: 13, color: 'var(--tx-3)' }}>Redirecting to sign in…</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', marginBottom: 6 }}>Set new password</h1>
            <p style={{ fontSize: 14, color: 'var(--tx-3)', textAlign: 'center', marginBottom: 24 }}>Must be at least 8 characters</p>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 16, padding: 24 }}>
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx-2)', marginBottom: 7 }}>New password</label>
                  <div style={{ position: 'relative' }}>
                    <input value={pwd} onChange={e => setPwd(e.target.value)} type={show ? 'text' : 'password'} placeholder="Min. 8 characters" className="field" style={{ paddingRight: 42 }} required />
                    <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--tx-3)', cursor: 'pointer', display: 'flex', padding: 4 }}>
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--tx-2)', marginBottom: 7 }}>Confirm password</label>
                  <input value={conf} onChange={e => setConf(e.target.value)} type={show ? 'text' : 'password'} placeholder="••••••••" className="field" required />
                </div>
                <button type="submit" disabled={load} className="btn btn-accent btn-full" style={{ marginTop: 4 }}>
                  {load ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Resetting…</> : 'Reset password'}
                </button>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function ResetPage() {
  return <Suspense><ResetForm /></Suspense>;
}
