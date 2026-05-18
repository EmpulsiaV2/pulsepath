'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { TaskModal } from '@/components/tasks/TaskModal';
import { TaskSkeleton } from '@/components/ui/Skeletons';
import { formatTime, cn } from '@/lib/utils';
import type { Task, CreateTaskInput } from '@/types';

export default function TimelinePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error();
      const data = await res.json();
      // Sort by scheduled time
      const sorted = [...data.tasks].sort((a, b) => {
        if (!a.scheduledTime) return 1;
        if (!b.scheduledTime) return -1;
        return a.scheduledTime.localeCompare(b.scheduledTime);
      });
      setTasks(sorted);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleSave = async (data: CreateTaskInput) => {
    try {
      const url = editTask ? `/api/tasks/${editTask.id}` : '/api/tasks';
      const method = editTask ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(editTask ? 'Updated!' : 'Task added!');
      loadTasks();
    } catch {
      throw new Error('Failed to save');
    }
  };

  const handleComplete = async (id: string, completed: boolean) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, isCompleted: completed } : t));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      if (completed) toast.success('Completed! ✓');
    } catch {
      loadTasks();
    }
  };

  const currentTimeStr = format(currentTime, 'HH:mm');

  const getTaskStatus = (task: Task) => {
    if (task.isCompleted) return 'done';
    if (!task.scheduledTime) return 'pending';
    if (task.scheduledTime < currentTimeStr) return 'overdue';
    if (task.scheduledTime === currentTimeStr) return 'now';
    return 'upcoming';
  };

  const STATUS_STYLES = {
    done: 'border-green-500/20 bg-green-500/5',
    overdue: 'border-red-500/20 bg-red-500/5',
    now: 'border-indigo-500/30 bg-indigo-500/8',
    upcoming: 'border-white/6 bg-white/3',
    pending: 'border-white/6 bg-white/3',
  };

  return (
    <div className="h-full overflow-y-auto with-bottom-nav">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#09090c]/90 backdrop-blur-xl border-b border-white/4 safe-top">
        <div className="px-4 pt-4 pb-3 max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Timeline</h1>
            <p className="text-xs text-white/35">{format(new Date(), 'EEEE, MMMM d')}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/8 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-sm font-mono font-semibold">{format(currentTime, 'h:mm a')}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 max-w-xl mx-auto">
        {isLoading ? (
          <TaskSkeleton />
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">
            No tasks scheduled. Add some!
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[28px] top-4 bottom-4 w-px bg-gradient-to-b from-indigo-500/30 via-white/8 to-transparent" />

            <div className="space-y-2">
              {tasks.map((task, i) => {
                const status = getTaskStatus(task);
                const isNow = status === 'now';

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3"
                  >
                    {/* Timeline dot */}
                    <div className="relative flex-shrink-0 mt-3">
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                          status === 'done' ? 'bg-green-500/20 border-green-500/50' :
                          status === 'overdue' ? 'bg-red-500/20 border-red-500/50' :
                          isNow ? 'bg-indigo-500/30 border-indigo-500' :
                          'bg-white/5 border-white/15'
                        )}
                      >
                        {status === 'done' && (
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                        )}
                        {isNow && (
                          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Card */}
                    <button
                      className={cn(
                        'flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all',
                        STATUS_STYLES[status],
                        isNow && 'shadow-[0_0_16px_rgba(99,102,241,0.15)]'
                      )}
                      onClick={() => handleComplete(task.id, !task.isCompleted)}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: `${task.color}18`, border: `1px solid ${task.color}30` }}
                      >
                        {task.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          status === 'done' ? 'line-through text-white/25' : 'text-white/85'
                        )}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {task.scheduledTime && (
                            <span className={cn(
                              'text-[11px] font-mono',
                              isNow ? 'text-indigo-400 font-semibold' :
                              status === 'overdue' ? 'text-red-400' :
                              'text-white/30'
                            )}>
                              {formatTime(task.scheduledTime)}
                            </span>
                          )}
                          {isNow && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-md font-semibold">NOW</span>
                          )}
                          {status === 'overdue' && !task.isCompleted && (
                            <span className="text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded-md font-medium">OVERDUE</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className={cn(
                          'w-5 h-5 rounded-full border flex items-center justify-center transition-all',
                          status === 'done'
                            ? 'bg-green-500/20 border-green-500/50'
                            : 'border-white/15 hover:border-white/30'
                        )}>
                          {status === 'done' && (
                            <svg className="w-3 h-3 text-green-400" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => { setEditTask(null); setIsModalOpen(true); }}
          className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-dashed border-white/12 text-white/30 hover:text-white/60 hover:border-white/20 hover:bg-white/3 transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add task
        </motion.button>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditTask(null); }}
        onSave={handleSave}
        editTask={editTask}
      />
    </div>
  );
}
