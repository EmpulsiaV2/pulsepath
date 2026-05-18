'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { User, Bell, Smartphone, LogOut, ChevronRight, Loader2, Check, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'account',       icon: User,       label: 'Account'       },
  { key: 'notifications', icon: Bell,       label: 'Notifications' },
  { key: 'app',           icon: Smartphone, label: 'App'           },
] as const;

type Tab = typeof TABS[number]['key'];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [tab, setTab]             = useState<Tab>('account');
  const [savingName, setSavingN]  = useState(false);
  const [savingPwd, setSavingP]   = useState(false);
  const [notif, setNotif]         = useState({ enabled: false, reminderMinutes: 10, morningDigest: true });
  const [notifSupported, setNS]   = useState(false);

  const nameForm = useForm<{ name: string }>({ defaultValues: { name: '' } });
  const pwdForm  = useForm<{ current: string; next: string; confirm: string }>();

  useEffect(() => {
    setNS('Notification' in window);
    loadNotif();
  }, []);

  useEffect(() => {
    if (session?.user?.name) nameForm.reset({ name: session.user.name });
  }, [session?.user?.name]);

  const loadNotif = async () => {
    try {
      const r = await fetch('/api/notifications');
      if (r.ok) { const d = await r.json(); setNotif(d.prefs); }
    } catch { /* silent */ }
  };

  const saveName = async (d: { name: string }) => {
    setSavingN(true);
    try {
      const r = await fetch('/api/account', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: d.name }) });
      if (!r.ok) throw new Error((await r.json()).error);
      await update({ name: d.name });
      toast.success('Name updated');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setSavingN(false); }
  };

  const savePassword = async (d: { current: string; next: string; confirm: string }) => {
    if (d.next !== d.confirm) { toast.error("Passwords don't match"); return; }
    if (d.next.length < 8)    { toast.error('Min 8 characters'); return; }
    setSavingP(true);
    try {
      const r = await fetch('/api/account', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: d.current, newPassword: d.next }) });
      if (!r.ok) throw new Error((await r.json()).error);
      toast.success('Password changed');
      pwdForm.reset();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setSavingP(false); }
  };

  const toggleNotif = async () => {
    if (!notifSupported) return toast.error('Not supported in this browser');
    if (!notif.enabled) {
      const p = await Notification.requestPermission();
      if (p !== 'granted') { toast.error('Permission denied'); return; }
    }
    const val = !notif.enabled;
    setNotif(n => ({ ...n, enabled: val }));
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: val }) });
    toast.success(val ? 'Notifications on' : 'Notifications off');
  };

  const patchNotif = async (key: string, value: unknown) => {
    setNotif(n => ({ ...n, [key]: value }));
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [key]: value }) });
  };

  return (
    <div className="page">
      <div className="page-header" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <div style={{ padding: '16px 20px 0', maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--tx-3)', marginBottom: 3 }}>Configure</p>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 14 }}>Settings</h1>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: -1 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px 10px',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  color: tab === t.key ? 'var(--tx-1)' : 'var(--tx-3)',
                  borderBottom: `2px solid ${tab === t.key ? 'var(--accent)' : 'transparent'}`,
                  transition: 'color 0.15s, border-color 0.15s',
                  letterSpacing: '-0.01em',
                }}
              >
                <t.icon size={13} strokeWidth={2} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {tab === 'account' && (
            <motion.div key="account" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* User pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: 'var(--accent-text)',
                }}>
                  {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>{session?.user?.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--tx-3)', marginTop: 1 }}>{session?.user?.email}</p>
                </div>
              </div>

              {/* Name */}
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px 0' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 12 }}>Display name</p>
                  <form onSubmit={nameForm.handleSubmit(saveName)} style={{ display: 'flex', gap: 8, paddingBottom: 14 }}>
                    <input {...nameForm.register('name', { required: true, minLength: 2 })} className="field" style={{ flex: 1 }} />
                    <button type="submit" disabled={savingName} className="btn btn-accent" style={{ padding: '11px 14px' }}>
                      {savingName ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
                    </button>
                  </form>
                </div>
              </div>

              {/* Password */}
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <Shield size={13} color="var(--tx-3)" />
                  <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>Change password</p>
                </div>
                <form onSubmit={pwdForm.handleSubmit(savePassword)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(['current', 'next', 'confirm'] as const).map((f) => (
                    <input
                      key={f}
                      {...pwdForm.register(f)}
                      type="password"
                      placeholder={{ current: 'Current password', next: 'New password (min 8)', confirm: 'Confirm new password' }[f]}
                      className="field"
                    />
                  ))}
                  <button type="submit" disabled={savingPwd} className="btn btn-accent btn-full" style={{ marginTop: 4 }}>
                    {savingPwd ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Updating…</> : 'Update password'}
                  </button>
                </form>
              </div>

              {/* Sign out */}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px',
                  background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'left',
                  color: 'var(--tx-2)', fontSize: 14, fontWeight: 500,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(248,113,113,0.2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--tx-2)'; }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </motion.div>
          )}

          {tab === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: notif.enabled ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Push notifications</p>
                    <p style={{ fontSize: 12, color: 'var(--tx-3)', marginTop: 2 }}>Reminders when tasks are due</p>
                  </div>
                  <button
                    onClick={toggleNotif}
                    disabled={!notifSupported}
                    className="toggle"
                    data-on={String(notif.enabled)}
                  />
                </div>
                {notif.enabled && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 13, color: 'var(--tx-2)', fontWeight: 500 }}>Remind me before</p>
                      <select
                        value={notif.reminderMinutes}
                        onChange={e => patchNotif('reminderMinutes', Number(e.target.value))}
                        style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 8, color: 'var(--tx-1)', fontFamily: 'inherit', fontSize: 13, padding: '6px 10px', outline: 'none' }}
                      >
                        {[0, 5, 10, 15, 30].map(m => <option key={m} value={m}>{m === 0 ? 'At task time' : `${m} min before`}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
                      <div>
                        <p style={{ fontSize: 13, color: 'var(--tx-2)', fontWeight: 500 }}>Morning digest</p>
                        <p style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 1 }}>Daily summary at 8 AM</p>
                      </div>
                      <button onClick={() => patchNotif('morningDigest', !notif.morningDigest)} className="toggle" data-on={String(notif.morningDigest)} />
                    </div>
                  </>
                )}
              </div>
              {!notifSupported && (
                <p style={{ fontSize: 12, color: 'var(--tx-3)', padding: '10px 14px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  Notifications require a modern browser with service worker support.
                </p>
              )}
            </motion.div>
          )}

          {tab === 'app' && (
            <motion.div key="app" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 4 }}>Add to Home Screen</p>
                  <p style={{ fontSize: 12, color: 'var(--tx-3)', lineHeight: 1.6 }}>
                    Open your browser menu and install PulsePath for a native app feel.
                  </p>
                </div>
                {[
                  { os: 'iPhone · Safari',  step: 'Share button → Add to Home Screen' },
                  { os: 'Android · Chrome', step: 'Menu (⋮) → Add to Home Screen' },
                ].map(item => (
                  <div key={item.os} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <ChevronRight size={12} color="var(--accent-text)" />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx-2)' }}>{item.os}</p>
                      <p style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 1 }}>{item.step}</p>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '12px 16px' }}>
                  <p style={{ fontSize: 11, color: 'var(--tx-3)' }}>Once added, the app opens full-screen with no browser UI.</p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, letterSpacing: '-0.01em' }}>About</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { k: 'Version',        v: '1.0.0' },
                    { k: 'History',        v: '7 days' },
                    { k: 'Stack',          v: 'Next.js · Prisma · Neon' },
                  ].map(row => (
                    <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--tx-3)' }}>{row.k}</span>
                      <span style={{ fontSize: 12, color: 'var(--tx-2)', fontWeight: 500, fontFamily: 'Geist Mono, monospace' }}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div className="with-nav" />
        </div>
      </div>
    </div>
  );
}
