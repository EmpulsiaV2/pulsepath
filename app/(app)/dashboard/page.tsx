'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Plus, Flame } from 'lucide-react';
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

function Skeleton() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {[72, 58, 80, 52, 66].map((w, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'rgba(255,252,247,0.75)', border:'0.5px solid rgba(160,120,80,0.10)', borderRadius:16, boxShadow:'var(--sh-sm)' }}>
          <div className="skel" style={{ width:40, height:40, borderRadius:11, flexShrink:0 }} />
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7 }}>
            <div className="skel" style={{ height:13, width:`${w}%` }} />
            <div className="skel" style={{ height:10, width:52 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session }         = useSession();
  const [tasks, setTasks]         = useState<Task[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [editTask, setEdit]       = useState<Task | null>(null);
  const [section, setSection]     = useState<'morning'|'afternoon'|'evening'>('morning');
  const [streak, setStreak]       = useState(0);
  const [confetti, setConfetti]   = useState(false);
  const prevDone                  = useRef(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/tasks');
      if (!r.ok) throw new Error();
      setTasks((await r.json()).tasks);
    } catch { toast.error('Could not load tasks'); }
    finally { setLoading(false); }
  }, []);

  const loadStreak = useCallback(async () => {
    try { const r = await fetch('/api/stats'); if (r.ok) setStreak((await r.json()).streak.current); }
    catch { /* silent */ }
  }, []);

  useEffect(() => { load(); loadStreak(); }, [load, loadStreak]);

  useEffect(() => {
    if (!tasks.length) return;
    const all = tasks.every(t => t.isCompleted);
    if (all && !prevDone.current) { setConfetti(true); setTimeout(() => setConfetti(false), 80); }
    prevDone.current = all;
  }, [tasks]);

  const complete = async (id: string, val: boolean) => {
    setTasks(p => p.map(t => t.id === id ? { ...t, isCompleted: val } : t));
    try {
      await fetch(`/api/tasks/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ completed: val }) });
      loadStreak();
    } catch { load(); }
  };

  const del = async (id: string) => {
    setTasks(p => p.filter(t => t.id !== id));
    try { await fetch(`/api/tasks/${id}`, { method:'DELETE' }); }
    catch { load(); }
  };

  const save = async (data: CreateTaskInput) => {
    const r = await fetch(editTask ? `/api/tasks/${editTask.id}` : '/api/tasks', {
      method: editTask ? 'PATCH' : 'POST',
      headers: {'Content-Type':'application/json'}, body: JSON.stringify(data),
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
      <div className="page-header" style={{ background:'rgba(242,237,228,0.92)', backdropFilter:'blur(16px)', borderBottom:'0.5px solid var(--border-2)' }}>
        <div style={{ padding:'14px 20px 12px', maxWidth:560, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
            <div>
              <p style={{ fontSize:11, fontWeight:600, letterSpacing:'0.07em', textTransform:'uppercase', color:'var(--tx-3)', marginBottom:3 }}>
                {format(new Date(), 'EEEE, MMMM d')}
              </p>
              <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', color:'var(--tx-1)', lineHeight:1.1 }}>
                {greet}, {firstName}
              </h1>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:2 }}>
              {streak > 0 && (
                <div style={{
                  display:'flex', alignItems:'center', gap:5, padding:'5px 9px',
                  background:'rgba(200,124,16,0.10)', border:'0.5px solid rgba(200,124,16,0.22)',
                  borderRadius:9, boxShadow:'inset 0 1px 0 rgba(255,255,255,0.7)',
                }}>
                  <Flame size={13} color="var(--amber)" />
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--amber)', fontFamily:'JetBrains Mono,monospace' }}>{streak}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div className="progress-track" style={{ flex:1 }}>
              <motion.div className="progress-fill" style={{ width:`${pct}%` }}
                layout transition={{ duration:0.5, ease:[0.4,0,0.2,1] }} />
            </div>
            <span style={{ fontSize:11, color:'var(--tx-3)', fontFamily:'JetBrains Mono,monospace', flexShrink:0 }}>
              {done}/{total}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="page-body">
        <div style={{ maxWidth:560, margin:'0 auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:24 }}>

          {/* All done banner */}
          <AnimatePresence>
            {allDone && (
              <motion.div
                initial={{ opacity:0, y:-8, scale:0.97 }}
                animate={{ opacity:1, y:0, scale:1 }}
                exit={{ opacity:0, scale:0.97 }}
                className="glass-card"
                style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}
              >
                <span style={{ fontSize:24 }}>🎉</span>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:'var(--green)', letterSpacing:'-0.01em' }}>All done for today!</p>
                  <p style={{ fontSize:12, color:'var(--tx-3)', marginTop:1 }}>You completed every task. Keep the streak going.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? <Skeleton /> : total === 0 ? (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              style={{ textAlign:'center', padding:'64px 24px' }}>
              <div style={{
                width:72, height:72, borderRadius:22,
                background:'rgba(212,97,42,0.08)', border:'0.5px solid var(--ac-border)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:32, margin:'0 auto 18px',
                boxShadow:'var(--sh-md), inset 0 1px 0 rgba(255,255,255,0.8)',
              }}>⚡</div>
              <p style={{ fontSize:17, fontWeight:600, letterSpacing:'-0.02em', color:'var(--tx-1)', marginBottom:6 }}>No tasks yet</p>
              <p style={{ fontSize:13, color:'var(--tx-3)', marginBottom:24, lineHeight:1.55 }}>
                Tap below to build your first routine.
              </p>
              <button onClick={() => { setEdit(null); setModal(true); }} className="btn btn-accent" style={{ margin:'0 auto' }}>
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
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, paddingInline:2 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:15 }}>{sec.emoji}</span>
                      <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--tx-3)' }}>{sec.label}</span>
                      <span style={{
                        fontSize:10, fontFamily:'JetBrains Mono,monospace', fontWeight:600,
                        padding:'2px 7px', borderRadius:6,
                        background: secDone===list.length ? 'var(--green-dim)' : 'rgba(160,120,80,0.08)',
                        color: secDone===list.length ? 'var(--green)' : 'var(--tx-4)',
                        border:`0.5px solid ${secDone===list.length ? 'rgba(77,124,42,0.22)' : 'var(--border)'}`,
                      }}>
                        {secDone}/{list.length}
                      </span>
                    </div>
                    <button onClick={() => { setSection(sec.key); setEdit(null); setModal(true); }}
                      style={{
                        width:26, height:26, borderRadius:8,
                        border:'0.5px solid var(--border-2)',
                        background:'rgba(255,252,247,0.85)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        cursor:'pointer', color:'var(--tx-3)', boxShadow:'var(--sh-sm)',
                      }}>
                      <Plus size={13} strokeWidth={2.5} />
                    </button>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {list.map((task, i) => (
                      <motion.div key={task.id}
                        initial={{ opacity:0, y:8 }}
                        animate={{ opacity:1, y:0 }}
                        exit={{ opacity:0, x:-16, transition:{ duration:0.18 } }}
                        transition={{ delay: i * 0.03, duration:0.2 }}
                      >
                        <SwipeableTaskCard task={task}
                          onComplete={complete} onDelete={del}
                          onEdit={t => { setEdit(t); setModal(true); }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              );
            })
          )}

          {!loading && total > 0 && (
            <button onClick={() => { setEdit(null); setModal(true); }}
              style={{
                width:'100%', padding:'12px', background:'transparent',
                border:'1px dashed var(--border-2)', borderRadius:14,
                color:'var(--tx-3)', display:'flex', alignItems:'center', justifyContent:'center',
                gap:6, fontSize:13, fontWeight:500, fontFamily:'inherit', cursor:'pointer',
                transition:'all 0.15s',
              }}>
              <Plus size={14} strokeWidth={2} /> Add task
            </button>
          )}

          <div className="with-nav" />
        </div>
      </div>

      {/* FAB */}
      <AnimatePresence>
        {!loading && (
          <motion.button
            initial={{ scale:0, opacity:0 }}
            animate={{ scale:1, opacity:1 }}
            exit={{ scale:0 }}
            transition={{ delay:0.2, type:'spring', stiffness:500, damping:28 }}
            onClick={() => { setEdit(null); setModal(true); }}
            className="btn btn-accent"
            style={{
              position:'fixed', right:20,
              bottom:'calc(var(--nav-h) + env(safe-area-inset-bottom,0px) + 16px)',
              zIndex:50, width:52, height:52, borderRadius:16, padding:0,
            }}
            whileTap={{ scale:0.9 }}
          >
            <Plus size={22} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      <TaskModal isOpen={modal} onClose={() => { setModal(false); setEdit(null); }}
        onSave={save} editTask={editTask} defaultTimeOfDay={section} />
    </div>
  );
}
