'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User, Bell, Shield, LogOut, ChevronRight,
  Loader2, Check, Moon, Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2).max(50),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'app'>('account');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ enabled: false, reminderMinutes: 10, morningDigest: true });
  const [isSavingNotif, setIsSavingNotif] = useState(false);
  const [notifSupported, setNotifSupported] = useState(false);

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: session?.user?.name ?? '' } });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    setNotifSupported('Notification' in window && 'serviceWorker' in navigator);
    loadNotifPrefs();
  }, []);

  useEffect(() => {
    if (session?.user?.name) {
      profileForm.reset({ name: session.user.name });
    }
  }, [session]);

  const loadNotifPrefs = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifPrefs(data.prefs);
      }
    } catch { /* silent */ }
  };

  const saveProfile = async (data: { name: string }) => {
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await update({ name: data.name });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const savePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    setIsSavingPassword(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Password changed!');
      passwordForm.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const toggleNotifications = async () => {
    if (!notifSupported) return toast.error('Notifications not supported');

    if (!notifPrefs.enabled) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        return;
      }
    }

    const newEnabled = !notifPrefs.enabled;
    setNotifPrefs((p) => ({ ...p, enabled: newEnabled }));
    setIsSavingNotif(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newEnabled }),
      });
      toast.success(newEnabled ? 'Notifications enabled!' : 'Notifications disabled');
    } finally {
      setIsSavingNotif(false);
    }
  };

  const saveNotifPref = async (key: string, value: unknown) => {
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
    } catch { /* silent */ }
  };

  const TABS = [
    { key: 'account', icon: User, label: 'Account' },
    { key: 'notifications', icon: Bell, label: 'Notifications' },
    { key: 'app', icon: Smartphone, label: 'App' },
  ] as const;

  return (
    <div className="h-full overflow-y-auto with-bottom-nav">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#09090c]/90 backdrop-blur-xl border-b border-white/4 safe-top">
        <div className="px-4 pt-4 pb-3 max-w-xl mx-auto">
          <h1 className="text-lg font-bold mb-3">Settings</h1>
          {/* Tab bar */}
          <div className="flex gap-1 bg-white/4 rounded-xl p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all',
                  activeTab === tab.key ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/60'
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 max-w-xl mx-auto space-y-4">

        {/* Account tab */}
        {activeTab === 'account' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* User card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/15 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white">
                {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-semibold">{session?.user?.name}</p>
                <p className="text-xs text-white/40">{session?.user?.email}</p>
              </div>
            </div>

            {/* Edit profile */}
            <div className="p-4 rounded-2xl bg-white/3 border border-white/6 space-y-3">
              <h3 className="text-sm font-semibold">Edit Profile</h3>
              <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-3">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Display name</label>
                  <input
                    {...profileForm.register('name')}
                    className="input-base w-full px-3 py-2.5 text-sm"
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-red-400 text-xs mt-1">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-sm font-medium px-4 py-2 rounded-xl hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {isSavingProfile ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : <><Check className="w-3.5 h-3.5" /> Save name</>}
                </button>
              </form>
            </div>

            {/* Change password */}
            <div className="p-4 rounded-2xl bg-white/3 border border-white/6 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-white/40" />
                <h3 className="text-sm font-semibold">Change Password</h3>
              </div>
              <form onSubmit={passwordForm.handleSubmit(savePassword as Parameters<typeof passwordForm.handleSubmit>[0])} className="space-y-3">
                {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
                  <div key={field}>
                    <label className="text-xs text-white/40 mb-1.5 block capitalize">
                      {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </label>
                    <input
                      {...passwordForm.register(field)}
                      type="password"
                      placeholder="••••••••"
                      className="input-base w-full px-3 py-2.5 text-sm"
                    />
                    {passwordForm.formState.errors[field] && (
                      <p className="text-red-400 text-xs mt-1">{String(passwordForm.formState.errors[field]?.message ?? '')}</p>
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-sm font-medium px-4 py-2 rounded-xl hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {isSavingPassword ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...</> : 'Update password'}
                </button>
              </form>
            </div>

            {/* Sign out */}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/3 border border-white/6 hover:bg-red-500/8 hover:border-red-500/20 transition-all group"
            >
              <LogOut className="w-4 h-4 text-white/30 group-hover:text-red-400 transition-colors" />
              <span className="text-sm text-white/50 group-hover:text-red-400 transition-colors">Sign out</span>
            </button>
          </motion.div>
        )}

        {/* Notifications tab */}
        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/3 border border-white/6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Push notifications</p>
                  <p className="text-xs text-white/35 mt-0.5">Get reminded when tasks are due</p>
                </div>
                <button
                  onClick={toggleNotifications}
                  disabled={isSavingNotif || !notifSupported}
                  className={cn(
                    'w-12 h-6 rounded-full transition-all relative disabled:opacity-40',
                    notifPrefs.enabled ? 'bg-indigo-500' : 'bg-white/10'
                  )}
                >
                  <div className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                    notifPrefs.enabled ? 'left-7' : 'left-1'
                  )} />
                </button>
              </div>

              {!notifSupported && (
                <p className="text-xs text-yellow-400/70 bg-yellow-500/8 border border-yellow-500/15 rounded-xl px-3 py-2">
                  Notifications require a modern browser with service worker support.
                </p>
              )}
            </div>

            {notifPrefs.enabled && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-white/3 border border-white/6 space-y-4">
                <h3 className="text-sm font-semibold">Reminder timing</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Minutes before task</span>
                  <select
                    value={notifPrefs.reminderMinutes}
                    onChange={(e) => saveNotifPref('reminderMinutes', Number(e.target.value))}
                    className="input-base px-3 py-1.5 text-sm"
                  >
                    {[0, 5, 10, 15, 30].map((m) => (
                      <option key={m} value={m}>{m === 0 ? 'At time' : `${m} min before`}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <p className="text-sm text-white/70">Morning digest</p>
                    <p className="text-xs text-white/30">Daily summary at 8 AM</p>
                  </div>
                  <button
                    onClick={() => saveNotifPref('morningDigest', !notifPrefs.morningDigest)}
                    className={cn(
                      'w-11 h-6 rounded-full transition-all relative',
                      notifPrefs.morningDigest ? 'bg-indigo-500' : 'bg-white/10'
                    )}
                  >
                    <div className={cn(
                      'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                      notifPrefs.morningDigest ? 'left-6' : 'left-1'
                    )} />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* App tab */}
        {activeTab === 'app' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/3 border border-white/6 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold">Appearance</h3>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-white/60">Dark mode</span>
                <div className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs px-2.5 py-1 rounded-lg font-medium">
                  Always on
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/3 border border-white/6 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                Add to Home Screen
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Install PulsePath on your phone for a native app experience. Open your browser menu and tap &ldquo;Add to Home Screen&rdquo; or &ldquo;Install App&rdquo;.
              </p>
              <div className="space-y-2">
                {[
                  { label: 'iPhone / Safari', steps: 'Tap Share → Add to Home Screen' },
                  { label: 'Android / Chrome', steps: 'Tap ⋮ menu → Add to Home Screen' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white/70">{item.label}</p>
                      <p className="text-[11px] text-white/35">{item.steps}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/3 border border-white/6">
              <h3 className="text-sm font-semibold mb-3">About</h3>
              <div className="space-y-2 text-xs text-white/35">
                <div className="flex justify-between"><span>Version</span><span className="text-white/50">1.0.0</span></div>
                <div className="flex justify-between"><span>Data retention</span><span className="text-white/50">7 days history</span></div>
                <div className="flex justify-between"><span>Built with</span><span className="text-white/50">Next.js · Prisma · Neon</span></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
