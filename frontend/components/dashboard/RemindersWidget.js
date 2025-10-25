export default function RemindersWidget({ title, emptyState, reminders, onComplete }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      </div>
      <ul className="flex flex-col gap-3">
        {(reminders ?? []).map((reminder) => (
          <li key={reminder.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50/80 p-3 dark:bg-slate-800/60">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{reminder.title}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{reminder.clientName}</span>
              <span className="text-xs text-slate-400 dark:text-slate-500">{reminder.dueDate}</span>
            </div>
            <button
              type="button"
              onClick={() => onComplete(reminder)}
              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
            >
              ✓
            </button>
          </li>
        ))}
      </ul>
      {!reminders?.length ? <p className="text-sm text-slate-500 dark:text-slate-400">{emptyState}</p> : null}
    </section>
  );
}
