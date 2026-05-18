'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Check } from 'lucide-react';
import { cn, COLORS, EMOJIS } from '@/lib/utils';
import type { Task, CreateTaskInput } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  emoji: z.string(),
  color: z.string(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
  scheduledTime: z.string().optional(),
  isRecurring: z.boolean(),
  recurDays: z.array(z.string()),
  notes: z.string().optional(),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTaskInput) => Promise<void>;
  editTask?: Task | null;
  defaultTimeOfDay?: 'morning' | 'afternoon' | 'evening';
}

const DAYS = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

export function TaskModal({ isOpen, onClose, onSave, editTask, defaultTimeOfDay = 'morning' }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('⚡');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [selectedDays, setSelectedDays] = useState<string[]>(['mon','tue','wed','thu','fri','sat','sun']);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateTaskInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      emoji: '⚡',
      color: '#6366f1',
      timeOfDay: defaultTimeOfDay,
      isRecurring: true,
      recurDays: ['mon','tue','wed','thu','fri','sat','sun'],
    },
  });

  useEffect(() => {
    if (editTask) {
      reset({
        title: editTask.title,
        emoji: editTask.emoji,
        color: editTask.color,
        timeOfDay: editTask.timeOfDay,
        scheduledTime: editTask.scheduledTime ?? undefined,
        isRecurring: editTask.isRecurring,
        recurDays: editTask.recurDays,
        notes: editTask.notes ?? undefined,
      });
      setSelectedEmoji(editTask.emoji);
      setSelectedColor(editTask.color);
      setSelectedDays(editTask.recurDays);
    } else {
      reset({
        emoji: '⚡',
        color: '#6366f1',
        timeOfDay: defaultTimeOfDay,
        isRecurring: true,
        recurDays: ['mon','tue','wed','thu','fri','sat','sun'],
      });
      setSelectedEmoji('⚡');
      setSelectedColor('#6366f1');
      setSelectedDays(['mon','tue','wed','thu','fri','sat','sun']);
    }
  }, [editTask, defaultTimeOfDay, reset]);

  const isRecurring = watch('isRecurring');

  const toggleDay = (day: string) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(next);
    setValue('recurDays', next);
  };

  const onSubmit = async (data: CreateTaskInput) => {
    setIsLoading(true);
    try {
      await onSave({ ...data, emoji: selectedEmoji, color: selectedColor, recurDays: selectedDays });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-md bg-[#141417] border border-white/8 rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/6">
              <h2 className="font-semibold text-white">{editTask ? 'Edit task' : 'New task'}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
              {/* Emoji + Title */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${selectedColor}20`, border: `1px solid ${selectedColor}40` }}
                >
                  {selectedEmoji}
                </div>
                <div className="flex-1">
                  <input
                    {...register('title')}
                    placeholder="Task name..."
                    className="input-base w-full px-3 py-2.5 text-sm"
                    autoFocus
                  />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                </div>
              </div>

              {/* Emoji picker */}
              <div>
                <label className="text-xs text-white/40 font-medium mb-2 block">Icon</label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => { setSelectedEmoji(e); setValue('emoji', e); }}
                      className={cn(
                        'w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all',
                        selectedEmoji === e ? 'bg-white/15 border border-white/20' : 'hover:bg-white/6'
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="text-xs text-white/40 font-medium mb-2 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setSelectedColor(c); setValue('color', c); }}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                      style={{ backgroundColor: c, boxShadow: selectedColor === c ? `0 0 12px ${c}80` : 'none' }}
                    >
                      {selectedColor === c && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time of day + scheduled time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/40 font-medium mb-1.5 block">Time of day</label>
                  <select
                    {...register('timeOfDay')}
                    className="input-base w-full px-3 py-2.5 text-sm appearance-none"
                  >
                    <option value="morning">🌅 Morning</option>
                    <option value="afternoon">☀️ Afternoon</option>
                    <option value="evening">🌙 Evening</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 font-medium mb-1.5 block">Time</label>
                  <input
                    {...register('scheduledTime')}
                    type="time"
                    className="input-base w-full px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              {/* Recurring */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-white/70">Recurring</label>
                  <button
                    type="button"
                    onClick={() => setValue('isRecurring', !isRecurring)}
                    className={cn(
                      'w-11 h-6 rounded-full transition-all relative',
                      isRecurring ? 'bg-indigo-500' : 'bg-white/10'
                    )}
                  >
                    <div className={cn(
                      'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                      isRecurring ? 'left-6' : 'left-1'
                    )} />
                  </button>
                </div>

                {isRecurring && (
                  <div className="flex gap-1.5">
                    {DAYS.map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => toggleDay(d.key)}
                        className={cn(
                          'flex-1 h-8 rounded-lg text-xs font-semibold transition-all',
                          selectedDays.includes(d.key)
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'bg-white/5 text-white/30 border border-white/6 hover:border-white/15'
                        )}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-white/40 font-medium mb-1.5 block">Notes (optional)</label>
                <textarea
                  {...register('notes')}
                  placeholder="Add context or instructions..."
                  rows={2}
                  className="input-base w-full px-3 py-2.5 text-sm resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editTask ? 'Save changes' : 'Add task'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
