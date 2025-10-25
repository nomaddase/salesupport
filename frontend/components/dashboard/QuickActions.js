export default function QuickActions({ title, actions }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-dashed border-slate-300 bg-white/60 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Выберите действие, чтобы ускорить работу с клиентами</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {(actions ?? []).map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100"
          >
            <span>{action.label}</span>
            <span aria-hidden>→</span>
          </button>
        ))}
      </div>
    </section>
  );
}
