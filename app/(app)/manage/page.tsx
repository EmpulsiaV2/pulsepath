'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { TaskModal } from '@/components/tasks/TaskModal';
import { formatTime } from '@/lib/utils';
import type { Task, CreateTaskInput } from '@/types';

const SECTIONS = [
  { key: 'morning'   as const, label: 'Morning',   emoji: '🌅' },
  { key: 'afternoon' as const, label: 'Afternoon', emoji: '☀️' },
  { key: 'evening'   as const, label: 'Evening',   emoji: '🌙' },
];

const DAY_SHORT: Record<string, string> = {
  mon:'Mo', tue:'Tu', wed:'We', thu:'Th', fri:'Fr', sat:'Sa', sun:'Su',
};
const ALL_DAYS = ['mon','tue','wed','thu','fri','sat','sun'];

function DayBadges({ days, isRecurring }: { days: string[]; isRecurring: boolean }) {
  if (!isRecurring) return (
    <span style={{ fontSize:10, color:'var(--tx-4)', fontWeight:500 }}>One-time</span>
  );
  const sorted = ALL_DAYS.filter(d => days.includes(d));
  if (sorted.length === 7) return (
    <span style={{ fontSize:10, color:'var(--ac-text)', fontWeight:600,
      background:'var(--ac-dim)', border:'0.5px solid var(--ac-border)',
      borderRadius:5, padding:'2px 6px' }}>Every day</span>
  );
  if (sorted.length === 0) return (
    <span style={{ fontSize:10, color:'var(--red)', fontWeight:500 }}>No days set</span>
  );
  return (
    <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
      {ALL_DAYS.map(d => (
        <span key={d} style={{
          fontSize:10, fontWeight:600, padding:'2px 5px', borderRadius:5,
          background: days.includes(d) ? 'var(--ac-dim)' : 'rgba(160,120,80,0.07)',
          color: days.includes(d) ? 'var(--ac-text)' : 'var(--tx-4)',
          border: `0.5px solid ${days.includes(d) ? 'var(--ac-border)' : 'transparent'}`,
        }}>{DAY_SHORT[d]}</span>
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {[75, 55, 85, 60, 70, 50, 80].map((w, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px',
          background:'rgba(255,252,247,0.97)', border:'0.5px solid rgba(160,120,80,0.10)',
          borderRadius:14, boxShadow:'0 1px 3px rgba(100,60,20,0.06)' }}>
          <div className="skel" style={{ width:38, height:38, borderRadius:10, flexShrink:0 }} />
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7 }}>
            <div className="skel" style={{ height:12, width:`${w}%` }} />
            <div className="skel" style={{ height:10, width:90 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ManagePage() {
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState('');
  const [modal, setModal]       = useState(false);
  const [editTask, setEdit]     = useState<Task | null>(null);
  const [defSection, setDefSec] = useState<'morning'|'afternoon'|'evening'>('morning');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/tasks/all');
      if (!r.ok) throw new Error();
      setTasks((await r.json()).tasks);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const del = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    setTasks(p => p.filter(t => t.id !== id));
    try { await fetch(`/api/tasks/${id}`, { method:'DELETE' }); toast.success('Deleted'); }
    catch { load(); toast.error('Failed'); }
  };

  const move = async (task: Task, dir: -1 | 1) => {
    const section = tasks.filter(t => t.timeOfDay === task.timeOfDay);
    const idx  = section.findIndex(t => t.id === task.id);
    const swap = section[idx + dir];
    if (!swap) return;

    // Optimistic swap
    const newOrder = tasks.map(t => {
      if (t.id === task.id) return { ...t, order: swap.order };
      if (t.id === swap.id) return { ...t, order: task.order };
      return t;
    });
    setTasks(newOrder);

    try {
      await fetch('/api/tasks/reorder', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ tasks: [
          { id: task.id, order: swap.order },
          { id: swap.id, order: task.order },
        ]}),
      });
    } catch { load(); }
  };

  const save = async (data: CreateTaskInput) => {
    const r = await fetch(editTask ? `/api/tasks/${editTask.id}` : '/api/tasks', {
      method: editTask ? 'PATCH' : 'POST',
      headers:{'Content-Type':'application/json'}, body:JSON.stringify(data),
    });
    if (!r.ok) throw new Error((await r.json()).error);
    toast.success(editTask ? 'Updated' : 'Task added');
    load();
  };

  const toggleCollapse = (key: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const q = query.toLowerCase().trim();
  const filtered = q
    ? tasks.filter(t => t.title.toLowerCase().includes(q))
    : tasks;

  const grouped = {
    morning:   filtered.filter(t => t.timeOfDay === 'morning'),
    afternoon: filtered.filter(t => t.timeOfDay === 'afternoon'),
    evening:   filtered.filter(t => t.timeOfDay === 'evening'),
  };

  const total = tasks.length;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header" style={{
        background:'rgba(242,237,228,0.92)', backdropFilter:'blur(16px)',
        borderBottom:'0.5px solid var(--border-2)',
      }}>
        <div style={{ padding:'14px 20px 14px', maxWidth:560, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
            <div>
              <p className="label" style={{ marginBottom:3 }}>All tasks</p>
              <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', color:'var(--tx-1)', lineHeight:1.1 }}>
                Manage
              </h1>
            </div>
            <div style={{
              display:'flex', alignItems:'center', gap:5,
              background:'rgba(255,252,247,0.9)', border:'0.5px solid var(--border-2)',
              borderRadius:9, padding:'5px 10px', boxShadow:'0 1px 3px rgba(100,60,20,0.06)',
            }}>
              <span style={{ fontSize:13, fontFamily:'JetBrains Mono,monospace', fontWeight:600, color:'var(--tx-2)' }}>
                {total}
              </span>
              <span style={{ fontSize:11, color:'var(--tx-3)', fontWeight:500 }}>
                {total === 1 ? 'task' : 'tasks'}
              </span>
            </div>
          </div>

          {/* Search */}
          <div style={{ position:'relative' }}>
            <Search size={14} color="var(--tx-4)"
              style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', flexShrink:0 }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="field"
              style={{ paddingLeft:34, fontSize:13 }}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="page-body">
        <div style={{ maxWidth:560, margin:'0 auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:20 }}>

          {loading ? <Skeleton /> : total === 0 ? (
            <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              style={{ textAlign:'center', padding:'64px 24px' }}>
              <div style={{
                width:72, height:72, borderRadius:22, background:'var(--ac-dim)',
                border:'0.5px solid var(--ac-border)', display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:32, margin:'0 auto 18px',
              }}>⚡</div>
              <p style={{ fontSize:17, fontWeight:600, color:'var(--tx-1)', letterSpacing:'-0.02em', marginBottom:6 }}>
                No tasks yet
              </p>
              <p style={{ fontSize:13, color:'var(--tx-3)', marginBottom:24, lineHeight:1.55 }}>
                Add your first task to get started.
              </p>
              <button onClick={() => { setEdit(null); setModal(true); }} className="btn btn-accent" style={{ margin:'0 auto' }}>
                <Plus size={14} strokeWidth={2.5} /> Add task
              </button>
            </motion.div>
          ) : (
            <>
              {/* No results */}
              {q && filtered.length === 0 && (
                <div style={{ textAlign:'center', padding:'40px 0', color:'var(--tx-3)', fontSize:14 }}>
                  No tasks match &ldquo;{query}&rdquo;
                </div>
              )}

              {SECTIONS.map(sec => {
                const list = grouped[sec.key];
                if (!list.length && q) return null; // hide empty sections when searching
                const isCollapsed = collapsed.has(sec.key);

                return (
                  <div key={sec.key}>
                    {/* Section header */}
                    <button
                      onClick={() => toggleCollapse(sec.key)}
                      style={{
                        width:'100%', display:'flex', alignItems:'center',
                        justifyContent:'space-between', marginBottom: isCollapsed ? 0 : 10,
                        padding:'2px 2px', background:'transparent', border:'none',
                        cursor:'pointer', fontFamily:'inherit',
                      }}
                    >
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ fontSize:15 }}>{sec.emoji}</span>
                        <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.06em',
                          textTransform:'uppercase', color:'var(--tx-3)' }}>{sec.label}</span>
                        <span style={{
                          fontSize:10, fontFamily:'JetBrains Mono,monospace', fontWeight:600,
                          padding:'2px 7px', borderRadius:6,
                          background:'rgba(160,120,80,0.08)', color:'var(--tx-4)',
                          border:'0.5px solid var(--border)',
                        }}>{list.length}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setDefSec(sec.key);
                            setEdit(null);
                            setModal(true);
                          }}
                          style={{
                            width:26, height:26, borderRadius:8,
                            border:'0.5px solid var(--border-2)',
                            background:'rgba(255,252,247,0.85)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            cursor:'pointer', color:'var(--tx-3)',
                          }}>
                          <Plus size={13} strokeWidth={2.5} />
                        </button>
                        <span style={{ color:'var(--tx-4)', display:'flex' }}>
                          {isCollapsed
                            ? <ChevronDown size={15} strokeWidth={2} />
                            : <ChevronUp   size={15} strokeWidth={2} />}
                        </span>
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity:0, height:0 }}
                          animate={{ opacity:1, height:'auto' }}
                          exit={{ opacity:0, height:0 }}
                          transition={{ duration:0.2, ease:[0.4,0,0.2,1] }}
                          style={{ overflow:'hidden' }}
                        >
                          {list.length === 0 ? (
                            <button
                              onClick={() => { setDefSec(sec.key); setEdit(null); setModal(true); }}
                              style={{
                                width:'100%', padding:'16px', background:'transparent',
                                border:'1px dashed var(--border-2)', borderRadius:13,
                                color:'var(--tx-3)', display:'flex', alignItems:'center',
                                justifyContent:'center', gap:6, fontSize:13, fontWeight:500,
                                fontFamily:'inherit', cursor:'pointer', marginBottom:4,
                              }}>
                              <Plus size={14} strokeWidth={2} /> Add {sec.label.toLowerCase()} task
                            </button>
                          ) : (
                            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                              <AnimatePresence mode="popLayout">
                                {list.map((task, i) => {
                                  const sectionList = tasks.filter(t => t.timeOfDay === task.timeOfDay && !q);
                                  const idx = sectionList.findIndex(t => t.id === task.id);
                                  const canUp   = !q && idx > 0;
                                  const canDown = !q && idx < sectionList.length - 1;
                                  const timeStr = task.scheduledTime
                                    ? task.scheduledEndTime
                                      ? `${formatTime(task.scheduledTime)} – ${formatTime(task.scheduledEndTime)}`
                                      : formatTime(task.scheduledTime)
                                    : null;

                                  return (
                                    <motion.div
                                      key={task.id}
                                      layout
                                      initial={{ opacity:0, y:8 }}
                                      animate={{ opacity:1, y:0 }}
                                      exit={{ opacity:0, x:-16, transition:{ duration:0.15 } }}
                                      transition={{ delay: i * 0.025 }}
                                    >
                                      <div style={{
                                        display:'flex', alignItems:'center', gap:10,
                                        padding:'12px 12px 12px 10px',
                                        background:'rgba(255,252,247,0.97)',
                                        border:'0.5px solid rgba(160,120,80,0.12)',
                                        borderRadius:14,
                                        boxShadow:'0 1px 3px rgba(100,60,20,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
                                        position:'relative', overflow:'hidden',
                                      }}>
                                        {/* Color stripe */}
                                        <div style={{
                                          position:'absolute', left:0, top:'20%', bottom:'20%',
                                          width:3, borderRadius:'0 3px 3px 0',
                                          background: task.color, opacity:0.85,
                                        }} />

                                        {/* Up / Down reorder */}
                                        {!q && (
                                          <div style={{ display:'flex', flexDirection:'column', gap:1, flexShrink:0, marginLeft:6 }}>
                                            <button
                                              onClick={() => move(task, -1)}
                                              disabled={!canUp}
                                              style={{
                                                width:20, height:20, borderRadius:5, border:'none',
                                                background: canUp ? 'rgba(160,120,80,0.08)' : 'transparent',
                                                color: canUp ? 'var(--tx-3)' : 'var(--tx-4)',
                                                display:'flex', alignItems:'center', justifyContent:'center',
                                                cursor: canUp ? 'pointer' : 'default', transition:'all 0.12s',
                                              }}>
                                              <ChevronUp size={11} strokeWidth={2.5} />
                                            </button>
                                            <button
                                              onClick={() => move(task, 1)}
                                              disabled={!canDown}
                                              style={{
                                                width:20, height:20, borderRadius:5, border:'none',
                                                background: canDown ? 'rgba(160,120,80,0.08)' : 'transparent',
                                                color: canDown ? 'var(--tx-3)' : 'var(--tx-4)',
                                                display:'flex', alignItems:'center', justifyContent:'center',
                                                cursor: canDown ? 'pointer' : 'default', transition:'all 0.12s',
                                              }}>
                                              <ChevronDown size={11} strokeWidth={2.5} />
                                            </button>
                                          </div>
                                        )}

                                        {/* Emoji */}
                                        <div style={{
                                          width:38, height:38, borderRadius:10, flexShrink:0,
                                          background:`${task.color}16`,
                                          border:`1px solid ${task.color}28`,
                                          display:'flex', alignItems:'center', justifyContent:'center',
                                          fontSize:18,
                                        }}>{task.emoji}</div>

                                        {/* Info */}
                                        <div style={{ flex:1, minWidth:0 }}>
                                          <p style={{
                                            fontSize:14, fontWeight:500, letterSpacing:'-0.01em',
                                            color:'var(--tx-1)', whiteSpace:'nowrap',
                                            overflow:'hidden', textOverflow:'ellipsis',
                                          }}>{task.title}</p>
                                          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4, flexWrap:'wrap' }}>
                                            {timeStr && (
                                              <span style={{
                                                fontSize:11, color:'var(--tx-3)',
                                                fontFamily:'JetBrains Mono,monospace',
                                              }}>{timeStr}</span>
                                            )}
                                            {timeStr && <span style={{ color:'var(--border-3)', fontSize:10 }}>·</span>}
                                            <DayBadges days={task.recurDays} isRecurring={task.isRecurring} />
                                          </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                                          <button
                                            onClick={() => { setEdit(task); setModal(true); }}
                                            style={{
                                              width:30, height:30, borderRadius:8,
                                              border:'0.5px solid var(--border-2)',
                                              background:'rgba(160,120,80,0.06)',
                                              display:'flex', alignItems:'center', justifyContent:'center',
                                              cursor:'pointer', color:'var(--tx-3)', transition:'all 0.12s',
                                            }}>
                                            <Pencil size={13} strokeWidth={2} />
                                          </button>
                                          <button
                                            onClick={() => del(task.id)}
                                            style={{
                                              width:30, height:30, borderRadius:8,
                                              border:'0.5px solid rgba(192,48,32,0.15)',
                                              background:'rgba(192,48,32,0.05)',
                                              display:'flex', alignItems:'center', justifyContent:'center',
                                              cursor:'pointer', color:'var(--red)', transition:'all 0.12s',
                                            }}>
                                            <Trash2 size={13} strokeWidth={2} />
                                          </button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </AnimatePresence>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </>
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

      <TaskModal
        isOpen={modal}
        onClose={() => { setModal(false); setEdit(null); }}
        onSave={save}
        editTask={editTask}
        defaultTimeOfDay={defSection}
      />
    </div>
  );
}
