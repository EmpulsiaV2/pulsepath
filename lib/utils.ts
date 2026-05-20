import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function getTodayString() { return format(new Date(), 'yyyy-MM-dd'); }
export function getLast7Days() {
  return Array.from({ length:7 }, (_,i) => { const d=new Date(); d.setDate(d.getDate()-(6-i)); return format(d,'yyyy-MM-dd'); });
}
export function getCurrentDayAbbr() { return ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()]; }
export function formatTime(t: string): string {
  const [h,m] = t.split(':').map(Number);
  return `${h%12||12}:${m.toString().padStart(2,'0')} ${h>=12?'PM':'AM'}`;
}

export const COLORS = [
  '#D4612A','#C87C10','#4D7C2A','#2460A8',
  '#8B4E8A','#C03020','#B85A30','#5A8A72',
  '#7A6040','#3A6898',
];

export const EMOJIS = [
  '⚡','🌅','🏃','💪','🧘','📚','☕','🥗',
  '💊','🚿','🦷','🛏️','🎯','💻','🎵','🧠',
  '🌙','⭐','🔥','💧','🍎','🚴','✍️','🧹',
  '📞','🎮','🌿','❤️','🏋️','📖',
];
