'use client';

import { useEffect, useRef } from 'react';
import type { Task } from '@/types';

export function useTaskNotifications(tasks: Task[], enabled: boolean, reminderMinutes: number) {
  const scheduledRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || !tasks.length) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    tasks.forEach((task) => {
      if (!task.scheduledTime || task.isCompleted) return;

      const [h, m] = task.scheduledTime.split(':').map(Number);
      const scheduledAt = new Date();
      scheduledAt.setHours(h, m, 0, 0);

      const notifyAt = new Date(scheduledAt.getTime() - reminderMinutes * 60 * 1000);
      const msUntil = notifyAt.getTime() - Date.now();
      const key = `${task.id}-${task.scheduledTime}`;

      if (msUntil > 0 && !scheduledRef.current.has(key)) {
        scheduledRef.current.add(key);
        const timer = setTimeout(() => {
          const title = reminderMinutes === 0 ? `${task.emoji} ${task.title}` : `⏰ Coming up: ${task.title}`;
          const body = reminderMinutes === 0
            ? `It's time! Start your task now.`
            : `Due in ${reminderMinutes} minute${reminderMinutes === 1 ? '' : 's'}`;

          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(title, {
                body,
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                tag: task.id,
                data: { url: '/dashboard' },
              } as NotificationOptions);
            });
          } else {
            new Notification(title, { body, icon: '/icons/icon-192.png' });
          }

          scheduledRef.current.delete(key);
        }, msUntil);

        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [tasks, enabled, reminderMinutes]);
}
