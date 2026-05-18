import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  emoji: string;
  color: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  scheduledTime: string | null;
  isRecurring: boolean;
  recurDays: string[];
  order: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  completions?: TaskCompletion[];
  isCompleted?: boolean;
}

export interface TaskCompletion {
  id: string;
  userId: string;
  taskId: string;
  completedAt: string;
  date: string;
}

export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  updatedAt: string;
}

export interface NotificationPrefs {
  id: string;
  userId: string;
  enabled: boolean;
  reminderMinutes: number;
  morningDigest: boolean;
  pushSubscription: string | null;
}

export interface DayStats {
  date: string;
  total: number;
  completed: number;
  percentage: number;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface CreateTaskInput {
  title: string;
  emoji: string;
  color: string;
  timeOfDay: TimeOfDay;
  scheduledTime?: string;
  isRecurring: boolean;
  recurDays: string[];
  notes?: string;
}
