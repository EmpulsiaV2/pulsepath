'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { User, Bell, Smartphone, LogOut, ChevronRight, Loader2, Check, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'account' | 'notifications' | 'app';

const TABS = [
  { key: 'account' as Tab,       icon: User,       label: 'Account'       },
  { key: 'notifications' as Tab, icon: Bell,       label: 'Notifications' },
  { key: 'app' as Tab,           icon: Smartphone, label: 'App'           },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [tab, setTab]   = useState<Tab>('account');
  const [sN, setSN]     = useState(false);
  const [sP, setSP]     = useState(false);
  const [notif, setNotif] = useState({ enabled:false, reminderMinutes:10, morningDigest:true });
  const [ns, setNs]     = useState(false);

  const nf = useForm<{ name:string }>({ defaultValues:{ name:'' } });
  const pf = useForm<{ current:string; next:string; confirm:string }>();

  useEffect(() => {
    setNs('Notification' in window);
    fetch('/api/notifications').then(r => r.ok && r.json()).then(d => d && setNotif(d.prefs)).catch(()=>{});
  }, []);

  useEffect(() => {
    if (session?.user?.name) nf.reset({ name: session.user.name });
  }, [session?.user?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveName = async (d: { name:string }) => {
    setSN(true);
    try {
      const r = await fetch('/api/account', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name:d.name }) });
      if (!r.ok) throw new Error((await r.json()).error);
      await update({ name:d.name }); toast.success('Name updated');
    } catch(e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setSN(false); }
  };

  const savePwd = async (d: { current:string; next:string; confirm:string }) => {
    if (d.next !== d.confirm) { toast.error("Passwords don't match"); return; }
    if (d.next.length < 8)    { toast.error('Min 8 characters'); return; }
    setSP(true);
    try {
      const r = await fetch('/api/account', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ currentPassword:d.current, newPassword:d.next }) });
      if (!r.ok) throw new Error((await r.json()).error);
      toast.success('Password changed'); pf.reset();
    } catch(e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setSP(false); }
  };

  const toggleNotif = async () => {
    if (!ns) { toast.error('Not supported in this browser'); return; }
    if (!notif.enabled) {
      const p = await Notification.requestPermission();
      if (p !== 'granted') { toast.error('Permission denied'); return; }
    }
    const val = !notif.enabled;
    setNotif(n => ({ ...n, enabled:val }));
    await fetch('/api/notifications', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ enabled:val }) });
    toast.success(val ? 'Notifications on' : 'Notifications off');
  };

  const patchNotif = async (key: string, value: unknown) => {
    setNotif(n => ({ ...n, [key]: value }));
    await fetch('/api/notifications', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ [key]:value }) });
  };

  const Row = ({ children }: { children: React.ReactNode }) => (
    <div style={{ padding:'13px 16px', borderBottom:'0.5px solid var(--border)' }}>{children}</div>
  );

  return (
    <div className="page">
      <div className="page-header" style={{ background:'rgba(242,237,228,0.92)', backdropFilter:'blur(16px)', borderBottom:'0.5px solid var(--border-2)' }}>
        <div style={{ padding:'14px 20px 0', maxWidth:560, margin:'0 auto' }}>
          <p className="label" style={{ marginBottom:3 }}>Configure</p>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', color:'var(--tx-1)', marginBottom:14 }}>Settings</h1>
          <div style={{ display:'flex', gap:0, borderBottom:'0.5px solid var(--border-2)' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display:'flex', alignItems:'center', gap:6, padding:'8px 14px 10px',
                background:'transparent', border:'none', cursor:'pointer',
                fontFamily:'inherit', fontSize:13, fontWeight:600, letterSpacing:'-0.01em',
                color: tab===t.key ? 'var(--tx-1)' : 'var(--tx-3)',
                borderBottom:`2px solid ${tab===t.key ? 'var(--ac)' : 'transparent'}`,
                transition:'color 0.15s, border-color 0.15s',
              }}>
                <t.icon size={13} strokeWidth={2} />{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-body">
        <div style={{ maxWidth:560, margin:'0 auto', padding:'16px 16px', display:'flex', flexDirection:'column', gap:14 }}>

          {tab === 'account' && (
            <motion.div key="acc" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {/* User card */}
              <div className="glass-card" style={{ padding:'16px', display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:14, flexShrink:0, background:'var(--ac-dim)', border:'0.5px solid var(--ac-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'var(--ac-text)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.7)' }}>
                  {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p style={{ fontSize:15, fontWeight:600, letterSpacing:'-0.01em', color:'var(--tx-1)' }}>{session?.user?.name}</p>
                  <p style={{ fontSize:12, color:'var(--tx-3)', marginTop:2 }}>{session?.user?.email}</p>
                </div>
              </div>

              {/* Name */}
              <div className="glass-card" style={{ padding:'16px', display:'flex', flexDirection:'column', gap:10 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--tx-1)', letterSpacing:'-0.01em' }}>Display name</p>
                <form onSubmit={nf.handleSubmit(saveName)} style={{ display:'flex', gap:8 }}>
                  <input {...nf.register('name', { required:true, minLength:2 })} className="field" style={{ flex:1 }} />
                  <button type="submit" disabled={sN} className="btn btn-accent" style={{ padding:'11px 14px' }}>
                    {sN ? <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }} /> : <Check size={13} />}
                  </button>
                </form>
              </div>

              {/* Password */}
              <div className="glass-card" style={{ overflow:'hidden' }}>
                <div style={{ padding:'14px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', alignItems:'center', gap:7 }}>
                  <Shield size={13} color="var(--tx-3)" />
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--tx-1)', letterSpacing:'-0.01em' }}>Change password</p>
                </div>
                <div style={{ padding:'14px 16px' }}>
                  <form onSubmit={pf.handleSubmit(savePwd)} style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {(['current','next','confirm'] as const).map(f => (
                      <input key={f} {...pf.register(f)} type="password"
                        placeholder={{ current:'Current password', next:'New password (min 8)', confirm:'Confirm new password' }[f]}
                        className="field" />
                    ))}
                    <button type="submit" disabled={sP} className="btn btn-accent btn-full" style={{ marginTop:4 }}>
                      {sP ? <><Loader2 size={13} style={{ animation:'spin 1s linear infinite' }} /> Updating…</> : 'Update password'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Sign out */}
              <button onClick={() => signOut({ callbackUrl:'/login' })} className="glass-card"
                style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'14px 16px', cursor:'pointer', fontFamily:'inherit', textAlign:'left', color:'var(--tx-2)', fontSize:14, fontWeight:500, border:'0.5px solid var(--border)', background:'rgba(255,252,247,0.85)', transition:'all 0.15s' }}>
                <LogOut size={15} color="var(--red)" /><span>Sign out</span>
              </button>
            </motion.div>
          )}

          {tab === 'notifications' && (
            <motion.div key="notif" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
              <div className="glass-card" style={{ overflow:'hidden' }}>
                <Row>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <p style={{ fontSize:14, fontWeight:600, color:'var(--tx-1)', letterSpacing:'-0.01em' }}>Push notifications</p>
                      <p style={{ fontSize:12, color:'var(--tx-3)', marginTop:2 }}>Reminders when tasks are due</p>
                    </div>
                    <button onClick={toggleNotif} disabled={!ns} className="toggle" data-on={String(notif.enabled)} />
                  </div>
                </Row>
                {notif.enabled && <>
                  <Row>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <p style={{ fontSize:13, color:'var(--tx-2)', fontWeight:500 }}>Remind me before</p>
                      <select value={notif.reminderMinutes} onChange={e => patchNotif('reminderMinutes', Number(e.target.value))}
                        style={{ background:'rgba(160,120,80,0.07)', border:'0.5px solid var(--border-2)', borderRadius:8, color:'var(--tx-1)', fontFamily:'inherit', fontSize:13, padding:'6px 10px', outline:'none' }}>
                        {[0,5,10,15,30].map(m => <option key={m} value={m}>{m===0?'At task time':`${m} min before`}</option>)}
                      </select>
                    </div>
                  </Row>
                  <div style={{ padding:'13px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <p style={{ fontSize:13, color:'var(--tx-2)', fontWeight:500 }}>Morning digest</p>
                        <p style={{ fontSize:11, color:'var(--tx-3)', marginTop:1 }}>Daily summary at 8 AM</p>
                      </div>
                      <button onClick={() => patchNotif('morningDigest', !notif.morningDigest)} className="toggle" data-on={String(notif.morningDigest)} />
                    </div>
                  </div>
                </>}
              </div>
              {!ns && <p style={{ fontSize:12, color:'var(--tx-3)', padding:'10px 14px', background:'rgba(160,120,80,0.06)', border:'0.5px solid var(--border)', borderRadius:10, marginTop:8 }}>Notifications require a modern browser with service worker support.</p>}
            </motion.div>
          )}

          {tab === 'app' && (
            <motion.div key="app" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div className="glass-card" style={{ overflow:'hidden' }}>
                <div style={{ padding:'14px 16px', borderBottom:'0.5px solid var(--border)' }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--tx-1)', letterSpacing:'-0.01em', marginBottom:4 }}>Add to Home Screen</p>
                  <p style={{ fontSize:12, color:'var(--tx-3)', lineHeight:1.6 }}>Install PulsePath for a native app experience — no browser UI.</p>
                </div>
                {[
                  { os:'iPhone · Safari',  step:'Tap the Share button → Add to Home Screen' },
                  { os:'Android · Chrome', step:'Tap the ⋮ menu → Add to Home Screen' },
                ].map(item => (
                  <div key={item.os} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderBottom:'0.5px solid var(--border)' }}>
                    <ChevronRight size={12} color="var(--ac)" />
                    <div>
                      <p style={{ fontSize:12, fontWeight:600, color:'var(--tx-2)' }}>{item.os}</p>
                      <p style={{ fontSize:11, color:'var(--tx-3)', marginTop:1 }}>{item.step}</p>
                    </div>
                  </div>
                ))}
                <div style={{ padding:'12px 16px' }}>
                  <p style={{ fontSize:11, color:'var(--tx-3)' }}>Opens full-screen when launched from your home screen.</p>
                </div>
              </div>
              <div className="glass-card" style={{ padding:'16px' }}>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--tx-1)', letterSpacing:'-0.01em', marginBottom:12 }}>About</p>
                {[['Version','1.0.0'],['History','7 days'],['Stack','Next.js · Prisma · Neon']].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 0' }}>
                    <span style={{ fontSize:12, color:'var(--tx-3)' }}>{k}</span>
                    <span style={{ fontSize:12, color:'var(--tx-2)', fontWeight:500, fontFamily:'JetBrains Mono,monospace' }}>{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="with-nav" />
        </div>
      </div>
    </div>
  );
}
