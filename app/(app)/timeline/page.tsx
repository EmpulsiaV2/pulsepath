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
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [edit, setEdit]       = useState<Task | null>(null);
  const [now, setNow]         = useState(new Date());

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/tasks');
      if (!r.ok) throw new Error();
      const sorted = [...(await r.json()).tasks].sort((a: Task, b: Task) => {
        if (!a.scheduledTime && !b.scheduledTime) return 0;
        if (!a.scheduledTime) return 1; if (!b.scheduledTime) return -1;
        return a.scheduledTime.localeCompare(b.scheduledTime);
      });
      setTasks(sorted);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (id: string, val: boolean) => {
    setTasks(p => p.map(t => t.id === id ? { ...t, isCompleted: val } : t));
    try { await fetch(`/api/tasks/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ completed:val }) }); }
    catch { load(); }
  };

  const save = async (data: CreateTaskInput) => {
    const r = await fetch(edit ? `/api/tasks/${edit.id}` : '/api/tasks', {
      method: edit ? 'PATCH' : 'POST',
      headers:{'Content-Type':'application/json'}, body:JSON.stringify(data),
    });
    if (!r.ok) throw new Error();
    toast.success(edit ? 'Updated' : 'Added'); load();
  };

  const nowStr = format(now, 'HH:mm');

  const status = (t: Task) => {
    if (t.isCompleted) return 'done';
    if (!t.scheduledTime) return 'pending';
    const diff = t.scheduledTime.localeCompare(format(new Date(now.getTime() + 15*60000), 'HH:mm'));
    if (t.scheduledTime < nowStr) return 'late';
    if (diff <= 0) return 'soon';
    return 'upcoming';
  };

  return (
    <div className="page">
      <div className="page-header" style={{ background:'rgba(242,237,228,0.92)', backdropFilter:'blur(16px)', borderBottom:'0.5px solid var(--border-2)' }}>
        <div style={{ padding:'14px 20px 14px', maxWidth:560, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p className="label" style={{ marginBottom:3 }}>Timeline</p>
            <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', color:'var(--tx-1)' }}>
              {format(new Date(), 'EEEE, MMM d')}
            </h1>
          </div>
          <div style={{
            display:'flex', alignItems:'center', gap:6, padding:'7px 12px',
            background:'rgba(255,252,247,0.85)', border:'0.5px solid var(--border-2)',
            borderRadius:11, boxShadow:'var(--sh-sm)',
          }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--ac)', boxShadow:'0 0 6px var(--ac)' }} />
            <span style={{ fontSize:13, fontFamily:'JetBrains Mono,monospace', fontWeight:500, color:'var(--tx-1)' }}>
              {format(now, 'h:mm a')}
            </span>
          </div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ maxWidth:560, margin:'0 auto', padding:'20px 16px' }}>
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[60,80,50,70,90].map((w,i) => (
                <div key={i} style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <div className="skel" style={{ width:13, height:13, borderRadius:'50%', flexShrink:0 }} />
                  <div className="skel" style={{ flex:1, height:52, borderRadius:14 }} />
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--tx-3)', fontSize:14 }}>No tasks scheduled yet.</div>
          ) : (
            <div style={{ position:'relative' }}>
              <div style={{
                position:'absolute', left:6, top:8, bottom:8, width:1,
                background:'linear-gradient(to bottom, var(--ac-border), rgba(160,120,80,0.12), transparent)',
              }} />
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {tasks.map((task, i) => {
                  const s = status(task);
                  const isNow  = s === 'soon';
                  const isDone = s === 'done';
                  const isLate = s === 'late';
                  const dotC   = isDone ? 'var(--green)' : isNow ? 'var(--ac)' : isLate ? 'var(--red)' : 'var(--border-3)';
                  const timeStr = task.scheduledTime
                    ? task.scheduledEndTime
                      ? `${formatTime(task.scheduledTime)} – ${formatTime(task.scheduledEndTime)}`
                      : formatTime(task.scheduledTime)
                    : null;

                  return (
                    <motion.div key={task.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.03 }}
                      style={{ display:'flex', alignItems:'center', gap:12 }}>
                      {/* Dot */}
                      <div style={{
                        width:13, height:13, borderRadius:'50%', flexShrink:0,
                        background: isDone ? 'var(--green-dim)' : isNow ? 'var(--ac-dim)' : 'rgba(242,237,228,0.9)',
                        border:`1.5px solid ${dotC}`,
                        display:'flex', alignItems:'center', justifyContent:'center', zIndex:1,
                        boxShadow: isNow ? `0 0 8px ${dotC}60` : 'none',
                      }}>
                        {(isNow || isDone) && <div style={{ width:5, height:5, borderRadius:'50%', background:dotC }} />}
                      </div>

                      {/* Card */}
                      <button onClick={() => toggle(task.id, !task.isCompleted)}
                        className="glass-card"
                        style={{
                          flex:1, display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
                          cursor:'pointer', textAlign:'left', fontFamily:'inherit',
                          opacity: isDone ? 0.45 : 1,
                          background: isNow ? 'rgba(212,97,42,0.07)' : undefined,
                          borderColor: isNow ? 'var(--ac-border)' : undefined,
                          boxShadow: isNow ? '0 4px 16px rgba(212,97,42,0.12), inset 0 1px 0 rgba(255,255,255,0.9)' : undefined,
                        }}>
                        <span style={{ fontSize:18, flexShrink:0 }}>{task.emoji}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:13, fontWeight:500, color: isDone ? 'var(--tx-3)' : 'var(--tx-1)', textDecoration: isDone ? 'line-through' : 'none', textDecorationColor:'var(--tx-4)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', letterSpacing:'-0.01em' }}>
                            {task.title}
                          </p>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                          {isNow && <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.06em', background:'var(--ac-dim)', color:'var(--ac-text)', border:'0.5px solid var(--ac-border)', borderRadius:5, padding:'2px 6px' }}>NOW</span>}
                          {isLate && !isDone && <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.06em', background:'var(--red-dim)', color:'var(--red)', border:'0.5px solid rgba(192,48,32,0.2)', borderRadius:5, padding:'2px 6px' }}>LATE</span>}
                          {timeStr && <span style={{ fontSize:11, fontFamily:'JetBrains Mono,monospace', color: isNow ? 'var(--ac-text)' : isLate&&!isDone ? 'var(--red)' : 'var(--tx-3)' }}>{timeStr}</span>}
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && (
            <button onClick={() => { setEdit(null); setModal(true); }}
              style={{ width:'100%', marginTop:16, padding:'12px', background:'transparent', border:'1px dashed var(--border-2)', borderRadius:14, color:'var(--tx-3)', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:13, fontWeight:500, fontFamily:'inherit', cursor:'pointer' }}>
              <Plus size={14} /> Add task
            </button>
          )}

          <div className="with-nav" />
        </div>
      </div>

      <TaskModal isOpen={modal} onClose={() => { setModal(false); setEdit(null); }} onSave={save} editTask={edit} />
    </div>
  );
}
