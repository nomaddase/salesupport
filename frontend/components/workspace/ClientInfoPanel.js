function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
      <span className="font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</span>
      <span className="text-sm text-slate-700 dark:text-slate-100">{value}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{title}</h3>
      {children}
    </section>
  );
}

export default function ClientInfoPanel({ client, interactions, reminders }) {
  return (
    <aside className="flex h-full w-full max-w-sm flex-col gap-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/60">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Текущий клиент</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
          {client?.name || 'Не выбран'}
        </h2>
        {client?.status ? (
          <p className="mt-1 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
            {client.status}
          </p>
        ) : null}
      </header>

      {client ? (
        <div className="space-y-6">
          <Section title="Контакты">
            <InfoRow label="Телефон" value={client.phone} />
            <InfoRow label="Email" value={client.email} />
            <InfoRow label="Город" value={client.city} />
          </Section>

          <Section title="Параметры">
            <InfoRow label="Приоритет" value={client.priority} />
            <InfoRow label="Спрос" value={client.demand} />
            <InfoRow label="Сумма сделок" value={client.total_sum ? `${client.total_sum} ₽` : null} />
          </Section>

          <Section title="Последние взаимодействия">
            {interactions?.length ? (
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-300">
                {interactions.map((interaction) => (
                  <li key={interaction.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                    <p className="font-medium capitalize text-slate-600 dark:text-slate-200">{interaction.type}</p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-100">{interaction.result}</p>
                    {interaction.created_at ? (
                      <p className="mt-2 text-[0.65rem] uppercase tracking-wide text-slate-400">
                        {new Date(interaction.created_at).toLocaleString('ru-RU')}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-200 p-3 text-xs text-slate-400 dark:border-slate-700">
                Нет записей. Добавьте взаимодействие через чат.
              </p>
            )}
          </Section>

          <Section title="Напоминания">
            {reminders?.length ? (
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-300">
                {reminders.map((reminder) => (
                  <li key={reminder.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-100">{reminder.reason || reminder.text}</p>
                    {reminder.remind_at || reminder.due_date ? (
                      <p className="mt-1 text-[0.65rem] uppercase tracking-wide text-slate-400">
                        {new Date(reminder.remind_at || reminder.due_date).toLocaleString('ru-RU')}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-200 p-3 text-xs text-slate-400 dark:border-slate-700">
                Активных напоминаний нет.
              </p>
            )}
          </Section>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-slate-500 dark:text-slate-300">
          <p>Выберите клиента или создайте нового через чат.</p>
          <p className="text-xs">Команда «/клиент» поможет начать работу.</p>
        </div>
      )}
    </aside>
  );
}
