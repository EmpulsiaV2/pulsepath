'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Check } from 'lucide-react';
import { COLORS, EMOJIS } from '@/lib/utils';
import type { Task, CreateTaskInput } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title required').max(100),
  emoji: z.string(),
  color: z.string(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
  scheduledTime: z.string().optional(),
  isRecurring: z.boolean(),
  recurDays: z.array(z.string()),
  notes: z.string().optional(),
});

const DAYS = [
  { key: 'mon', short: 'M', label: 'Mon' },
  { key: 'tue', short: 'T', label: 'Tue' },
  { key: 'wed', short: 'W', label: 'Wed' },
  { key: 'thu', short: 'T', label: 'Thu' },
  { key: 'fri', short: 'F', label: 'Fri' },
  { key: 'sat', short: 'S', label: 'Sat' },
  { key: 'sun', short: 'S', label: 'Sun' },
];

const PRESETS = [
  { label: 'Every day',     days: ['mon','tue','wed','thu','fri','sat','sun'] },
  { label: 'Weekdays',      days: ['mon','tue','wed','thu','fri'] },
  { label: 'Weekends',      days: ['sat','sun'] },
  { label: 'Mon / Wed / Fri', days: ['mon','wed','fri'] },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTaskInput) => Promise<void>;
  editTask?: Task | null;
  defaultTimeOfDay?: 'morning' | 'afternoon' | 'evening';
}

