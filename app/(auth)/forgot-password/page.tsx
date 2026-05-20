'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const [devLink, setDev] = useState<string|null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!email) return;
    setBusy(true);
    try {
      const r = await fetch('/api/auth/forgot-password', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email }) });
      const j = await r.json();
      setSent(true); if (j.resetUrl) setDev(j.resetUrl);
    } catch { toast.error('Something went wrong'); }
    finally { setBusy(false); }
  };

  const authBg = { minHeight:'100dvh', background:'var(--bg)', backgroundImage:'radial-gradient(ellipse 80% 60% at 15% 10%, rgba(255,210,160,0.22) 0%, transparent 60%)', display:'flex' as const, flexDirection:'column' as const, alignItems:'center' as const, justifyContent:'center' as const, padding:'24px 20px' };

  return (
    <div style={authBg}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ width:'100%', maxWidth:360 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:9, textDecoration:'none', marginBottom:24 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:'var(--ac)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(212,97,42,0.35)', fontSize:19 }}>⚡</div>
            <span style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.02em', color:'var(--tx-1)' }}>PulsePath</span>
          </Link>
        </div>

        {sent ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ width:60, height:60, borderRadius:18, background:'var(--green-dim)', border:'0.5px solid rgba(77,124,42,0.22)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', boxShadow:'var(--sh-md)' }}>
              <CheckCircle size={26} color="var(--green)" />
            </div>
            <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.02em', color:'var(--tx-1)', marginBottom:8 }}>Check your inbox</h2>
            <p style={{ fontSize:13, color:'var(--tx-3)', marginBottom:20, lineHeight:1.6 }}>If an account exists for that email, we&apos;ve sent a reset link.</p>
            {devLink && (
              <div style={{ background:'rgba(200,124,16,0.08)', border:'0.5px solid rgba(200,124,16,0.20)', borderRadius:10, padding:'10px 12px', marginBottom:18, textAlign:'left' }}>
                <p style={{ fontSize:10, color:'var(--amber)', fontFamily:'JetBrains Mono,monospace', wordBreak:'break-all' }}>[DEV] {devLink}</p>
              </div>
            )}
            <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--ac)', fontSize:13, fontWeight:600, textDecoration:'none' }}>
              <ArrowLeft size={13}/> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.03em', color:'var(--tx-1)', textAlign:'center', marginBottom:6 }}>Reset password</h1>
            <p style={{ fontSize:14, color:'var(--tx-3)', textAlign:'center', marginBottom:24 }}>Enter your email and we&apos;ll send a reset link</p>
            <div className="glass-card" style={{ padding:'24px' }}>
              <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--tx-2)', marginBottom:7 }}>Email address</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="field" required />
                </div>
                <button type="submit" disabled={busy} className="btn btn-accent btn-full">
                  {busy ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Sending…</> : 'Send reset link'}
                </button>
              </form>
            </div>
            <p style={{ textAlign:'center', marginTop:20 }}>
              <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--ac)', fontSize:13, fontWeight:600, textDecoration:'none' }}>
                <ArrowLeft size={13}/> Back to sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
