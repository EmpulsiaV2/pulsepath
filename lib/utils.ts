import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getTimeOfDay(time: string): 'morning' | 'afternoon' | 'evening' {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

export function getDayName(date: string): string {
  const d = parseISO(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEE, MMM d');
}

export function getLast7Days(): string[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(format(d, 'yyyy-MM-dd'));
  }
  return days;
}

export function getCurrentDayAbbr(): string {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[new Date().getDay()];
}

export function getTimeUntil(scheduledTime: string): number {
  const [hours, minutes] = scheduledTime.split(':').map(Number);
  const now = new Date();
  const scheduled = new Date();
  scheduled.setHours(hours, minutes, 0, 0);
  return Math.floor((scheduled.getTime() - now.getTime()) / 1000 / 60);
}

export const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
  '#10b981', '#06b6d4', '#3b82f6', '#f59e0b',
  '#ef4444', '#84cc16',
];

export const EMOJIS = [
  '⚡', '🌅', '🏃', '💪', '🧘', '📚', '☕', '🥗',
  '💊', '🚿', '🦷', '🛏️', '🎯', '💻', '🎵', '🧠',
  '🌙', '⭐', '🔥', '💧', '🍎', '🚴', '✍️', '🧹',
  '📞', '🎮', '🌿', '❤️', '🏋️', '🧪',
];
