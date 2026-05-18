'use client';

import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import { CheckCircle2, Trash2, Clock, MoreHorizontal, GripVertical } from 'lucide-react';
import { formatTime, cn } from '@/lib/utils';
import type { Task } from '@/types';

interface Props {
  task: Task;
  onComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

const SWIPE_THRESHOLD = 80;
const MAX_SWIPE = 120;

export function SwipeableTaskCard({ task, onComplete, onDelete, onEdit, isDragging, dragHandleProps }: Props) {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const isDraggingSwipe = useRef(false);

  const bgColorComplete = useTransform(x, [0, SWIPE_THRESHOLD], ['rgba(16,185,129,0)', 'rgba(16,185,129,0.15)']);
  const bgColorDelete = useTransform(x, [-SWIPE_THRESHOLD, 0], ['rgba(239,68,68,0.15)', 'rgba(239,68,68,0)']);

  const completeOpacity = useTransform(x, [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD], [0, 0.4, 1]);
  const deleteOpacity = useTransform(x, [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.5, 0], [1, 0.4, 0]);

  const completeScale = useTransform(x, [0, SWIPE_THRESHOLD], [0.5, 1]);
  const deleteScale = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0.5]);

  const handleDragEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;

    if (offset.x > SWIPE_THRESHOLD) {
      // Complete
      await controls.start({ x: 300, opacity: 0, transition: { duration: 0.3 } });
      onComplete(task.id, !task.isCompleted);
      controls.start({ x: 0, opacity: 1 });
    } else if (offset.x < -SWIPE_THRESHOLD) {
      // Delete
      await controls.start({ x: -400, opacity: 0, transition: { duration: 0.3 } });
      onDelete(task.id);
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } });
    }
  };

  const completedOpacity = task.isCompleted ? 0.5 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-2.5">
      {/* Action backgrounds */}
      <div className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none">
        {/* Complete (right swipe) */}
        <motion.div
          style={{ opacity: completeOpacity, scale: completeScale }}
          className="flex items-center gap-2 text-green-400"
        >
          <CheckCircle2 className="w-6 h-6" strokeWidth={2.5} />
          <span className="text-sm font-semibold">{task.isCompleted ? 'Undo' : 'Done!'}</span>
        </motion.div>

        {/* Delete (left swipe) */}
        <motion.div
          style={{ opacity: deleteOpacity, scale: deleteScale }}
          className="flex items-center gap-2 text-red-400 ml-auto"
        >
          <span className="text-sm font-semibold">Delete</span>
          <Trash2 className="w-6 h-6" strokeWidth={2.5} />
        </motion.div>
      </div>

      {/* Background color */}
      <motion.div className="absolute inset-0 rounded-2xl" style={{ backgroundColor: bgColorComplete }} />
      <motion.div className="absolute inset-0 rounded-2xl" style={{ backgroundColor: bgColorDelete }} />

      {/* Main card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -MAX_SWIPE, right: MAX_SWIPE }}
        dragElastic={{ left: 0.2, right: 0.2 }}
        style={{ x, opacity: completedOpacity }}
        animate={controls}
        onDragStart={() => { isDraggingSwipe.current = true; }}
        onDragEnd={handleDragEnd}
        className={cn(
          'relative flex items-center gap-3 px-4 py-3.5 rounded-2xl',
          'bg-[#141417] border border-white/6',
          'cursor-grab active:cursor-grabbing select-none',
          isDragging && 'shadow-2xl scale-[1.02] z-50',
        )}
        whileTap={{ scale: isDragging ? 1.02 : 1 }}
      >
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="touch-none text-white/15 hover:text-white/30 transition-colors flex-shrink-0 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Emoji + color dot */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 relative"
          style={{ background: `${task.color}18`, border: `1px solid ${task.color}30` }}
        >
          {task.emoji}
          {task.isCompleted && (
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium leading-tight truncate',
            task.isCompleted ? 'line-through text-white/30' : 'text-white/90'
          )}>
            {task.title}
          </p>
          {task.scheduledTime && (
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-white/25" />
              <span className="text-[11px] text-white/35">{formatTime(task.scheduledTime)}</span>
            </div>
          )}
        </div>

        {/* Color accent + notes */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {task.notes && (
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/6 transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Left color bar */}
        <div
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
          style={{ backgroundColor: task.color }}
        />
      </motion.div>
    </div>
  );
}
