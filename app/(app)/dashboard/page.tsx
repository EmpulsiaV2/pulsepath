'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Plus, Zap, Flame, CheckCircle2, Sun, Sunset, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { SwipeableTaskCard } from '@/components/tasks/SwipeableTaskCard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { TaskSkeleton } from '@/components/ui/Skeletons';
import { Confetti } from '@/components/ui/Confetti';
import type { Task, CreateTaskInput } from '@/types';
import { cn } from '@/lib/utils';

const SECTION_ICONS = {
  morning: { icon: Sun, label: '🌅 Morning', color: '#f59e0b' },
  afternoon: { icon: Sunset, label: '☀️ Afternoon', color: '#f97316' },
  evening: { icon: Moon, label: '🌙 Evening', color: '#8b5cf6' },
};

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [defaultSection, setDefaultSection] = useState<TimeOfDay>('morning');
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hadAllCompleted, setHadAllCompleted] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTasks(data.tasks);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadStreak = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (!res.ok) return;
      const data = await res.json();
      setStreak(data.streak.current);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    loadTasks();
    loadStreak();
  }, [loadTasks, loadStreak]);

  // Check for all complete
  useEffect(() => {
    if (tasks.length === 0) return;
    const allDone = tasks.every((t) => t.isCompleted);
    if (allDone && !hadAllCompleted) {
      setShowConfetti(true);
      setHadAllCompleted(true);
      setTimeout(() => setShowConfetti(false), 100);
    }
    if (!allDone) setHadAllCompleted(false);
  }, [tasks, hadAllCompleted]);

  const handleComplete = async (id: string, completed: boolean) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, isCompleted: completed } : t));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) throw new Error();
      if (completed) toast.success('Task completed! ✓', { icon: '⚡' });
      loadStreak();
    } catch {
      // Revert
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, isCompleted: !completed } : t));
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Task removed');
    } catch {
      loadTasks();
      toast.error('Failed to delete task');
    }
  };

  const handleSave = async (data: CreateTaskInput) => {
    try {
      const url = editTask ? `/api/tasks/${editTask.id}` : '/api/tasks';
      const method = editTask ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success(editTask ? 'Task updated!' : 'Task added!');
      loadTasks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save task');
      throw err;
    }
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const groupedTasks = {
    morning: tasks.filter((t) => t.timeOfDay === 'morning'),
    afternoon: tasks.filter((t) => t.timeOfDay === 'afternoon'),
    evening: tasks.filter((t) => t.timeOfDay === 'evening'),
  };

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="h-full overflow-y-auto with-bottom-nav">
      <Confetti trigger={showConfetti} />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#09090c]/90 backdrop-blur-xl border-b border-white/4 safe-top">
        <div className="px-4 pt-4 pb-3 max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-white/35 font-medium">
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
              <h1 className="text-lg font-bold leading-tight">
                {greeting}, {firstName} 👋
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {streak > 0 && (
                <div className="flex items-center gap-1.5 bg-orange-500/15 border border-orange-500/20 px-3 py-1.5 rounded-xl">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs font-bold text-orange-400">{streak}</span>
                </div>
              )}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.4)]">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/35">
                {completedCount}/{totalCount} tasks complete
              </span>
              <span className="text-[11px] font-semibold text-white/50">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 progress-glow"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* All complete celebration */}
      <AnimatePresence>
        {totalCount > 0 && completedCount === totalCount && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border border-indigo-500/20 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">All done! 🎉</p>
              <p className="text-xs text-white/40">You crushed today&apos;s routine!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task sections */}
      <div className="px-4 pt-4 max-w-xl mx-auto space-y-6">
        {isLoading ? (
          <TaskSkeleton />
        ) : totalCount === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-base font-semibold text-white/50 mb-1">No tasks yet</h3>
            <p className="text-sm text-white/25 mb-6">Add your first task to start building your routine</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Add first task
            </button>
          </motion.div>
        ) : (
          (['morning', 'afternoon', 'evening'] as TimeOfDay[]).map((section) => {
            const sectionTasks = groupedTasks[section];
            if (sectionTasks.length === 0) return null;
            const info = SECTION_ICONS[section];

            return (
              <div key={section}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white/60">{info.label}</span>
                    <span className="text-xs text-white/25 bg-white/5 px-2 py-0.5 rounded-full">
                      {sectionTasks.filter((t) => t.isCompleted).length}/{sectionTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setDefaultSection(section);
                      setEditTask(null);
                      setIsModalOpen(true);
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/6 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <AnimatePresence mode="popLayout">
                  {sectionTasks.map((task, i) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <SwipeableTaskCard
                        task={task}
                        onComplete={handleComplete}
                        onDelete={handleDelete}
                        onEdit={(t) => {
                          setEditTask(t);
                          setIsModalOpen(true);
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            );
          })
        )}

        {/* Bottom add button */}
        {!isLoading && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => { setEditTask(null); setIsModalOpen(true); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-white/12 text-white/30 hover:text-white/60 hover:border-white/20 hover:bg-white/3 transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add task
          </motion.button>
        )}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 20 }}
        onClick={() => { setEditTask(null); setIsModalOpen(true); }}
        className={cn(
          'fixed right-4 z-30 w-14 h-14 rounded-2xl',
          'bg-gradient-to-br from-indigo-500 to-violet-600',
          'flex items-center justify-center',
          'shadow-[0_4px_24px_rgba(99,102,241,0.5)]',
          'hover:opacity-90 active:scale-90 transition-all',
        )}
        style={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
      </motion.button>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditTask(null); }}
        onSave={handleSave}
        editTask={editTask}
        defaultTimeOfDay={defaultSection}
      />
    </div>
  );
}
