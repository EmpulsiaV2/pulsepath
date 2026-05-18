'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Check } from 'lucide-react';

const FEATURES = [
  { label: 'Weekly scheduling',      desc: 'Set tasks for specific days of the week' },
  { label: 'Swipe to complete',      desc: 'Left to done, right to delete — fluid gestures' },
  { label: 'Streak tracking',        desc: 'Build momentum with 7-day history' },
  { label: 'Push notifications',     desc: 'Get reminded before tasks are due' },
  { label: 'Add to Home Screen',     desc: 'App-like experience from your home screen' },
  { label: 'Morning / Evening split','desc': 'Organize tasks by time of day' },
];

export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => { if (status === 'authenticated') router.push('/dashboard'); }, [status, router]);
  if (status === 'loading') return null;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--tx-1)', fontFamily: 'Geist, sans-serif' }}>

      {/* Background gradients */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(123,104,238,0.07) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-20%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(96,165,250,0.04) 0%, transparent 65%)' }} />
      </div>

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>PulsePath</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/login" style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, color: 'var(--tx-2)', textDecoration: 'none', borderRadius: 9, transition: 'color 0.15s' }}>
            Sign in
          </Link>
          <Link href="/signup" style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: 'white', textDecoration: 'none', borderRadius: 9 }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: 'relative', zIndex: 10, maxWidth: 720, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}
      >
        {/* Pill badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-3)', border: '1px solid var(--border-2)',
          borderRadius: 100, padding: '5px 12px', fontSize: 12, fontWeight: 600,
          color: 'var(--tx-2)', marginBottom: 28, letterSpacing: '-0.01em',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
          Daily routine tracker
        </div>

        <h1 style={{ fontSize: 'clamp(38px, 7vw, 68px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20 }}>
          Your daily routine,
          <br />
          <span style={{ background: 'linear-gradient(135deg, var(--accent-text) 0%, var(--accent) 60%, var(--blue) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            finally effortless
          </span>
        </h1>

        <p style={{ fontSize: 17, color: 'var(--tx-2)', lineHeight: 1.65, maxWidth: 480, margin: '0 auto 36px', letterSpacing: '-0.01em' }}>
          Schedule tasks for specific days of the week, swipe to complete, track your streaks — a productivity app that gets out of your way.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'var(--accent)', color: 'white',
            padding: '13px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700,
            textDecoration: 'none', letterSpacing: '-0.01em',
            boxShadow: '0 4px 24px rgba(123,104,238,0.35)',
          }}>
            Get started free <ArrowRight size={15} />
          </Link>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'var(--bg-3)', color: 'var(--tx-2)',
            border: '1px solid var(--border-2)',
            padding: '13px 22px', borderRadius: 12, fontSize: 14, fontWeight: 600,
            textDecoration: 'none', letterSpacing: '-0.01em',
          }}>
            Sign in
          </Link>
        </div>
      </motion.section>

      {/* Mock phone */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{ position: 'relative', zIndex: 10, maxWidth: 280, margin: '0 auto 80px', padding: '0 24px' }}
      >
        <div style={{
          background: 'var(--bg-2)', border: '1px solid var(--border-2)',
          borderRadius: 28, padding: '20px 16px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        }}>
          {/* Phone header */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ height: 8, width: 80, borderRadius: 4, background: 'var(--bg-4)', marginBottom: 5 }} />
                <div style={{ height: 14, width: 110, borderRadius: 4, background: 'var(--bg-3)' }} />
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }} />
            </div>
            <div style={{ height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '60%', background: 'var(--accent)', borderRadius: 1 }} />
            </div>
          </div>

          {/* Mock tasks */}
          {[
            { e: '🌅', t: 'Wake up',       c: '#fb923c', time: '7:00 AM', done: true  },
            { e: '🦷', t: 'Brush teeth',   c: '#60a5fa', time: '7:05 AM', done: true  },
            { e: '🚿', t: 'Cold shower',   c: '#34d399', time: '7:15 AM', done: false },
            { e: '💪', t: 'Workout',       c: '#7b68ee', time: '8:00 AM', done: false },
            { e: '📖', t: 'Read 20 pages', c: '#f472b6', time: '9:00 AM', done: false },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', marginBottom: 5,
              background: item.done ? 'transparent' : 'var(--bg-3)',
              border: `1px solid ${item.done ? 'var(--border)' : 'var(--border-2)'}`,
              borderRadius: 9, opacity: item.done ? 0.4 : 1,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: `${item.c}18`, border: `1px solid ${item.c}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{item.e}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: item.done ? 'var(--tx-4)' : 'var(--tx-1)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.t}</div>
                <div style={{ fontSize: 9, color: 'var(--tx-4)', fontFamily: 'Geist Mono, monospace' }}>{item.time}</div>
              </div>
              {item.done && <Check size={12} color="var(--green)" strokeWidth={2.5} />}
            </div>
          ))}
        </div>
        {/* glow */}
        <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', width: '70%', height: 30, background: 'rgba(123,104,238,0.2)', filter: 'blur(20px)', borderRadius: '50%' }} />
      </motion.div>

      {/* Features grid */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 10, maxWidth: 760, margin: '0 auto', padding: '0 24px 80px' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              style={{ padding: '16px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={10} color="var(--accent-text)" strokeWidth={3} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{f.label}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--tx-3)', lineHeight: 1.5, paddingLeft: 25 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px 80px' }}>
        <Link href="/signup" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--accent)', color: 'white',
          padding: '14px 28px', borderRadius: 13, fontSize: 15, fontWeight: 700,
          textDecoration: 'none', letterSpacing: '-0.01em',
          boxShadow: '0 4px 24px rgba(123,104,238,0.3)',
        }}>
          Start for free <ArrowRight size={16} />
        </Link>
        <p style={{ fontSize: 12, color: 'var(--tx-4)', marginTop: 12 }}>No credit card required</p>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <p style={{ fontSize: 12, color: 'var(--tx-4)' }}>© 2025 PulsePath</p>
      </footer>
    </div>
  );
}
