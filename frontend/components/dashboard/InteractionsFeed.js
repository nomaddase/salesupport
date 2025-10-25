export default function InteractionsFeed({ title, emptyState, interactions }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <ul className="flex flex-col gap-4">
        {(interactions ?? []).map((interaction) => (
          <li key={interaction.id} className="flex items-start gap-3 rounded-2xl bg-slate-50/70 p-3 dark:bg-slate-800/60">
            <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-sky-400" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{interaction.subject}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{interaction.clientName}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{interaction.happenedAt}</p>
            </div>
          </li>
        ))}
      </ul>
      {!interactions?.length ? <p className="text-sm text-slate-500 dark:text-slate-400">{emptyState}</p> : null}
    </section>
  );
}
