function ProgressItem({ label, value, total, accent }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-2 rounded-full ${accent || 'bg-emerald-400'}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 dark:text-slate-500">
        {value} / {total}
      </span>
    </div>
  );
}

export default function ProgressIndicators({ title, indicators }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {(indicators ?? []).map((indicator) => (
          <ProgressItem key={indicator.label} {...indicator} />
        ))}
      </div>
      {!indicators?.length ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Нет показателей</p>
      ) : null}
    </section>
  );
}
