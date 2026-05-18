export function TaskSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[80, 60, 90, 55, 70].map((w, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <div className="skel" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skel" style={{ height: 12, width: `${w}%` }} />
            <div className="skel" style={{ height: 10, width: 44 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skel" style={{ height: 76, borderRadius: 12 }} />
      ))}
    </div>
  );
}
