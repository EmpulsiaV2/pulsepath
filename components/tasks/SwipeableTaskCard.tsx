'use client';
import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, type PanInfo } from 'framer-motion';
import { Check, Trash2, Clock } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import type { Task } from '@/types';

interface Props {
  task: Task;
  onComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const THRESHOLD = 76;
const MAX = 108;

export function SwipeableTaskCard({ task, onComplete, onDelete, onEdit }: Props) {
  const x        = useMotionValue(0);
  const controls = useAnimation();
  const dragging = useRef(false);

  // Right swipe → delete (red left bg)
  const delBg  = useTransform(x, [0, THRESHOLD], ['rgba(192,48,32,0)', 'rgba(192,48,32,0.09)']);
  const delOp  = useTransform(x, [0, THRESHOLD * 0.5, THRESHOLD], [0, 0.4, 1]);
  const delSc  = useTransform(x, [0, THRESHOLD], [0.6, 1]);

  // Left swipe → complete (green right bg)
  const doneBg = useTransform(x, [-THRESHOLD, 0], ['rgba(77,124,42,0.09)', 'rgba(77,124,42,0)']);
  const doneOp = useTransform(x, [-THRESHOLD, -THRESHOLD * 0.5, 0], [1, 0.4, 0]);
  const doneSc = useTransform(x, [-THRESHOLD, 0], [1, 0.6]);

  const onDragEnd = async (_: unknown, info: PanInfo) => {
    dragging.current = false;
    if (info.offset.x > THRESHOLD) {
      await controls.start({ x: 380, opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } });
      onDelete(task.id);
    } else if (info.offset.x < -THRESHOLD) {
      await controls.start({ x: -380, opacity: 0, transition: { duration: 0.22, ease: 'easeIn' } });
      onComplete(task.id, !task.isCompleted);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 500, damping: 38 } });
    }
  };

  const timeRange = task.scheduledTime
    ? task.scheduledEndTime
      ? `${formatTime(task.scheduledTime)} – ${formatTime(task.scheduledEndTime)}`
      : formatTime(task.scheduledTime)
    : null;

  return (
    <div style={{ position: 'relative', marginBottom: 8, borderRadius: 16, overflow: 'hidden' }}>

      {/* Delete reveal (right swipe) */}
      <motion.div style={{
        position: 'absolute', inset: 0, borderRadius: 16,
        display: 'flex', alignItems: 'center', paddingLeft: 20, gap: 7,
        backgroundColor: delBg,
      }}>
        <motion.div style={{ opacity: delOp, scale: delSc, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trash2 size={15} color="var(--red)" strokeWidth={2} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--red)', letterSpacing: '-0.01em' }}>Delete</span>
        </motion.div>
      </motion.div>

      {/* Complete reveal (left swipe) */}
      <motion.div style={{
        position: 'absolute', inset: 0, borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        paddingRight: 20, gap: 7,
        backgroundColor: doneBg,
      }}>
        <motion.div style={{ opacity: doneOp, scale: doneSc, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', letterSpacing: '-0.01em' }}>
            {task.isCompleted ? 'Undo' : 'Done'}
          </span>
          <Check size={15} color="var(--green)" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      {/* Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -MAX, right: MAX }}
        dragElastic={{ left: 0.16, right: 0.16 }}
        style={{ x }}
        animate={controls}
        onDragStart={() => { dragging.current = true; }}
        onDragEnd={onDragEnd}
        whileTap={{ cursor: 'grabbing' }}
      >
        <div
          className="glass-card"
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px 12px 12px',
            opacity: task.isCompleted ? 0.5 : 1,
            cursor: 'grab',
            transition: 'opacity 0.2s',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Left color stripe */}
          <div style={{
            position: 'absolute', left: 0, top: '18%', bottom: '18%',
            width: 3, borderRadius: '0 3px 3px 0',
            background: task.color, opacity: task.isCompleted ? 0.35 : 0.85,
          }} />

          {/* Emoji */}
          <div style={{
            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
            background: `${task.color}18`,
            border: `1px solid ${task.color}28`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 19, position: 'relative', marginLeft: 4,
          }}>
            {task.emoji}
            {task.isCompleted && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 10,
                background: 'rgba(255,252,247,0.72)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Check size={14} color="var(--green)" strokeWidth={2.5} />
              </div>
            )}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em',
              color: task.isCompleted ? 'var(--tx-3)' : 'var(--tx-1)',
              textDecoration: task.isCompleted ? 'line-through' : 'none',
              textDecorationColor: 'var(--tx-4)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {task.title}
            </p>
            {timeRange && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Clock size={10} color="var(--tx-4)" strokeWidth={2} />
                <span style={{
                  fontSize: 11, color: 'var(--tx-3)',
                  fontFamily: 'JetBrains Mono, monospace', fontWeight: 400,
                }}>
                  {timeRange}
                </span>
              </div>
            )}
          </div>

          {/* Edit tap zone — right side */}
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onEdit(task); }}
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: '0.5px solid var(--border-2)',
              background: 'rgba(160,120,80,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, color: 'var(--tx-3)',
              fontSize: 13, fontWeight: 600,
            }}
          >
            ···
          </button>
        </div>
      </motion.div>
    </div>
  );
}
