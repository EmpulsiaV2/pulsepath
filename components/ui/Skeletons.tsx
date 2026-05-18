export function TaskSkeleton() {
  return (
    <div className="space-y-2.5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/3 border border-white/4">
          <div className="w-4 h-4 rounded shimmer" />
          <div className="w-10 h-10 rounded-xl shimmer flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 rounded-full shimmer" style={{ width: `${50 + i * 10}%` }} />
            <div className="h-2 rounded-full shimmer w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 rounded-2xl bg-white/3 border border-white/4 space-y-2">
          <div className="h-2.5 rounded-full shimmer w-3/4" />
          <div className="h-6 rounded-full shimmer w-1/2" />
        </div>
      ))}
    </div>
  );
}
