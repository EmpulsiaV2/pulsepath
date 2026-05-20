'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface F { name:string; email:string; password:string; confirm:string; }

export default function SignupPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, watch, formState:{ errors } } = useForm<F>();
  const pwd = watch('password','');

  const onSubmit = async (d: F) => {
    setBusy(true);
    try {
      const r = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name:d.name, email:d.email, password:d.password }) });
      const j = await r.json();
      if (!r.ok) { toast.error(j.error); return; }
      const s = await signIn('credentials', { email:d.email, password:d.password, redirect:false });
      if (s?.error) router.push('/login'); else { router.push('/dashboard'); router.refresh(); }
    } catch { toast.error('Something went wrong'); }
    finally { setBusy(false); }
  };

  return (
    <div style={{
      minHeight:'100dvh', background:'var(--bg)',
      backgroundImage:'radial-gradient(ellipse 80% 60% at 15% 10%, rgba(255,210,160,0.22) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 85% 90%, rgba(255,200,140,0.14) 0%, transparent 55%)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 20px',
    }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35, ease:[0.4,0,0.2,1] }}
        style={{ width:'100%', maxWidth:360 }}>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:9, textDecoration:'none', marginBottom:24 }}>
            <div style={{ width:38, height:38, borderRadius:11, background:'var(--ac)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(212,97,42,0.35), inset 0 1px 0 rgba(255,255,255,0.25)', fontSize:19 }}>⚡</div>
            <span style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.02em', color:'var(--tx-1)' }}>PulsePath</span>
          </Link>
          <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.03em', color:'var(--tx-1)', marginBottom:6 }}>Create account</h1>
          <p style={{ fontSize:14, color:'var(--tx-3)' }}>Start building your perfect daily routine</p>
        </div>

        <div className="glass-card" style={{ padding:'24px' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { key:'name' as const,    type:'text',     label:'Name',             placeholder:'Alex Johnson',    ac:'name' },
              { key:'email' as const,   type:'email',    label:'Email',            placeholder:'you@example.com', ac:'email' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--tx-2)', marginBottom:7 }}>{f.label}</label>
                <input {...register(f.key, { required:'Required', ...(f.key==='email'?{ pattern:{ value:/\S+@\S+\.\S+/, message:'Invalid email' } }:{ minLength:{ value:2, message:'Min 2 chars' } }) })}
                  type={f.type} placeholder={f.placeholder} autoComplete={f.ac} className="field" />
                {errors[f.key] && <p style={{ color:'var(--red)', fontSize:11, marginTop:4 }}>{errors[f.key]?.message}</p>}
              </div>
            ))}
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--tx-2)', marginBottom:7 }}>Password</label>
              <div style={{ position:'relative' }}>
                <input {...register('password', { required:'Required', minLength:{ value:8, message:'Min 8 chars' } })}
                  type={show?'text':'password'} placeholder="Min. 8 characters" autoComplete="new-password"
                  className="field" style={{ paddingRight:42 }} />
                <button type="button" onClick={() => setShow(!show)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--tx-3)', cursor:'pointer', padding:4 }}>
                  {show?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
              {errors.password && <p style={{ color:'var(--red)', fontSize:11, marginTop:4 }}>{errors.password.message}</p>}
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--tx-2)', marginBottom:7 }}>Confirm password</label>
              <input {...register('confirm', { required:'Required', validate: v => v===pwd || "Passwords don't match" })}
                type={show?'text':'password'} placeholder="••••••••" autoComplete="new-password" className="field" />
              {errors.confirm && <p style={{ color:'var(--red)', fontSize:11, marginTop:4 }}>{errors.confirm.message}</p>}
            </div>
            <button type="submit" disabled={busy} className="btn btn-accent btn-full" style={{ marginTop:4 }}>
              {busy ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Creating…</> : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontSize:13, color:'var(--tx-3)', marginTop:20 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color:'var(--ac)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
