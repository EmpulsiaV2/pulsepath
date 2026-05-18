import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return format(d, 'yyyy-MM-dd');
  });
}

export function getCurrentDayAbbr(): string {
  return ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];
}

export const COLORS = [
  '#7b68ee', '#60a5fa', '#34d399', '#fb923c',
  '#f472b6', '#facc15', '#f87171', '#a78bfa',
  '#2dd4bf', '#e879f9',
];

export const EMOJIS = [
  '⚡','🌅','🏃','💪','🧘','📚','☕','🥗',
  '💊','🚿','🦷','🛏️','🎯','💻','🎵','🧠',
  '🌙','⭐','🔥','💧','🍎','🚴','✍️','🧹',
  '📞','🎮','🌿','❤️','🏋️','📖',
];
