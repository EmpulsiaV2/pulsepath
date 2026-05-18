'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Zap, CheckCircle2, TrendingUp, Bell, Repeat2, Palette } from 'lucide-react';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const features = [
    { icon: CheckCircle2, title: 'Swipe to Complete', desc: 'Fluid swipe gestures to mark tasks done or delete them', color: '#10b981' },
    { icon: TrendingUp, title: '7-Day Streaks', desc: 'Build momentum with streak tracking and completion history', color: '#6366f1' },
    { icon: Bell, title: 'Smart Notifications', desc: 'Get reminded before tasks are due, even on mobile', color: '#f97316' },
    { icon: Repeat2, title: 'Recurring Routines', desc: 'Set tasks to repeat on specific days of the week', color: '#8b5cf6' },
    { icon: Palette, title: 'Custom Icons & Colors', desc: 'Personalize every task with emojis and color accents', color: '#06b6d4' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for mobile with smooth 60fps animations', color: '#f59e0b' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  if (status === 'loading') return null;

  return (
    <div className="min-h-screen bg-[#09090c] overflow-x-hidden">
      {/* Background mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute -bottom-1/2 -right-1/2 w-3/4 h-3/4 rounded-full bg-violet-600/8 blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 w-1/2 h-1/2 rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">PulsePath</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link
            href="/login"
            className="text-sm text-white/60 hover:text-white transition-colors px-3 py-2"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-6 pt-16 pb-20 max-w-3xl mx-auto"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white/70 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Now with streak tracking & push notifications
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
          Build routines that{' '}
          <span className="neon-text">actually stick</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          A beautiful daily routine tracker that feels like a native app. Plan your day, track your habits, and build powerful momentum — one task at a time.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:opacity-90 active:scale-95 transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)]"
          >
            <Zap className="w-5 h-5" strokeWidth={2.5} />
            Start for free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-medium px-8 py-4 rounded-2xl text-lg hover:bg-white/10 active:scale-95 transition-all"
          >
            I have an account
          </Link>
        </motion.div>

        {/* Mock phone */}
        <motion.div
          variants={itemVariants}
          className="mt-16 relative mx-auto max-w-xs"
        >
          <div className="relative bg-[#111114] rounded-[2rem] border border-white/10 p-4 shadow-[0_40px_80px_rgba(0,0,0,0.6)]" style={{ aspectRatio: '9/18' }}>
            {/* Mock UI */}
            <div className="h-full flex flex-col gap-3 overflow-hidden">
              <div className="flex items-center justify-between px-1">
                <div>
                  <div className="h-3 w-20 bg-white/20 rounded-full mb-1" />
                  <div className="h-2 w-14 bg-white/10 rounded-full" />
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-white/10" />
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 progress-glow" />
              </div>
              {/* Task cards */}
              {[
                { emoji: '🌅', label: 'Wake up', done: true, color: '#f59e0b', time: '7:00 AM' },
                { emoji: '🦷', label: 'Brush teeth', done: true, color: '#06b6d4', time: '7:05 AM' },
                { emoji: '🚿', label: 'Morning shower', done: false, color: '#3b82f6', time: '7:15 AM' },
                { emoji: '💪', label: 'Exercise', done: false, color: '#10b981', time: '8:00 AM' },
                { emoji: '☕', label: 'Breakfast', done: false, color: '#f97316', time: '8:45 AM' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    item.done
                      ? 'bg-white/3 border-white/5 opacity-50'
                      : 'bg-white/5 border-white/8'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `${item.color}20` }}
                  >
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-medium truncate ${item.done ? 'line-through text-white/30' : 'text-white/80'}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-white/30">{item.time}</div>
                  </div>
                  {item.done && (
                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Glow under phone */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-indigo-500/20 blur-2xl rounded-full" />
        </motion.div>
      </motion.section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need to build<br />powerful daily habits</h2>
          <p className="text-white/40 text-lg">Designed for people who take their routines seriously.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-white/4 border border-white/6 hover:border-white/12 transition-all group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}30` }}
              >
                <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 text-center px-6 py-20 max-w-2xl mx-auto"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to build your perfect routine?</h2>
        <p className="text-white/40 mb-8">Join thousands of people who&apos;ve transformed their mornings.</p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:opacity-90 active:scale-95 transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)]"
        >
          Get started free
          <Zap className="w-5 h-5" strokeWidth={2.5} />
        </Link>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-white/25 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-white/40">PulsePath</span>
        </div>
        <p>© 2025 PulsePath. Built for peak performance.</p>
      </footer>
    </div>
  );
}
