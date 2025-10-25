function ActivityBar({ label, value, max }) {
  const height = max > 0 ? Math.max((value / max) * 100, 8) : 8;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-28 w-10 items-end rounded-full bg-slate-100 p-1 dark:bg-slate-800">
        <div
          className="w-full rounded-full bg-gradient-to-t from-sky-500 to-sky-400 transition-all"
          style={{ height: `${height}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

export default function ActivityChart({ title, description, data }) {
  const values = data?.map((item) => Number(item.value)) ?? [];
  const max = values.length ? Math.max(...values) : 0;

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="flex items-end justify-between gap-4 overflow-x-auto pb-2">
        {(data ?? []).map((item) => (
          <ActivityBar key={item.label} {...item} max={max} />
        ))}
        {!data?.length ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Нет данных активности</p>
        ) : null}
      </div>
    </section>
  );
}