export function TaskModal({ isOpen, onClose, onSave, editTask, defaultTimeOfDay = 'morning' }: Props) {
  const [saving, setSaving] = useState(false);
  const [emoji, setEmoji]   = useState('⚡');
  const [color, setColor]   = useState('#7b68ee');
  const [days, setDays]     = useState<string[]>(['mon','tue','wed','thu','fri','sat','sun']);
  const [tab, setTab]       = useState<'basics'|'schedule'>('basics');

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateTaskInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      emoji: '⚡', color: '#7b68ee',
      timeOfDay: defaultTimeOfDay,
      isRecurring: true,
      recurDays: ['mon','tue','wed','thu','fri','sat','sun'],
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    setTab('basics');
    if (editTask) {
      reset({
        title: editTask.title, emoji: editTask.emoji, color: editTask.color,
        timeOfDay: editTask.timeOfDay, scheduledTime: editTask.scheduledTime ?? undefined,
        isRecurring: editTask.isRecurring, recurDays: editTask.recurDays,
        notes: editTask.notes ?? undefined,
      });
      setEmoji(editTask.emoji); setColor(editTask.color); setDays(editTask.recurDays);
    } else {
      reset({
        emoji: '⚡', color: '#7b68ee', timeOfDay: defaultTimeOfDay,
        isRecurring: true, recurDays: ['mon','tue','wed','thu','fri','sat','sun'],
      });
      setEmoji('⚡'); setColor('#7b68ee');
      setDays(['mon','tue','wed','thu','fri','sat','sun']);
    }
  }, [isOpen, editTask, defaultTimeOfDay, reset]);

  const isRecurring = watch('isRecurring');

  const toggleDay = (d: string) => {
    const next = days.includes(d) ? days.filter(x => x !== d) : [...days, d];
    setDays(next); setValue('recurDays', next);
  };

  const applyPreset = (preset: string[]) => {
    setDays(preset); setValue('recurDays', preset);
  };

  const onSubmit = async (data: CreateTaskInput) => {
    setSaving(true);
    try { await onSave({ ...data, emoji, color, recurDays: days }); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 env(safe-area-inset-bottom,0px)' }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            style={{
              position: 'relative', zIndex: 1, width: '100%', maxWidth: 520,
              background: 'var(--bg-2)', borderRadius: '20px 20px 0 0',
              border: '1px solid var(--border-2)', borderBottom: 'none',
              maxHeight: '92dvh', display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-3)' }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 0' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}>
                {editTask ? 'Edit task' : 'New task'}
              </h2>
              <button onClick={onClose} style={{
                width: 30, height: 30, borderRadius: 8, border: 'none',
                background: 'var(--bg-3)', color: 'var(--tx-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <X size={14} />
              </button>
            </div>

            {/* Tab toggle */}
            <div style={{ padding: '16px 20px 0' }}>
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg-1)', borderRadius: 10, padding: 4 }}>
                {(['basics', 'schedule'] as const).map(t => (
                  <button
                    key={t} onClick={() => setTab(t)}
                    style={{
                      flex: 1, padding: '7px 0', borderRadius: 7, border: 'none',
                      background: tab === t ? 'var(--bg-3)' : 'transparent',
                      color: tab === t ? 'var(--tx-1)' : 'var(--tx-3)',
                      fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <form id="task-form" onSubmit={handleSubmit(onSubmit)}>
                {tab === 'basics' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Emoji + Title row */}
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                        background: `${color}16`, border: `1px solid ${color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22,
                      }}>{emoji}</div>
                      <div style={{ flex: 1 }}>
                        <input
                          {...register('title')}
                          placeholder="Task name"
                          autoFocus
                          style={{
                            width: '100%', height: 48, background: 'var(--bg-1)',
                            border: '1px solid var(--border-2)', borderRadius: 12,
                            color: 'var(--tx-1)', fontSize: 15, fontWeight: 500,
                            fontFamily: 'inherit', padding: '0 14px', outline: 'none',
                            letterSpacing: '-0.01em',
                          }}
                        />
                        {errors.title && <p style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.title.message}</p>}
                      </div>
                    </div>

                    {/* Emoji grid */}
                    <div>
                      <p className="label" style={{ marginBottom: 10 }}>Icon</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {EMOJIS.map(e => (
                          <button key={e} type="button" onClick={() => { setEmoji(e); setValue('emoji', e); }}
                            style={{
                              width: 38, height: 38, borderRadius: 9,
                              background: emoji === e ? 'var(--bg-4)' : 'var(--bg-3)',
                              border: `1px solid ${emoji === e ? 'var(--border-3)' : 'transparent'}`,
                              fontSize: 18, cursor: 'pointer', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.1s',
                            }}
                          >{e}</button>
                        ))}
                      </div>
                    </div>

                    {/* Color row */}
                    <div>
                      <p className="label" style={{ marginBottom: 10 }}>Color</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {COLORS.map(c => (
                          <button key={c} type="button" onClick={() => { setColor(c); setValue('color', c); }}
                            style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: c, border: `2px solid ${color === c ? 'white' : 'transparent'}`,
                              cursor: 'pointer', transition: 'transform 0.1s, border 0.1s',
                              transform: color === c ? 'scale(1.2)' : 'scale(1)',
                              outline: color === c ? `3px solid ${c}50` : 'none',
                              outlineOffset: 2,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            {color === c && <Check size={11} color="white" strokeWidth={3} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <p className="label" style={{ marginBottom: 8 }}>Notes <span style={{ color: 'var(--tx-4)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>optional</span></p>
                      <textarea
                        {...register('notes')}
                        placeholder="Add context..."
                        rows={2}
                        className="field"
                        style={{ resize: 'none', lineHeight: 1.5 }}
                      />
                    </div>

                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Time + Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <p className="label" style={{ marginBottom: 8 }}>Section</p>
                        <select {...register('timeOfDay')} className="field">
                          <option value="morning">🌅 Morning</option>
                          <option value="afternoon">☀️ Afternoon</option>
                          <option value="evening">🌙 Evening</option>
                        </select>
                      </div>
                      <div>
                        <p className="label" style={{ marginBottom: 8 }}>Time</p>
                        <input {...register('scheduledTime')} type="time" className="field" />
                      </div>
                    </div>

                    {/* Weekly schedule */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <p className="label">Repeats on</p>
                        <button
                          type="button"
                          onClick={() => setValue('isRecurring', !isRecurring)}
                          className="toggle"
                          data-on={String(isRecurring)}
                        />
                      </div>

                      {isRecurring && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {/* Day pills */}
                          <div style={{ display: 'flex', gap: 6 }}>
                            {DAYS.map(d => {
                              const on = days.includes(d.key);
                              return (
                                <button key={d.key} type="button" onClick={() => toggleDay(d.key)}
                                  style={{
                                    flex: 1, height: 36, borderRadius: 8, border: 'none',
                                    background: on ? 'var(--accent-dim)' : 'var(--bg-3)',
                                    color: on ? 'var(--accent-text)' : 'var(--tx-3)',
                                    fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
                                    cursor: 'pointer', transition: 'all 0.15s',
                                    outline: on ? '1px solid var(--accent-border)' : '1px solid transparent',
                                  }}
                                >{d.short}</button>
                              );
                            })}
                          </div>

                          {/* Quick presets */}
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {PRESETS.map(p => {
                              const active = JSON.stringify([...p.days].sort()) === JSON.stringify([...days].sort());
                              return (
                                <button key={p.label} type="button" onClick={() => applyPreset(p.days)}
                                  style={{
                                    padding: '5px 10px', borderRadius: 7, border: 'none',
                                    background: active ? 'var(--accent-dim)' : 'var(--bg-3)',
                                    color: active ? 'var(--accent-text)' : 'var(--tx-3)',
                                    fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                    outline: active ? '1px solid var(--accent-border)' : '1px solid var(--border)',
                                  }}
                                >{p.label}</button>
                              );
                            })}
                          </div>

                          {/* Summary line */}
                          {days.length > 0 && (
                            <p style={{ fontSize: 12, color: 'var(--tx-3)', letterSpacing: '-0.01em' }}>
                              Repeats every {days.length === 7 ? 'day' : days.map(d => DAYS.find(x => x.key === d)?.label).join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 20px 20px', flexShrink: 0 }}>
              <button
                type="submit"
                form="task-form"
                disabled={saving}
                className="btn btn-accent btn-full"
              >
                {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : editTask ? 'Save changes' : 'Add task'}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
