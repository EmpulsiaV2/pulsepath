'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const { register, handleSubmit, formState:{ errors } } = useForm<{ email:string; password:string }>();

  const onSubmit = async (d: { email:string; password:string }) => {
    setBusy(true);
    const res = await signIn('credentials', { email:d.email, password:d.password, redirect:false });
    if (res?.error) { toast.error(res.error); setBusy(false); }
    else { router.push('/dashboard'); router.refresh(); }
  };

  return (
    <div style={{
      minHeight:'100dvh', background:'var(--bg)',
      backgroundImage:'radial-gradient(ellipse 80% 60% at 15% 10%, rgba(255,210,160,0.22) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 85% 90%, rgba(255,200,140,0.14) 0%, transparent 55%)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 20px',
    }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35, ease:[0.4,0,0.2,1] }}
        style={{ width:'100%', maxWidth:360 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:9, textDecoration:'none', marginBottom:24 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:'var(--ac)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(212,97,42,0.35), inset 0 1px 0 rgba(255,255,255,0.25)', fontSize:19 }}>⚡</div>
            <span style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.02em', color:'var(--tx-1)' }}>PulsePath</span>
          </Link>
          <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.03em', color:'var(--tx-1)', marginBottom:6 }}>Welcome back</h1>
          <p style={{ fontSize:14, color:'var(--tx-3)' }}>Sign in to continue your streak</p>
        </div>

        {/* Card */}
        <div className="glass-card" style={{ padding:'24px' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--tx-2)', marginBottom:7, letterSpacing:'0.01em' }}>Email</label>
              <input {...register('email', { required:'Required', pattern:{ value:/\S+@\S+\.\S+/, message:'Invalid email' } })}
                type="email" placeholder="you@example.com" autoComplete="email" className="field" />
              {errors.email && <p style={{ color:'var(--red)', fontSize:11, marginTop:4 }}>{errors.email.message}</p>}
            </div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'var(--tx-2)', letterSpacing:'0.01em' }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize:11, color:'var(--ac)', textDecoration:'none', fontWeight:500 }}>Forgot?</Link>
              </div>
              <div style={{ position:'relative' }}>
                <input {...register('password', { required:'Required' })}
                  type={show?'text':'password'} placeholder="••••••••" autoComplete="current-password"
                  className="field" style={{ paddingRight:42 }} />
                <button type="button" onClick={() => setShow(!show)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--tx-3)', cursor:'pointer', padding:4 }}>
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {errors.password && <p style={{ color:'var(--red)', fontSize:11, marginTop:4 }}>{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={busy} className="btn btn-accent btn-full" style={{ marginTop:4 }}>
              {busy ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Signing in…</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontSize:13, color:'var(--tx-3)', marginTop:20 }}>
          No account?{' '}
          <Link href="/signup" style={{ color:'var(--ac)', fontWeight:600, textDecoration:'none' }}>Create one free</Link>
        </p>
      </motion.div>
    </div>
  );
}
