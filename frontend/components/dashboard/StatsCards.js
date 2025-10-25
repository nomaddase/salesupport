function StatCard({ label, value, trend, accent }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
      <strong className={`text-3xl font-semibold ${accent || 'text-slate-900 dark:text-slate-100'}`}>{value}</strong>
      {trend ? <span className="text-xs text-emerald-500">{trend}</span> : null}
    </div>
  );
}

export default function StatsCards({ stats }) {
  const cards = [
    {
      key: 'clients',
      label: stats.labels?.clients,
      value: stats.totals?.clients ?? 0,
      trend: stats.trends?.clients
    },
    {
      key: 'interactions',
      label: stats.labels?.interactions,
      value: stats.totals?.interactions ?? 0,
      trend: stats.trends?.interactions,
      accent: 'text-sky-500'
    },
    {
      key: 'reminders',
      label: stats.labels?.reminders,
      value: stats.totals?.reminders ?? 0,
      trend: stats.trends?.reminders,
      accent: 'text-amber-500'
    }
  ].filter((card) => card.label);

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <StatCard key={card.key} {...card} />
      ))}
    </section>
  );
}
