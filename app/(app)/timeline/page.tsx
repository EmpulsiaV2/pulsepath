'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { TaskModal } from '@/components/tasks/TaskModal';
import { formatTime } from '@/lib/utils';
import type { Task, CreateTaskInput } from '@/types';

export default function TimelinePage() {
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModal]   = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [now, setNow]           = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/tasks');
      if (!r.ok) throw new Error();
      const d = await r.json();
      const sorted = [...d.tasks].sort((a: Task, b: Task) => {
        if (!a.scheduledTime && !b.scheduledTime) return 0;
        if (!a.scheduledTime) return 1;
        if (!b.scheduledTime) return -1;
        return a.scheduledTime.localeCompare(b.scheduledTime);
      });
      setTasks(sorted);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: CreateTaskInput) => {
    const url = editTask ? `/api/tasks/${editTask.id}` : '/api/tasks';
    const r = await fetch(url, {
      method: editTask ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error();
    toast.success(editTask ? 'Updated' : 'Added');
    load();
  };

  const handleToggle = async (id: string, completed: boolean) => {
    setTasks(p => p.map(t => t.id === id ? { ...t, isCompleted: completed } : t));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
    } catch { load(); }
  };

  const nowStr = format(now, 'HH:mm');

  const getStatus = (task: Task) => {
    if (task.isCompleted) return 'done';
    if (!task.scheduledTime) return 'pending';
    if (task.scheduledTime < nowStr) return 'late';
    const diff = task.scheduledTime.localeCompare(
      format(new Date(now.getTime() + 15 * 60_000), 'HH:mm')
    );
    if (diff <= 0) return 'soon';
    return 'upcoming';
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ padding: '16px 20px 14px', maxWidth: 560, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--tx-3)', marginBottom: 3 }}>
              Timeline
            </p>
            <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em' }}>
              {format(new Date(), 'EEEE, MMM d')}
            </h1>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--bg-3)', border: '1px solid var(--border-2)',
            borderRadius: 9, padding: '6px 10px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, fontFamily: 'Geist Mono, monospace', fontWeight: 500, color: 'var(--tx-1)' }}>
              {format(now, 'h:mm a')}
            </span>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[60, 80, 45, 70, 90].map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div className="skel" style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0 }} />
                  <div className="skel" style={{ flex: 1, height: 52, borderRadius: 12 }} />
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--tx-3)', fontSize: 14 }}>
              No tasks scheduled. Add one!
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Vertical line */}
              <div style={{
                position: 'absolute', left: 6, top: 8, bottom: 8,
                width: 1,
                background: 'linear-gradient(to bottom, var(--accent-border), var(--border), transparent)',
              }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {tasks.map((task, i) => {
                  const status = getStatus(task);
                  const isNow  = status === 'soon';
                  const isDone = status === 'done';
                  const isLate = status === 'late';

                  const dotColor = isDone ? 'var(--green)'
                    : isNow  ? 'var(--accent)'
                    : isLate ? 'var(--red)'
                    : 'var(--border-3)';

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      {/* Dot */}
                      <div style={{
                        width: 13, height: 13, borderRadius: '50%', flexShrink: 0,
                        background: isDone ? 'var(--green-dim)' : isNow ? 'var(--accent-dim)' : 'var(--bg-3)',
                        border: `1.5px solid ${dotColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', zIndex: 1,
                        boxShadow: isNow ? `0 0 8px var(--accent)` : 'none',
                      }}>
                        {isNow && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />}
                        {isDone && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />}
                      </div>

                      {/* Card */}
                      <button
                        onClick={() => handleToggle(task.id, !task.isCompleted)}
                        style={{
                          flex: 1,
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '11px 14px',
                          background: isDone ? 'transparent' : isNow ? 'var(--accent-dim)' : 'var(--bg-2)',
                          border: `1px solid ${isDone ? 'var(--border)' : isNow ? 'var(--accent-border)' : 'var(--border)'}`,
                          borderRadius: 11, cursor: 'pointer', textAlign: 'left',
                          transition: 'all 0.15s', fontFamily: 'inherit',
                          opacity: isDone ? 0.5 : 1,
                        }}
                      >
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{task.emoji}</span>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em',
                            color: isDone ? 'var(--tx-3)' : 'var(--tx-1)',
                            textDecoration: isDone ? 'line-through' : 'none',
                            textDecorationColor: 'var(--tx-4)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {task.title}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          {isNow && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                              background: 'var(--accent-dim)', color: 'var(--accent-text)',
                              border: '1px solid var(--accent-border)',
                              borderRadius: 5, padding: '2px 5px',
                            }}>NOW</span>
                          )}
                          {isLate && !isDone && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                              background: 'var(--red-dim)', color: 'var(--red)',
                              border: '1px solid rgba(248,113,113,0.2)',
                              borderRadius: 5, padding: '2px 5px',
                            }}>LATE</span>
                          )}
                          {task.scheduledTime && (
                            <span style={{
                              fontSize: 11, fontFamily: 'Geist Mono, monospace',
                              color: isNow ? 'var(--accent-text)' : isLate && !isDone ? 'var(--red)' : 'var(--tx-3)',
                            }}>
                              {formatTime(task.scheduledTime)}
                            </span>
                          )}
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => { setEditTask(null); setModal(true); }}
              style={{
                width: '100%', marginTop: 16, padding: '12px',
                background: 'transparent', border: '1px dashed var(--border-2)',
                borderRadius: 12, color: 'var(--tx-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Add task
            </motion.button>
          )}

          <div className="with-nav" />
        </div>
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModal(false); setEditTask(null); }}
        onSave={handleSave}
        editTask={editTask}
      />
    </div>
  );
}
