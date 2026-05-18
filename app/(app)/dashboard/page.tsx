'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Plus, Flame, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { SwipeableTaskCard } from '@/components/tasks/SwipeableTaskCard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { Confetti } from '@/components/ui/Confetti';
import type { Task, CreateTaskInput } from '@/types';

const SECTIONS = [
  { key: 'morning',   label: 'Morning',   emoji: '🌅' },
  { key: 'afternoon', label: 'Afternoon', emoji: '☀️' },
  { key: 'evening',   label: 'Evening',   emoji: '🌙' },
] as const;

function TaskSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[80, 65, 90, 55, 75].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <div className="skel" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skel" style={{ height: 13, width: `${w}%`, borderRadius: 6 }} />
            <div className="skel" style={{ height: 10, width: 48, borderRadius: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tasks, setTasks]           = useState<Task[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTask, setEditTask]     = useState<Task | null>(null);
  const [defSection, setDefSection] = useState<'morning'|'afternoon'|'evening'>('morning');
  const [streak, setStreak]         = useState(0);
  const [confetti, setConfetti]     = useState(false);
  const prevAllDone                 = useRef(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/tasks');
      if (!r.ok) throw new Error();
      const d = await r.json();
      setTasks(d.tasks);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  const loadStreak = useCallback(async () => {
    try {
      const r = await fetch('/api/stats');
      if (!r.ok) return;
      const d = await r.json();
      setStreak(d.streak.current);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { load(); loadStreak(); }, [load, loadStreak]);

  // Confetti when all tasks first become done
  useEffect(() => {
    if (!tasks.length) return;
    const allDone = tasks.every(t => t.isCompleted);
    if (allDone && !prevAllDone.current) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);
    }
    prevAllDone.current = allDone;
  }, [tasks]);

  const handleComplete = async (id: string, completed: boolean) => {
    setTasks(p => p.map(t => t.id === id ? { ...t, isCompleted: completed } : t));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      loadStreak();
    } catch { load(); }
  };

  const handleDelete = async (id: string) => {
    setTasks(p => p.filter(t => t.id !== id));
    try { await fetch(`/api/tasks/${id}`, { method: 'DELETE' }); }
    catch { load(); }
  };

  const handleSave = async (data: CreateTaskInput) => {
    const url    = editTask ? `/api/tasks/${editTask.id}` : '/api/tasks';
    const method = editTask ? 'PATCH' : 'POST';
    const r = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error); }
    toast.success(editTask ? 'Updated' : 'Task added');
    load();
  };

  const done  = tasks.filter(t => t.isCompleted).length;
  const total = tasks.length;
  const pct   = total > 0 ? (done / total) * 100 : 0;
  const allDone = total > 0 && done === total;

  const grouped = {
    morning:   tasks.filter(t => t.timeOfDay === 'morning'),
    afternoon: tasks.filter(t => t.timeOfDay === 'afternoon'),
    evening:   tasks.filter(t => t.timeOfDay === 'evening'),
  };

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page">
      <Confetti trigger={confetti} />

      {/* Header */}
      <div className="page-header" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ padding: '16px 20px 14px', maxWidth: 560, margin: '0 auto' }}>

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--tx-3)', marginBottom: 3 }}>
                {format(new Date(), 'EEEE, MMM d')}
              </p>
              <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--tx-1)', lineHeight: 1 }}>
                {greet}, {firstName}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {streak > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'var(--orange-dim)', border: '1px solid rgba(251,146,60,0.2)',
                  borderRadius: 8, padding: '5px 9px',
                }}>
                  <Flame size={13} color="var(--orange)" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange)', fontFamily: 'Geist Mono, monospace' }}>
                    {streak}
                  </span>
                </div>
              )}
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={15} color="var(--accent-text)" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="progress-track" style={{ flex: 1 }}>
              <motion.div
                className="progress-fill"
                style={{ width: `${pct}%` }}
                layout
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
            <span style={{ fontSize: 11, color: 'var(--tx-3)', fontFamily: 'Geist Mono, monospace', flexShrink: 0 }}>
              {done}/{total}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="page-body">
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* All done banner */}
          <AnimatePresence>
            {allDone && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{
                  padding: '14px 16px',
                  background: 'var(--green-dim)',
                  border: '1px solid rgba(52,211,153,0.18)',
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <span style={{ fontSize: 22 }}>🎉</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)', letterSpacing: '-0.01em' }}>
                    All done for today
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--tx-3)', marginTop: 1 }}>
                    Incredible — you completed every task.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          {loading ? (
            <TaskSkeleton />
          ) : total === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '60px 20px' }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: 'var(--bg-3)', border: '1px solid var(--border-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, margin: '0 auto 16px',
              }}>
                ⚡
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--tx-2)', marginBottom: 6 }}>
                No tasks yet
              </p>
              <p style={{ fontSize: 13, color: 'var(--tx-3)', marginBottom: 24, lineHeight: 1.5 }}>
                Build your routine by adding your first task below.
              </p>
              <button
                onClick={() => { setEditTask(null); setModalOpen(true); }}
                className="btn btn-accent"
                style={{ margin: '0 auto' }}
              >
                <Plus size={14} strokeWidth={2.5} /> Add first task
              </button>
            </motion.div>
          ) : (
            SECTIONS.map(sec => {
              const list = grouped[sec.key];
              if (!list.length) return null;
              const secDone = list.filter(t => t.isCompleted).length;

              return (
                <div key={sec.key}>
                  {/* Section header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 14 }}>{sec.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--tx-3)' }}>
                        {sec.label}
                      </span>
                      <span style={{
                        fontSize: 10, fontFamily: 'Geist Mono, monospace',
                        color: secDone === list.length ? 'var(--green)' : 'var(--tx-4)',
                        background: secDone === list.length ? 'var(--green-dim)' : 'var(--bg-3)',
                        border: `1px solid ${secDone === list.length ? 'rgba(52,211,153,0.2)' : 'var(--border)'}`,
                        borderRadius: 6, padding: '2px 6px', fontWeight: 600,
                      }}>
                        {secDone}/{list.length}
                      </span>
                    </div>
                    <button
                      onClick={() => { setDefSection(sec.key); setEditTask(null); setModalOpen(true); }}
                      style={{
                        width: 26, height: 26, borderRadius: 7, border: '1px solid var(--border-2)',
                        background: 'transparent', color: 'var(--tx-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <Plus size={13} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Tasks */}
                  <AnimatePresence mode="popLayout">
                    {list.map((task, i) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.035, duration: 0.2 }}
                      >
                        <SwipeableTaskCard
                          task={task}
                          onComplete={handleComplete}
                          onDelete={handleDelete}
                          onEdit={t => { setEditTask(t); setModalOpen(true); }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              );
            })
          )}

          {/* Bottom add row */}
          {!loading && total > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => { setEditTask(null); setModalOpen(true); }}
              style={{
                width: '100%', padding: '12px',
                background: 'transparent', border: '1px dashed var(--border-2)',
                borderRadius: 12, color: 'var(--tx-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-3)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--tx-2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--tx-3)'; }}
            >
              <Plus size={14} strokeWidth={2} /> Add task
            </motion.button>
          )}

          <div className="with-nav" />
        </div>
      </div>

      {/* FAB */}
      <AnimatePresence>
        {!loading && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 500, damping: 28 }}
            onClick={() => { setEditTask(null); setModalOpen(true); }}
            style={{
              position: 'fixed',
              right: 20,
              bottom: `calc(var(--nav-h) + env(safe-area-inset-bottom, 0px) + 16px)`,
              zIndex: 50,
              width: 52, height: 52, borderRadius: 15,
              background: 'var(--accent)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(123,104,238,0.45)',
              color: 'white',
            }}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <Plus size={22} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        onSave={handleSave}
        editTask={editTask}
        defaultTimeOfDay={defSection}
      />
    </div>
  );
}
