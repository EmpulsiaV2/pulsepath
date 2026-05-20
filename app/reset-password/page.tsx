'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function ResetForm() {
  const router = useRouter();
  const token  = useSearchParams().get('token');
  const [pwd, setPwd]   = useState('');
  const [conf, setConf] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token)         return toast.error('Invalid reset link');
    if (pwd.length < 8) return toast.error('Min 8 characters');
    if (pwd !== conf)   return toast.error("Passwords don't match");
    setBusy(true);
    try {
      const r = await fetch('/api/auth/forgot-password?action=reset', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ token, password:pwd }) });
      if (!r.ok) throw new Error((await r.json()).error);
      setDone(true); setTimeout(() => router.push('/login'), 2000);
    } catch(e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setBusy(false); }
  };

  const bg = { minHeight:'100dvh', background:'var(--bg)', backgroundImage:'radial-gradient(ellipse 80% 60% at 15% 10%, rgba(255,210,160,0.22) 0%, transparent 60%)', display:'flex' as const, alignItems:'center' as const, justifyContent:'center' as const, padding:'24px' };

  return (
    <div style={bg}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ width:'100%', maxWidth:360 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:9, textDecoration:'none' }}>
            <div style={{ width:38, height:38, borderRadius:11, background:'var(--ac)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:19 }}>⚡</div>
            <span style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.02em', color:'var(--tx-1)' }}>PulsePath</span>
          </Link>
        </div>
        {done ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ width:60, height:60, borderRadius:18, background:'var(--green-dim)', border:'0.5px solid rgba(77,124,42,0.22)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
              <CheckCircle size={26} color="var(--green)"/>
            </div>
            <h2 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.02em', color:'var(--tx-1)', marginBottom:6 }}>Password updated</h2>
            <p style={{ fontSize:13, color:'var(--tx-3)' }}>Redirecting to sign in…</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.03em', color:'var(--tx-1)', textAlign:'center', marginBottom:6 }}>Set new password</h1>
            <p style={{ fontSize:14, color:'var(--tx-3)', textAlign:'center', marginBottom:24 }}>Must be at least 8 characters</p>
            <div className="glass-card" style={{ padding:'24px' }}>
              <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--tx-2)', marginBottom:7 }}>New password</label>
                  <div style={{ position:'relative' }}>
                    <input value={pwd} onChange={e => setPwd(e.target.value)} type={show?'text':'password'} placeholder="Min. 8 characters" className="field" style={{ paddingRight:42 }} required />
                    <button type="button" onClick={() => setShow(!show)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--tx-3)', cursor:'pointer', padding:4 }}>
                      {show?<EyeOff size={15}/>:<Eye size={15}/>}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--tx-2)', marginBottom:7 }}>Confirm password</label>
                  <input value={conf} onChange={e => setConf(e.target.value)} type={show?'text':'password'} placeholder="••••••••" className="field" required />
                </div>
                <button type="submit" disabled={busy} className="btn btn-accent btn-full" style={{ marginTop:4 }}>
                  {busy ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Resetting…</> : 'Reset password'}
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
  return <Suspense><ResetForm/></Suspense>;
}
