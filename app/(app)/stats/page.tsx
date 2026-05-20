'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Flame, Trophy, CheckCircle2, Target } from 'lucide-react';
import toast from 'react-hot-toast';

interface DayStats { date:string; total:number; completed:number; percentage:number; }
interface StatsData {
  streak:{ current:number; longest:number };
  todayProgress:{ completed:number; total:number; percentage:number };
  dayStats: DayStats[];
  topTasks: Array<{ task?:{ id:string; title:string; emoji:string; color:string }; completions:number }>;
  totalTasks:number;
}

export default function StatsPage() {
  const [stats, setStats]   = useState<StatsData | null>(null);
  const [loading, setLoad]  = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  const load = useCallback(async () => {
    try { const r = await fetch('/api/stats'); if (!r.ok) throw new Error(); setStats(await r.json()); }
    catch { toast.error('Failed to load stats'); }
    finally { setLoad(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="page">
      <div className="page-header" style={{ background:'rgba(242,237,228,0.92)', backdropFilter:'blur(16px)', borderBottom:'0.5px solid var(--border-2)' }}>
        <div style={{ padding:'14px 20px 14px', maxWidth:560, margin:'0 auto' }}>
          <p className="label" style={{ marginBottom:3 }}>Overview</p>
          <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.03em', color:'var(--tx-1)' }}>Statistics</h1>
        </div>
      </div>

      <div className="page-body">
        <div style={{ maxWidth:560, margin:'0 auto', padding:'16px 16px', display:'flex', flexDirection:'column', gap:14 }}>
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[...Array(4)].map((_,i) => <div key={i} className="skel" style={{ height:80, borderRadius:14 }} />)}
            </div>
          ) : !stats ? null : (
            <>
              {/* Stat cards */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { icon:Flame,        label:'Current streak', value:`${stats.streak.current}d`,  color:'var(--amber)' },
                  { icon:Trophy,       label:'Best streak',    value:`${stats.streak.longest}d`,  color:'var(--blue)' },
                  { icon:CheckCircle2, label:'Done today',     value:`${stats.todayProgress.completed}/${stats.todayProgress.total}`, color:'var(--green)' },
                  { icon:Target,       label:'7-day avg',      value:`${Math.round(stats.dayStats.reduce((a,d)=>a+d.percentage,0)/Math.max(stats.dayStats.length,1))}%`, color:'var(--ac)' },
                ].map((c,i) => (
                  <motion.div key={i} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                    className="glass-card" style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                      <c.icon size={12} style={{ color:c.color }} strokeWidth={2} />
                      <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--tx-3)' }}>{c.label}</span>
                    </div>
                    <p style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.03em', fontFamily:'JetBrains Mono,monospace', color:c.color }}>{c.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Bar chart */}
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
                className="glass-card" style={{ padding:'18px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                  <p style={{ fontSize:13, fontWeight:600, letterSpacing:'-0.01em', color:'var(--tx-1)' }}>7-Day Completion</p>
                  <p style={{ fontSize:10, color:'var(--tx-3)', fontWeight:500 }}>% complete</p>
                </div>
                <div style={{ display:'flex', gap:5, alignItems:'flex-end', overflow:'hidden' }}>
                  {stats.dayStats.map((day, i) => {
                    const isTd  = day.date === today;
                    const BAR_MAX = 62, TRACK_H = 76;
                    const barH = day.percentage > 0 ? Math.max(Math.round((day.percentage/100)*BAR_MAX), 4) : 2;
                    const col  = day.percentage>=100?'var(--green)':day.percentage>=60?'var(--ac)':day.percentage>0?'var(--amber)':'rgba(160,120,80,0.18)';
                    return (
                      <div key={day.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                        <div style={{ width:'100%', height:TRACK_H, display:'flex', flexDirection:'column', justifyContent:'flex-end', alignItems:'center', gap:3, overflow:'hidden', flexShrink:0 }}>
                          <span style={{ fontSize:9, fontFamily:'JetBrains Mono,monospace', fontWeight:600, height:12, lineHeight:'12px', color:day.percentage>0?col:'transparent' }}>
                            {day.percentage||''}
                          </span>
                          <motion.div initial={{ height:0 }} animate={{ height:barH }}
                            transition={{ delay:0.12+i*0.05, duration:0.45, ease:[0.4,0,0.2,1] }}
                            style={{ width:'100%', borderRadius:'4px 4px 3px 3px', flexShrink:0, background:isTd?col:`${col === 'rgba(160,120,80,0.18)' ? col : col+'60'}`, boxShadow:isTd&&day.percentage>0?`0 0 8px ${col}50`:'none' }} />
                        </div>
                        <span style={{ fontSize:10, fontWeight:600, color:isTd?'var(--tx-1)':'var(--tx-3)', letterSpacing:'-0.01em' }}>
                          {isTd ? 'Today' : format(parseISO(day.date),'EEE')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Streak calendar */}
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
                className="glass-card" style={{ padding:'18px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'var(--amber-dim)', border:'0.5px solid rgba(200,124,16,0.22)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Flame size={16} color="var(--amber)" />
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, letterSpacing:'-0.01em', color:'var(--tx-1)' }}>Streak</p>
                    <p style={{ fontSize:11, color:'var(--tx-3)', marginTop:1 }}>
                      {stats.streak.current>0 ? `${stats.streak.current}-day streak 🔥` : 'Complete all tasks to start a streak'}
                    </p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {stats.dayStats.map((day,i) => {
                    const isTd    = day.date === today;
                    const perfect = day.percentage === 100;
                    const partial = day.percentage>0 && day.percentage<100;
                    return (
                      <div key={day.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                        <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                          transition={{ delay:0.1+i*0.05, type:'spring', stiffness:500 }}
                          style={{
                            width:'100%', aspectRatio:'1', borderRadius:9,
                            background: perfect?'rgba(200,124,16,0.12)':partial?'rgba(200,124,16,0.06)':'rgba(160,120,80,0.06)',
                            border:`0.5px solid ${perfect?'rgba(200,124,16,0.28)':partial?'rgba(200,124,16,0.16)':'var(--border)'}`,
                            display:'flex', alignItems:'center', justifyContent:'center', fontSize:14,
                            boxShadow: perfect&&isTd?'0 0 12px rgba(200,124,16,0.30)':'none',
                          }}>{perfect?'🔥':partial?'✦':''}</motion.div>
                        <span style={{ fontSize:9, fontWeight:600, color:isTd?'var(--tx-2)':'var(--tx-4)', letterSpacing:'0.03em' }}>
                          {isTd?'TOD':format(parseISO(day.date),'EEE').slice(0,3).toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display:'flex', marginTop:16, paddingTop:14, borderTop:'0.5px solid var(--border)' }}>
                  {[{l:'Current',v:stats.streak.current,c:'var(--amber)'},{l:'Best',v:stats.streak.longest,c:'var(--blue)'},{l:'Perfect days',v:stats.dayStats.filter(d=>d.percentage===100).length,c:'var(--green)'}]
                    .map((item,i) => (
                      <div key={i} style={{ flex:1, textAlign:'center' }}>
                        <p style={{ fontSize:22, fontWeight:700, fontFamily:'JetBrains Mono,monospace', color:item.c, letterSpacing:'-0.03em' }}>{item.v}</p>
                        <p style={{ fontSize:10, color:'var(--tx-3)', fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase', marginTop:2 }}>{item.l}</p>
                      </div>
                    ))}
                </div>
              </motion.div>

              {/* Top tasks */}
              {stats.topTasks.length>0 && (
                <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
                  className="glass-card" style={{ padding:'18px 16px' }}>
                  <p style={{ fontSize:13, fontWeight:600, letterSpacing:'-0.01em', color:'var(--tx-1)', marginBottom:14 }}>Most consistent</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {stats.topTasks.map(({ task, completions }, i) => {
                      if (!task) return null;
                      const max = stats.topTasks[0]?.completions ?? 1;
                      return (
                        <div key={task.id}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                              <span style={{ fontSize:15 }}>{task.emoji}</span>
                              <span style={{ fontSize:13, color:'var(--tx-2)', fontWeight:500 }}>{task.title}</span>
                            </div>
                            <span style={{ fontSize:11, fontFamily:'JetBrains Mono,monospace', color:'var(--tx-3)' }}>{completions}/7</span>
                          </div>
                          <div className="progress-track">
                            <motion.div initial={{ width:0 }} animate={{ width:`${(completions/max)*100}%` }}
                              transition={{ delay:0.3+i*0.08, duration:0.5 }}
                              style={{ height:'100%', borderRadius:100, background:task.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Today ring */}
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
                className="glass-card" style={{ padding:'18px 16px', display:'flex', alignItems:'center', gap:20 }}>
                <svg width="72" height="72" style={{ flexShrink:0 }}>
                  <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(160,120,80,0.14)" strokeWidth="6" />
                  <motion.circle cx="36" cy="36" r="28" fill="none" stroke="var(--ac)" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2*Math.PI*28}`}
                    initial={{ strokeDashoffset: 2*Math.PI*28 }}
                    animate={{ strokeDashoffset: 2*Math.PI*28*(1-stats.todayProgress.percentage/100) }}
                    transition={{ duration:0.9, delay:0.6, ease:[0.4,0,0.2,1] }}
                    style={{ transformOrigin:'center', transform:'rotate(-90deg)' }}
                  />
                </svg>
                <div>
                  <p style={{ fontSize:30, fontWeight:700, fontFamily:'JetBrains Mono,monospace', letterSpacing:'-0.03em', lineHeight:1, color:'var(--tx-1)' }}>
                    {stats.todayProgress.percentage}<span style={{ fontSize:16, color:'var(--tx-3)', fontWeight:500 }}>%</span>
                  </p>
                  <p style={{ fontSize:13, color:'var(--tx-2)', marginTop:5, fontWeight:500 }}>Today&apos;s completion</p>
                  <p style={{ fontSize:11, color:'var(--tx-3)', marginTop:1 }}>
                    {stats.todayProgress.completed} of {stats.todayProgress.total} tasks done
                  </p>
                </div>
              </motion.div>
            </>
          )}
          <div className="with-nav" />
        </div>
      </div>
    </div>
  );
}
