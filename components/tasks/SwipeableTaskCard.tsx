'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  type PanInfo,
} from 'framer-motion';
import { Check, Trash2, Clock, MoreHorizontal, GripVertical } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import type { Task } from '@/types';

interface Props {
  task: Task;
  onComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const THRESHOLD = 72;
const MAX     = 100;

// LEFT swipe = complete  (green, right side)
// RIGHT swipe = delete   (red, left side)

export function SwipeableTaskCard({ task, onComplete, onDelete, onEdit }: Props) {
  const x        = useMotionValue(0);
  const controls = useAnimation();
  const swiping  = useRef(false);

  // Right-swipe reveal (delete) — positive x
  const deleteOpacity = useTransform(x, [0, THRESHOLD * 0.4, THRESHOLD], [0, 0.5, 1]);
  const deleteScale   = useTransform(x, [0, THRESHOLD], [0.6, 1]);
  const deleteBg      = useTransform(x, [0, THRESHOLD], ['rgba(248,113,113,0)', 'rgba(248,113,113,0.12)']);

  // Left-swipe reveal (complete) — negative x
  const doneOpacity   = useTransform(x, [-THRESHOLD, -THRESHOLD * 0.4, 0], [1, 0.5, 0]);
  const doneScale     = useTransform(x, [-THRESHOLD, 0], [1, 0.6]);
  const doneBg        = useTransform(x, [-THRESHOLD, 0], ['rgba(52,211,153,0.12)', 'rgba(52,211,153,0)']);

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    swiping.current = false;
    const { offset } = info;

    if (offset.x > THRESHOLD) {
      // Delete — swiped right
      await controls.start({ x: 360, opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } });
      onDelete(task.id);
    } else if (offset.x < -THRESHOLD) {
      // Complete — swiped left
      await controls.start({ x: -360, opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } });
      onComplete(task.id, !task.isCompleted);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 500, damping: 35 } });
    }
  };

  return (
    <div style={{ position: 'relative', marginBottom: 6, overflow: 'hidden', borderRadius: 12 }}>

      {/* Left reveal: DELETE (right swipe) */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, borderRadius: 12,
          display: 'flex', alignItems: 'center', paddingLeft: 20,
          gap: 8,
          backgroundColor: deleteBg,
        }}
      >
        <motion.div style={{ opacity: deleteOpacity, scale: deleteScale, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trash2 size={16} color="var(--red)" strokeWidth={2} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', letterSpacing: '-0.01em' }}>Delete</span>
        </motion.div>
      </motion.div>

      {/* Right reveal: COMPLETE (left swipe) */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          paddingRight: 20, gap: 8,
          backgroundColor: doneBg,
        }}
      >
        <motion.div style={{ opacity: doneOpacity, scale: doneScale, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', letterSpacing: '-0.01em' }}>
            {task.isCompleted ? 'Undo' : 'Done'}
          </span>
          <Check size={16} color="var(--green)" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      {/* Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -MAX, right: MAX }}
        dragElastic={{ left: 0.18, right: 0.18 }}
        style={{
          x,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 12px 12px 10px',
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          cursor: 'grab',
          position: 'relative',
          opacity: task.isCompleted ? 0.45 : 1,
        }}
        animate={controls}
        onDragStart={() => { swiping.current = true; }}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
      >
        {/* Color bar */}
        <div style={{
          position: 'absolute',
          left: 0, top: '20%', bottom: '20%',
          width: 3,
          background: task.color,
          borderRadius: '0 2px 2px 0',
          opacity: task.isCompleted ? 0.4 : 0.9,
        }} />

        {/* Drag grip */}
        <GripVertical
          size={14}
          color="var(--tx-4)"
          style={{ flexShrink: 0, marginLeft: 6 }}
        />

        {/* Emoji chip */}
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: `${task.color}16`,
          border: `1px solid ${task.color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, position: 'relative',
        }}>
          {task.emoji}
          {task.isCompleted && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 8,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={14} color="var(--green)" strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: task.isCompleted ? 'var(--tx-3)' : 'var(--tx-1)',
            textDecoration: task.isCompleted ? 'line-through' : 'none',
            textDecorationColor: 'var(--tx-4)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {task.title}
          </p>
          {task.scheduledTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Clock size={11} color="var(--tx-4)" />
              <span style={{ fontSize: 11, color: 'var(--tx-3)', fontFamily: 'Geist Mono, monospace' }}>
                {formatTime(task.scheduledTime)}
              </span>
            </div>
          )}
        </div>

        {/* More button */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          style={{
            width: 30, height: 30, borderRadius: 8, border: 'none',
            background: 'transparent', color: 'var(--tx-4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-3)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--tx-2)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--tx-4)'; }}
        >
          <MoreHorizontal size={15} strokeWidth={2} />
        </button>
      </motion.div>
    </div>
  );
}
