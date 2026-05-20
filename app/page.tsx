'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

const FEATURES = [
  { label:'Start & end times',     desc:'Schedule 7:00 – 7:30 AM, see duration at a glance' },
  { label:'Weekly scheduling',     desc:'Pick specific days — Mon/Wed/Fri, Weekdays, or any combo' },
  { label:'Swipe gestures',        desc:'Left to complete, right to delete — like the best iOS apps' },
  { label:'7-day streak tracking', desc:'Build momentum and see exactly how consistent you\'ve been' },
  { label:'Push notifications',    desc:'Get reminded right before a task is due' },
  { label:'Add to Home Screen',    desc:'Full-screen app experience from your iPhone or Android home' },
];

export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => { if (status === 'authenticated') router.push('/dashboard'); }, [status, router]);
  if (status === 'loading') return null;

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)', backgroundImage:'radial-gradient(ellipse 80% 60% at 15% 10%, rgba(255,210,160,0.28) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 85% 90%, rgba(255,200,140,0.18) 0%, transparent 55%)', color:'var(--tx-1)' }}>

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', maxWidth:880, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:'var(--ac)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, boxShadow:'0 3px 10px rgba(212,97,42,0.32), inset 0 1px 0 rgba(255,255,255,0.22)' }}>⚡</div>
          <span style={{ fontSize:15, fontWeight:700, letterSpacing:'-0.02em' }}>PulsePath</span>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <Link href="/login" style={{ padding:'8px 14px', fontSize:13, fontWeight:600, color:'var(--tx-2)', textDecoration:'none', borderRadius:9 }}>Sign in</Link>
          <Link href="/signup" style={{ padding:'8px 14px', fontSize:13, fontWeight:600, background:'var(--ac)', color:'white', textDecoration:'none', borderRadius:9, boxShadow:'0 2px 8px rgba(212,97,42,0.28)' }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45, ease:[0.4,0,0.2,1] }}
        style={{ maxWidth:680, margin:'0 auto', padding:'64px 24px 56px', textAlign:'center' }}>

        <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,252,247,0.85)', border:'0.5px solid var(--border-2)', borderRadius:100, padding:'5px 14px', fontSize:12, fontWeight:600, color:'var(--tx-2)', marginBottom:28, boxShadow:'var(--sh-sm)' }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', display:'inline-block' }} />
          Daily routine tracker
        </div>

        <h1 style={{ fontSize:'clamp(36px, 8vw, 64px)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1.04, marginBottom:20, color:'var(--tx-1)' }}>
          Your day,{' '}
          <span style={{ background:'linear-gradient(135deg, var(--ac) 0%, #e8784a 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            perfectly timed
          </span>
        </h1>

        <p style={{ fontSize:17, color:'var(--tx-2)', lineHeight:1.65, maxWidth:460, margin:'0 auto 36px', letterSpacing:'-0.01em' }}>
          Schedule tasks with start and end times, choose which days they repeat, and build streaks that actually motivate you.
        </p>

        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/signup" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'var(--ac)', color:'white', padding:'13px 24px', borderRadius:12, fontSize:14, fontWeight:700, textDecoration:'none', letterSpacing:'-0.01em', boxShadow:'0 4px 18px rgba(212,97,42,0.32), inset 0 1px 0 rgba(255,255,255,0.18)' }}>
            Get started free <ArrowRight size={15}/>
          </Link>
          <Link href="/login" style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,252,247,0.9)', color:'var(--tx-2)', border:'0.5px solid var(--border-2)', padding:'13px 24px', borderRadius:12, fontSize:14, fontWeight:600, textDecoration:'none', boxShadow:'var(--sh-sm)' }}>
            Sign in
          </Link>
        </div>
      </motion.section>

      {/* Mock phone */}
      <motion.div initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15, duration:0.55 }}
        style={{ maxWidth:260, margin:'0 auto 72px', padding:'0 24px' }}>
        <div className="glass-card" style={{ padding:'20px 16px', borderRadius:24, boxShadow:'0 24px 64px rgba(100,60,20,0.18), inset 0 1px 0 rgba(255,255,255,0.9)' }}>
          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div>
                <div style={{ height:7, width:72, borderRadius:4, background:'rgba(160,120,80,0.12)', marginBottom:5 }} />
                <div style={{ height:13, width:108, borderRadius:4, background:'rgba(160,120,80,0.09)' }} />
              </div>
              <div style={{ width:30, height:30, borderRadius:9, background:'var(--ac-dim)', border:'0.5px solid var(--ac-border)' }} />
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width:'60%' }} /></div>
          </div>
          {[
            { e:'🌅', t:'Wake up',     c:'#D4612A', t1:'7:00',  t2:'7:05',  done:true  },
            { e:'🦷', t:'Brush teeth', c:'#2460A8', t1:'7:05',  t2:'7:10',  done:true  },
            { e:'🚿', t:'Cold shower', c:'#4D7C2A', t1:'7:15',  t2:'7:30',  done:false },
            { e:'💪', t:'Workout',     c:'#C87C10', t1:'8:00',  t2:'9:00',  done:false },
            { e:'📖', t:'Read',        c:'#8B4E8A', t1:'9:00',  t2:'9:20',  done:false },
          ].map((item,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 10px', marginBottom:5, background: item.done ? 'transparent' : 'rgba(255,252,247,0.85)', border:`0.5px solid ${item.done ? 'rgba(160,120,80,0.08)' : 'rgba(160,120,80,0.14)'}`, borderRadius:11, opacity:item.done?0.42:1, boxShadow:item.done?'none':'var(--sh-sm)' }}>
              <div style={{ width:28, height:28, borderRadius:8, background:`${item.c}18`, border:`1px solid ${item.c}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{item.e}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:600, color:item.done?'var(--tx-4)':'var(--tx-1)', textDecoration:item.done?'line-through':'none' }}>{item.t}</div>
                <div style={{ fontSize:9, color:'var(--tx-4)', fontFamily:'JetBrains Mono,monospace' }}>{item.t1} – {item.t2} AM</div>
              </div>
              {item.done && <Check size={11} color="var(--green)" strokeWidth={2.5} />}
            </div>
          ))}
        </div>
        <div style={{ position:'relative', height:0 }}>
          <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', top:-10, width:'65%', height:24, background:'rgba(212,97,42,0.14)', filter:'blur(16px)', borderRadius:'50%' }} />
        </div>
      </motion.div>

      {/* Features */}
      <motion.section initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
        style={{ maxWidth:720, margin:'0 auto', padding:'0 20px 72px' }}>
        <h2 style={{ fontSize:26, fontWeight:700, letterSpacing:'-0.03em', color:'var(--tx-1)', textAlign:'center', marginBottom:6 }}>Everything you need</h2>
        <p style={{ fontSize:14, color:'var(--tx-3)', textAlign:'center', marginBottom:28 }}>Nothing you don&apos;t.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:10 }}>
          {FEATURES.map((f,i) => (
            <motion.div key={i} initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.06 }}
              className="glass-card" style={{ padding:'16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
                <div style={{ width:20, height:20, borderRadius:6, background:'var(--ac-dim)', border:'0.5px solid var(--ac-border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Check size={11} color="var(--ac)" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--tx-1)', letterSpacing:'-0.01em' }}>{f.label}</span>
              </div>
              <p style={{ fontSize:12, color:'var(--tx-3)', lineHeight:1.55, paddingLeft:27 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <section style={{ textAlign:'center', padding:'0 24px 72px' }}>
        <Link href="/signup" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--ac)', color:'white', padding:'14px 28px', borderRadius:13, fontSize:15, fontWeight:700, textDecoration:'none', boxShadow:'0 6px 24px rgba(212,97,42,0.28), inset 0 1px 0 rgba(255,255,255,0.18)' }}>
          Start for free <ArrowRight size={16}/>
        </Link>
        <p style={{ fontSize:12, color:'var(--tx-4)', marginTop:12 }}>No credit card required</p>
      </section>

      <footer style={{ borderTop:'0.5px solid var(--border-2)', padding:'20px 24px', textAlign:'center' }}>
        <p style={{ fontSize:12, color:'var(--tx-4)' }}>© 2025 PulsePath</p>
      </footer>
    </div>
  );
}
