import clsx from 'clsx';

function StatTile({ label, value, trend }) {
  return (
    <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 transition dark:bg-slate-900/70 dark:ring-slate-800">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      {trend ? <p className="text-xs text-emerald-500">{trend}</p> : null}
    </div>
  );
}

function ReminderTile({ reminder }) {
  return (
    <li className="rounded-2xl border border-slate-200 bg-white/70 p-3 text-xs text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-100">{reminder.reason || reminder.text}</p>
      {reminder.client ? (
        <p className="mt-1 text-xs text-slate-400">{reminder.client.name}</p>
      ) : null}
      {reminder.remind_at || reminder.due_date ? (
        <p className="mt-2 text-[0.65rem] uppercase tracking-wide text-slate-400">
          {new Date(reminder.remind_at || reminder.due_date).toLocaleString('ru-RU')}
        </p>
      ) : null}
    </li>
  );
}

export default function DashboardMenu({ isOpen, onClose, stats, reminders }) {
  return (
    <aside
      className={clsx(
        'absolute inset-y-0 left-0 z-30 flex w-80 flex-col gap-6 overflow-y-auto border-r border-slate-200 bg-slate-50/90 p-6 shadow-2xl backdrop-blur-md transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900/80 lg:static lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Статистика</p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Мой дашборд</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white p-2 text-xs font-medium uppercase tracking-wide text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-600 dark:bg-slate-900 dark:ring-slate-700 lg:hidden"
        >
          Закрыть
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3">
        <StatTile label="Клиенты" value={stats?.totals?.clients ?? 0} trend={stats?.trends?.clients} />
        <StatTile label="Взаимодействия" value={stats?.totals?.interactions ?? 0} trend={stats?.trends?.interactions} />
        <StatTile label="Напоминания" value={stats?.totals?.reminders ?? 0} trend={stats?.trends?.reminders} />
        <StatTile label="Выручка" value={`${stats?.totals?.revenue ?? 0} ₽`} trend={stats?.trends?.revenue} />
      </div>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Активные напоминания</h3>
        {reminders?.length ? (
          <ul className="space-y-2">
            {reminders.map((reminder) => (
              <ReminderTile key={reminder.id} reminder={reminder} />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 p-3 text-xs text-slate-400 dark:border-slate-700">
            Нет напоминаний на сегодня
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">AI рекомендации</h3>
        {stats?.aiRecommendations?.length ? (
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {stats.aiRecommendations.map((item) => (
              <li key={item.id} className="rounded-2xl border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="font-medium text-slate-700 dark:text-slate-100">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-300">{item.message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 p-3 text-xs text-slate-400 dark:border-slate-700">
            Подсказки появятся после взаимодействий с клиентами
          </p>
        )}
      </section>
    </aside>
  );
}
