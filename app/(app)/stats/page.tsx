'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Flame, Trophy, CheckCircle2, Target } from 'lucide-react';
import toast from 'react-hot-toast';

interface DayStats { date: string; total: number; completed: number; percentage: number; }
interface StatsData {
  streak: { current: number; longest: number };
  todayProgress: { completed: number; total: number; percentage: number };
  dayStats: DayStats[];
  topTasks: Array<{ task?: { id: string; title: string; emoji: string; color: string }; completions: number }>;
  totalTasks: number;
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: '16px', borderRadius: 12,
      background: 'var(--bg-2)', border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Icon size={13} style={{ color }} strokeWidth={2} />
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--tx-3)' }}>{label}</span>
      </div>
      <p style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', fontFamily: 'Geist Mono, monospace', color }}>{value}</p>
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats]   = useState<StatsData | null>(null);
  const [loading, setLoad]  = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/stats');
      if (!r.ok) throw new Error();
      setStats(await r.json());
    } catch { toast.error('Failed to load stats'); }
    finally { setLoad(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="page">
      <div className="page-header" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ padding: '16px 20px 14px', maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--tx-3)', marginBottom: 3 }}>
            Overview
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em' }}>Statistics</h1>
        </div>
      </div>

      <div className="page-body">
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skel" style={{ height: 80, borderRadius: 12 }} />
              ))}
            </div>
          ) : !stats ? null : (
            <>
              {/* Stat cards */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
              >
                <StatCard icon={Flame}       label="Streak"     value={`${stats.streak.current}d`}  color="var(--orange)" />
                <StatCard icon={Trophy}      label="Best ever"  value={`${stats.streak.longest}d`}  color="var(--blue)" />
                <StatCard icon={CheckCircle2} label="Today"     value={`${stats.todayProgress.completed}/${stats.todayProgress.total}`} color="var(--green)" />
                <StatCard icon={Target}       label="Avg rate"  value={`${Math.round(stats.dayStats.reduce((a, d) => a + d.percentage, 0) / Math.max(stats.dayStats.length, 1))}%`} color="var(--accent-text)" />
              </motion.div>

              {/* 7-day bar chart */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ padding: '18px 16px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>7-Day Completion</p>
                  <p style={{ fontSize: 11, color: 'var(--tx-3)' }}>% of tasks done</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 96 }}>
                  {stats.dayStats.map((day, i) => {
                    const isTd  = day.date === today;
                    const barH  = Math.max((day.percentage / 100) * 80, day.percentage > 0 ? 4 : 2);
                    const color = day.percentage >= 100 ? 'var(--green)' : day.percentage >= 60 ? 'var(--accent)' : day.percentage > 0 ? 'var(--orange)' : 'var(--border-3)';

                    return (
                      <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: 9, fontFamily: 'Geist Mono, monospace', color: day.percentage > 0 ? color : 'var(--tx-4)', fontWeight: 600, height: 12, display: 'flex', alignItems: 'center' }}>
                          {day.percentage > 0 ? `${day.percentage}` : ''}
                        </span>
                        <div style={{ width: '100%', height: 80, display: 'flex', alignItems: 'flex-end' }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: barH }}
                            transition={{ delay: 0.15 + i * 0.05, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                            style={{
                              width: '100%', borderRadius: 4,
                              background: isTd ? color : `${color}60`,
                              boxShadow: isTd && day.percentage > 0 ? `0 0 10px ${color}40` : 'none',
                            }}
                          />
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 600,
                          color: isTd ? 'var(--tx-1)' : 'var(--tx-3)',
                          letterSpacing: '-0.01em',
                        }}>
                          {isTd ? 'Today' : format(parseISO(day.date), 'EEE')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Streak calendar */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ padding: '18px 16px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: 'var(--orange-dim)', border: '1px solid rgba(251,146,60,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Flame size={16} color="var(--orange)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>Streak Calendar</p>
                    <p style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 1 }}>
                      {stats.streak.current > 0 ? `${stats.streak.current}-day streak 🔥` : 'Complete all tasks to start a streak'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {stats.dayStats.map((day, i) => {
                    const isTd    = day.date === today;
                    const perfect = day.percentage === 100;
                    const partial = day.percentage > 0 && day.percentage < 100;

                    return (
                      <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 500 }}
                          style={{
                            width: '100%', aspectRatio: '1',
                            borderRadius: 8,
                            background: perfect ? 'var(--orange-dim)' : partial ? 'rgba(251,191,36,0.08)' : 'var(--bg-3)',
                            border: `1px solid ${perfect ? 'rgba(251,146,60,0.25)' : partial ? 'rgba(251,191,36,0.15)' : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14,
                            boxShadow: perfect && isTd ? '0 0 12px rgba(251,146,60,0.3)' : 'none',
                          }}
                        >
                          {perfect ? '🔥' : partial ? '✦' : ''}
                        </motion.div>
                        <span style={{ fontSize: 9, fontWeight: 600, color: isTd ? 'var(--tx-2)' : 'var(--tx-4)', letterSpacing: '0.03em' }}>
                          {isTd ? 'TOD' : format(parseISO(day.date), 'EEE').slice(0, 3).toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: 1, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  {[
                    { label: 'Current',  val: stats.streak.current,  color: 'var(--orange)' },
                    { label: 'Best',     val: stats.streak.longest,  color: 'var(--blue)' },
                    { label: 'Perfect',  val: stats.dayStats.filter(d => d.percentage === 100).length, color: 'var(--green)' },
                  ].map((item, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                      <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Geist Mono, monospace', color: item.color, letterSpacing: '-0.02em' }}>{item.val}</p>
                      <p style={{ fontSize: 10, color: 'var(--tx-3)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Top tasks */}
              {stats.topTasks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  style={{ padding: '18px 16px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12 }}
                >
                  <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 14 }}>Most consistent</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {stats.topTasks.map(({ task, completions }, i) => {
                      if (!task) return null;
                      const max = stats.topTasks[0]?.completions ?? 1;
                      const pct = (completions / max) * 100;

                      return (
                        <div key={task.id}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <span style={{ fontSize: 15 }}>{task.emoji}</span>
                              <span style={{ fontSize: 13, color: 'var(--tx-2)', fontWeight: 500 }}>{task.title}</span>
                            </div>
                            <span style={{ fontSize: 11, fontFamily: 'Geist Mono, monospace', color: 'var(--tx-3)' }}>{completions}/7</span>
                          </div>
                          <div className="progress-track">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                              style={{ height: '100%', borderRadius: 100, background: task.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Today ring */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                style={{ padding: '18px 16px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 20 }}
              >
                <svg width="72" height="72" style={{ flexShrink: 0 }}>
                  <circle cx="36" cy="36" r="28" fill="none" stroke="var(--border-2)" strokeWidth="6" />
                  <motion.circle
                    cx="36" cy="36" r="28"
                    fill="none" stroke="var(--accent)" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - stats.todayProgress.percentage / 100) }}
                    transition={{ duration: 0.9, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                  />
                </svg>
                <div>
                  <p style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Geist Mono, monospace', letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {stats.todayProgress.percentage}<span style={{ fontSize: 16, color: 'var(--tx-3)', fontWeight: 500 }}>%</span>
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--tx-2)', marginTop: 4, fontWeight: 500 }}>Today&apos;s completion</p>
                  <p style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 1 }}>
                    {stats.todayProgress.completed} of {stats.todayProgress.total} tasks done
                  </p>
                </div>
              </motion.div>
            </>
          )}

          <div className="with-nav" />
        </div>
      </div>
    </div>
  );
}
