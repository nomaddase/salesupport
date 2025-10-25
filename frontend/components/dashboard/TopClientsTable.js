export default function TopClientsTable({ title, clients, emptyState }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="text-xs uppercase text-slate-400 dark:text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Клиент</th>
              <th className="px-4 py-2 font-medium">Компания</th>
              <th className="px-4 py-2 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            {(clients ?? []).map((client) => (
              <tr key={client.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">{client.name}</td>
                <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{client.company || '—'}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                    {client.status || 'active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!clients?.length ? <p className="text-sm text-slate-500 dark:text-slate-400">{emptyState}</p> : null}
    </section>
  );
}
