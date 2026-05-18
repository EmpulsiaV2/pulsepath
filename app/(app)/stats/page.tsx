'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Flame, TrendingUp, CheckCircle2, Target, Trophy, Zap } from 'lucide-react';
import { StatSkeleton } from '@/components/ui/Skeletons';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface DayStats {
  date: string;
  total: number;
  completed: number;
  percentage: number;
}

interface StatsData {
  streak: { current: number; longest: number };
  todayProgress: { completed: number; total: number; percentage: number };
  dayStats: DayStats[];
  topTasks: Array<{ task: { id: string; title: string; emoji: string; color: string } | undefined; completions: number }>;
  totalTasks: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch {
      toast.error('Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const getBarColor = (pct: number) => {
    if (pct >= 100) return '#10b981';
    if (pct >= 60) return '#6366f1';
    if (pct >= 30) return '#f59e0b';
    return '#ef4444';
  };

  const statCards = stats ? [
    { icon: Flame, label: 'Current streak', value: `${stats.streak.current}d`, color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
    { icon: Trophy, label: 'Longest streak', value: `${stats.streak.longest}d`, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { icon: CheckCircle2, label: 'Today', value: `${stats.todayProgress.completed}/${stats.todayProgress.total}`, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { icon: Target, label: 'Completion rate', value: `${Math.round(stats.dayStats.reduce((a, d) => a + d.percentage, 0) / Math.max(stats.dayStats.length, 1))}%`, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  ] : [];

  return (
    <div className="h-full overflow-y-auto with-bottom-nav">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#09090c]/90 backdrop-blur-xl border-b border-white/4 safe-top">
        <div className="px-4 pt-4 pb-3 max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Statistics</h1>
            <p className="text-xs text-white/35">Last 7 days overview</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 max-w-xl mx-auto space-y-5">
        {isLoading ? (
          <StatSkeleton />
        ) : !stats ? (
          <div className="text-center py-16 text-white/30">No data available</div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              {statCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="p-4 rounded-2xl border border-white/6"
                  style={{ background: card.bg }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <card.icon className="w-4 h-4" style={{ color: card.color }} />
                    <span className="text-xs text-white/40 font-medium">{card.label}</span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
                </motion.div>
              ))}
            </div>

            {/* 7-day chart */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-2xl bg-white/3 border border-white/6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">7-Day Completion</h2>
                <span className="text-xs text-white/30">% of tasks done</span>
              </div>

              <div className="flex items-end gap-2 h-28">
                {stats.dayStats.map((day, i) => {
                  const isToday = day.date === format(new Date(), 'yyyy-MM-dd');
                  const barH = Math.max(day.percentage, 4);
                  const color = getBarColor(day.percentage);

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-semibold" style={{ color }}>
                        {day.percentage > 0 ? `${day.percentage}%` : ''}
                      </span>
                      <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(barH / 100) * 80}px` }}
                          transition={{ delay: i * 0.06, duration: 0.5, ease: 'easeOut' }}
                          className="w-full rounded-lg"
                          style={{
                            background: `${color}${isToday ? 'ff' : '60'}`,
                            boxShadow: isToday ? `0 0 12px ${color}50` : 'none',
                          }}
                        />
                      </div>
                      <span className={cn(
                        'text-[10px] font-medium',
                        isToday ? 'text-white/70' : 'text-white/25'
                      )}>
                        {isToday ? 'Today' : format(parseISO(day.date), 'EEE')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Streak calendar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-2xl bg-white/3 border border-white/6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Streak Tracker</h2>
                  <p className="text-xs text-white/35">
                    {stats.streak.current > 0
                      ? `🔥 ${stats.streak.current}-day streak! Keep it up.`
                      : 'Complete all tasks to start a streak'}
                  </p>
                </div>
              </div>

              <div className="flex gap-1.5">
                {stats.dayStats.map((day, i) => {
                  const isToday = day.date === format(new Date(), 'yyyy-MM-dd');
                  const completed = day.percentage === 100;
                  const partial = day.percentage > 0 && day.percentage < 100;

                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.06, type: 'spring', stiffness: 400 }}
                        className={cn(
                          'w-full aspect-square rounded-lg flex items-center justify-center text-sm',
                          completed ? 'bg-orange-500/20 border border-orange-500/40' :
                          partial ? 'bg-yellow-500/10 border border-yellow-500/20' :
                          'bg-white/4 border border-white/6'
                        )}
                      >
                        {completed ? '🔥' : partial ? '✨' : ''}
                      </motion.div>
                      <span className={cn(
                        'text-[9px] font-medium',
                        isToday ? 'text-white/60' : 'text-white/20'
                      )}>
                        {isToday ? 'Today' : format(parseISO(day.date), 'EEE')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-400">{stats.streak.current}</p>
                  <p className="text-[10px] text-white/30">Current</p>
                </div>
                <div className="h-8 w-px bg-white/8" />
                <div className="text-center">
                  <p className="text-lg font-bold text-yellow-400">{stats.streak.longest}</p>
                  <p className="text-[10px] text-white/30">Best ever</p>
                </div>
                <div className="h-8 w-px bg-white/8" />
                <div className="text-center">
                  <p className="text-lg font-bold text-indigo-400">
                    {stats.dayStats.filter((d) => d.percentage === 100).length}
                  </p>
                  <p className="text-[10px] text-white/30">Perfect days</p>
                </div>
              </div>
            </motion.div>

            {/* Top tasks */}
            {stats.topTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-4 rounded-2xl bg-white/3 border border-white/6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-semibold">Most Completed (7 days)</h2>
                </div>

                <div className="space-y-2.5">
                  {stats.topTasks.map(({ task, completions }, i) => {
                    if (!task) return null;
                    const maxComp = stats.topTasks[0]?.completions ?? 1;
                    const pct = (completions / Math.max(maxComp, 1)) * 100;

                    return (
                      <div key={task.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{task.emoji}</span>
                            <span className="text-sm text-white/70 truncate">{task.title}</span>
                          </div>
                          <span className="text-xs text-white/35 flex-shrink-0 ml-2">{completions}/7</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/6 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: task.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Today's ring */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-4 rounded-2xl bg-white/3 border border-white/6"
            >
              <h2 className="text-sm font-semibold mb-4">Today&apos;s Progress</h2>
              <div className="flex items-center gap-5">
                {/* SVG ring */}
                <div className="relative flex-shrink-0">
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <motion.circle
                      cx="40" cy="40" r="32"
                      fill="none"
                      stroke="url(#ringGrad)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - stats.todayProgress.percentage / 100) }}
                      transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                      style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                    />
                    <defs>
                      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">{stats.todayProgress.percentage}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold">{stats.todayProgress.completed}
                      <span className="text-base text-white/30 font-normal">/{stats.todayProgress.total}</span>
                    </p>
                    <p className="text-xs text-white/35">tasks completed today</p>
                  </div>
                  {stats.todayProgress.percentage === 100 && (
                    <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Perfect day!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
