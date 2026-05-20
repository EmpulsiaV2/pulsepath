'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Loader2, Check } from 'lucide-react';
import { COLORS, EMOJIS } from '@/lib/utils';
import type { Task, CreateTaskInput } from '@/types';

const DAYS = [
  { key: 'mon', s: 'Mo' }, { key: 'tue', s: 'Tu' }, { key: 'wed', s: 'We' },
  { key: 'thu', s: 'Th' }, { key: 'fri', s: 'Fr' }, { key: 'sat', s: 'Sa' },
  { key: 'sun', s: 'Su' },
];
const PRESETS = [
  { label: 'Every day',       days: ['mon','tue','wed','thu','fri','sat','sun'] },
  { label: 'Weekdays',        days: ['mon','tue','wed','thu','fri'] },
  { label: 'Weekends',        days: ['sat','sun'] },
  { label: 'Mon / Wed / Fri', days: ['mon','wed','fri'] },
];
const DAY_LABELS: Record<string, string> = {
  mon:'Mon', tue:'Tue', wed:'Wed', thu:'Thu', fri:'Fri', sat:'Sat', sun:'Sun',
};

function toSection(t?: string): 'morning'|'afternoon'|'evening' {
  if (!t || !t.trim()) return 'morning';
  const h = parseInt(t.split(':')[0], 10);
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

interface Props {
  isOpen: boolean; onClose: () => void;
  onSave: (d: CreateTaskInput) => Promise<void>;
  editTask?: Task | null;
  defaultTimeOfDay?: 'morning'|'afternoon'|'evening';
}

export function TaskModal({ isOpen, onClose, onSave, editTask, defaultTimeOfDay = 'morning' }: Props) {
  const [saving, setSaving] = useState(false);
  const [emoji,  setEmoji]  = useState('⚡');
  const [color,  setColor]  = useState('#D4612A');
  const [days,   setDays]   = useState(['mon','tue','wed','thu','fri','sat','sun']);
  const [tab,    setTab]    = useState<'basics'|'schedule'>('basics');

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
    useForm<CreateTaskInput>({
      defaultValues: {
        emoji: '⚡', color: '#D4612A', timeOfDay: defaultTimeOfDay,
        isRecurring: true, recurDays: ['mon','tue','wed','thu','fri','sat','sun'],
      },
    });

  useEffect(() => {
    if (!isOpen) return;
    setTab('basics');
    if (editTask) {
      reset({
        title: editTask.title, emoji: editTask.emoji, color: editTask.color,
        timeOfDay: editTask.timeOfDay,
        scheduledTime: editTask.scheduledTime ?? undefined,
        scheduledEndTime: editTask.scheduledEndTime ?? undefined,
        isRecurring: editTask.isRecurring, recurDays: editTask.recurDays,
        notes: editTask.notes ?? undefined,
      });
      setEmoji(editTask.emoji); setColor(editTask.color); setDays(editTask.recurDays);
    } else {
      reset({ emoji: '⚡', color: '#D4612A', timeOfDay: defaultTimeOfDay,
        isRecurring: true, recurDays: ['mon','tue','wed','thu','fri','sat','sun'] });
      setEmoji('⚡'); setColor('#D4612A');
      setDays(['mon','tue','wed','thu','fri','sat','sun']);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const isRecurring = watch('isRecurring');
  const startTime   = watch('scheduledTime');
  const section     = watch('timeOfDay');

  useEffect(() => {
    if (startTime && startTime.trim()) setValue('timeOfDay', toSection(startTime));
  }, [startTime, setValue]);

  const toggleDay = (d: string) => {
    const next = days.includes(d) ? days.filter(x => x !== d) : [...days, d];
    setDays(next); setValue('recurDays', next);
  };

  const onSubmit = async (data: CreateTaskInput) => {
    setSaving(true);
    try { await onSave({ ...data, emoji, color, recurDays: days }); onClose(); }
    finally { setSaving(false); }
  };

  const sLabel = { morning: '🌅 Morning', afternoon: '☀️ Afternoon', evening: '🌙 Evening' }[section ?? 'morning'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={onClose}
            style={{ position:'absolute', inset:0, background:'rgba(30,20,10,0.40)', backdropFilter:'blur(8px)' }}
          />

          <motion.div
            initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
            transition={{ type:'spring', stiffness:440, damping:40 }}
            style={{
              position:'relative', zIndex:1, width:'100%', maxWidth:520,
              background:'rgba(253,250,245,0.97)',
              backdropFilter:'blur(24px) saturate(180%)',
              WebkitBackdropFilter:'blur(24px) saturate(180%)',
              borderRadius:'22px 22px 0 0',
              border:'0.5px solid rgba(255,255,255,0.9)',
              borderBottom:'none',
              boxShadow:'0 -8px 40px rgba(100,60,20,0.18), inset 0 1px 0 rgba(255,255,255,0.95)',
              maxHeight:'93dvh', display:'flex', flexDirection:'column',
              paddingBottom:'env(safe-area-inset-bottom,0px)',
            }}
          >
            {/* Handle */}
            <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 0', flexShrink:0 }}>
              <div style={{ width:36, height:4, borderRadius:2, background:'rgba(160,120,80,0.22)' }} />
            </div>

            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 20px 0', flexShrink:0 }}>
              <h2 style={{ fontSize:16, fontWeight:600, letterSpacing:'-0.02em', color:'var(--tx-1)' }}>
                {editTask ? 'Edit task' : 'New task'}
              </h2>
              <button onClick={onClose} style={{
                width:30, height:30, borderRadius:8, border:'0.5px solid var(--border-2)',
                background:'rgba(160,120,80,0.08)', color:'var(--tx-3)',
                display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
              }}><X size={14} /></button>
            </div>

            {/* Tabs */}
            <div style={{ padding:'12px 20px 0', flexShrink:0 }}>
              <div style={{ display:'flex', gap:4, background:'rgba(160,120,80,0.08)', borderRadius:11, padding:4 }}>
                {(['basics','schedule'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    flex:1, padding:'7px 0', borderRadius:8, border:'none', cursor:'pointer',
                    fontFamily:'inherit', fontSize:13, fontWeight:600, letterSpacing:'-0.01em',
                    background: tab===t ? 'rgba(253,250,245,0.95)' : 'transparent',
                    color: tab===t ? 'var(--tx-1)' : 'var(--tx-3)',
                    boxShadow: tab===t ? 'var(--sh-sm)' : 'none',
                    transition:'all 0.15s',
                  }}>
                    {t==='basics' ? 'Basics' : `Schedule${startTime ? ' · '+startTime : ''}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable body */}
            <div style={{ flex:1, overflowY:'auto', padding:'16px 20px 0' }}>
              <form id="task-form" onSubmit={handleSubmit(onSubmit)}>
                {tab === 'basics' ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:16, paddingBottom:8 }}>

                    {/* Emoji + title */}
                    <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                      <div style={{
                        width:50, height:50, borderRadius:14, flexShrink:0,
                        background:`${color}16`, border:`1.5px solid ${color}28`,
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:24,
                        boxShadow:`0 2px 8px ${color}20`,
                      }}>{emoji}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <input {...register('title', { required: 'Name required' })}
                          placeholder="Task name"
                          autoFocus
                          style={{
                            width:'100%', height:50, background:'rgba(255,252,248,0.9)',
                            border:`1px solid ${errors.title ? 'var(--red)' : 'var(--border-2)'}`,
                            borderRadius:13, color:'var(--tx-1)',
                            fontSize:16, fontWeight:500, fontFamily:'inherit',
                            padding:'0 14px', outline:'none', letterSpacing:'-0.01em',
                            boxShadow:'inset 0 1px 2px rgba(100,60,20,0.04)',
                          }}
                        />
                        {errors.title && <p style={{ color:'var(--red)', fontSize:11, marginTop:4 }}>{errors.title.message}</p>}
                      </div>
                    </div>

                    {/* Emoji grid */}
                    <div>
                      <p className="label" style={{ marginBottom:10 }}>Icon</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                        {EMOJIS.map(e => (
                          <button key={e} type="button"
                            onClick={() => { setEmoji(e); setValue('emoji', e); }}
                            style={{
                              width:38, height:38, borderRadius:10, border:'none',
                              background: emoji===e ? 'rgba(160,120,80,0.12)' : 'rgba(160,120,80,0.06)',
                              outline: emoji===e ? '1.5px solid rgba(160,120,80,0.28)' : '1.5px solid transparent',
                              fontSize:18, cursor:'pointer', transition:'all 0.12s',
                              display:'flex', alignItems:'center', justifyContent:'center',
                            }}>{e}</button>
                        ))}
                      </div>
                    </div>

                    {/* Color */}
                    <div>
                      <p className="label" style={{ marginBottom:10 }}>Color</p>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        {COLORS.map(c => (
                          <button key={c} type="button"
                            onClick={() => { setColor(c); setValue('color', c); }}
                            style={{
                              width:30, height:30, borderRadius:'50%', background:c,
                              border:`2.5px solid ${color===c ? 'rgba(255,255,255,0.95)' : 'transparent'}`,
                              cursor:'pointer', transition:'all 0.12s',
                              transform: color===c ? 'scale(1.18)' : 'scale(1)',
                              boxShadow: color===c ? `0 0 0 1.5px ${c}, 0 3px 8px ${c}40` : 'var(--sh-sm)',
                              display:'flex', alignItems:'center', justifyContent:'center',
                            }}>
                            {color===c && <Check size={11} color="white" strokeWidth={3} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <p className="label" style={{ marginBottom:8 }}>
                        Notes <span style={{ textTransform:'none', fontWeight:400, letterSpacing:0, color:'var(--tx-4)' }}>optional</span>
                      </p>
                      <textarea {...register('notes')} placeholder="Add context…" rows={2} className="field" />
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:18, paddingBottom:8 }}>

                    {/* Start + End time */}
                    <div>
                      <p className="label" style={{ marginBottom:10 }}>Time</p>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        <div>
                          <p style={{ fontSize:11, color:'var(--tx-3)', marginBottom:5, fontWeight:500 }}>Starts</p>
                          <input {...register('scheduledTime')} type="time" className="field"
                            style={{ fontFamily:'JetBrains Mono, monospace', fontSize:15, fontWeight:500, padding:'11px 12px' }} />
                        </div>
                        <div>
                          <p style={{ fontSize:11, color:'var(--tx-3)', marginBottom:5, fontWeight:500 }}>Ends</p>
                          <input {...register('scheduledEndTime')} type="time" className="field"
                            style={{ fontFamily:'JetBrains Mono, monospace', fontSize:15, fontWeight:500, padding:'11px 12px' }} />
                        </div>
                      </div>
                      {startTime && startTime.trim() && (
                        <p style={{ fontSize:12, color:'var(--tx-3)', marginTop:8, display:'flex', alignItems:'center', gap:5 }}>
                          Auto-assigned to <strong style={{ color:'var(--tx-2)', fontWeight:600 }}>{sLabel}</strong>
                        </p>
                      )}
                    </div>

                    {/* Section override */}
                    <div>
                      <p className="label" style={{ marginBottom:10 }}>Section</p>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                        {(['morning','afternoon','evening'] as const).map(s => (
                          <button key={s} type="button" onClick={() => setValue('timeOfDay', s)}
                            style={{
                              padding:'10px 6px', borderRadius:10, border:'none', cursor:'pointer',
                              fontFamily:'inherit', fontSize:12, fontWeight:600,
                              background: section===s ? 'var(--ac-dim)' : 'rgba(160,120,80,0.06)',
                              color: section===s ? 'var(--ac-text)' : 'var(--tx-3)',
                              outline: section===s ? '1px solid var(--ac-border)' : '1px solid transparent',
                              transition:'all 0.15s',
                            }}>
                            {s==='morning'?'🌅 Morning':s==='afternoon'?'☀️ Afternoon':'🌙 Evening'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Repeat */}
                    <div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                        <div>
                          <p style={{ fontSize:14, fontWeight:600, letterSpacing:'-0.01em', color:'var(--tx-1)' }}>Repeat weekly</p>
                          <p style={{ fontSize:11, color:'var(--tx-3)', marginTop:2 }}>Show on selected days each week</p>
                        </div>
                        <button type="button" onClick={() => setValue('isRecurring', !isRecurring)}
                          className="toggle" data-on={String(isRecurring)} />
                      </div>

                      {isRecurring && (
                        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                          <div style={{ display:'flex', gap:5 }}>
                            {DAYS.map(d => {
                              const on = days.includes(d.key);
                              return (
                                <button key={d.key} type="button" onClick={() => toggleDay(d.key)} style={{
                                  flex:1, height:36, borderRadius:9, border:'none', cursor:'pointer',
                                  fontFamily:'inherit', fontSize:12, fontWeight:700,
                                  background: on ? 'var(--ac-dim)' : 'rgba(160,120,80,0.07)',
                                  color: on ? 'var(--ac-text)' : 'var(--tx-3)',
                                  outline: on ? '1px solid var(--ac-border)' : '1px solid transparent',
                                  transition:'all 0.12s',
                                }}>{d.s}</button>
                              );
                            })}
                          </div>

                          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                            {PRESETS.map(p => {
                              const active = JSON.stringify([...p.days].sort()) === JSON.stringify([...days].sort());
                              return (
                                <button key={p.label} type="button" onClick={() => { setDays(p.days); setValue('recurDays', p.days); }}
                                  style={{
                                    padding:'5px 10px', borderRadius:7, border:'none', cursor:'pointer',
                                    fontFamily:'inherit', fontSize:11, fontWeight:600,
                                    background: active ? 'var(--ac-dim)' : 'rgba(160,120,80,0.07)',
                                    color: active ? 'var(--ac-text)' : 'var(--tx-3)',
                                    outline: active ? '1px solid var(--ac-border)' : '1px solid rgba(160,120,80,0.14)',
                                    transition:'all 0.12s',
                                  }}>{p.label}</button>
                              );
                            })}
                          </div>

                          {days.length > 0
                            ? <p style={{ fontSize:12, color:'var(--tx-3)' }}>
                                Repeats {days.length===7 ? 'every day' : days.map(d => DAY_LABELS[d]).join(', ')}
                              </p>
                            : <p style={{ fontSize:12, color:'var(--red)' }}>Select at least one day</p>
                          }
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div style={{ padding:'14px 20px 18px', flexShrink:0, borderTop:'0.5px solid var(--border)' }}>
              <button type="submit" form="task-form" disabled={saving} className="btn btn-accent btn-full">
                {saving
                  ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Saving…</>
                  : editTask ? 'Save changes' : 'Add task'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
