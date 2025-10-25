import Link from 'next/link';

export default function DashboardHeader({
  greeting,
  subtitle,
  searchValue,
  onSearchChange,
  isSearching,
  searchPlaceholder,
  searchResults,
  onClientSelect,
  profileLabel,
  quickLink,
  onToggleTheme,
  isDark,
  themeLabel
}) {
  return (
    <header className="flex flex-col gap-6 rounded-3xl border border-slate-200/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 md:text-3xl">{greeting}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        {quickLink ? (
          <Link
            href={quickLink.href}
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100"
          >
            {quickLink.label}
          </Link>
        ) : null}
      </div>
      <div className="flex w-full flex-col gap-4 lg:w-[420px]">
        <div className="relative">
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-3 text-sm text-slate-700 transition focus:border-slate-400 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            type="search"
          />
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs text-slate-400">
            {isSearching ? '...' : profileLabel}
          </div>
          {searchValue && searchResults?.length ? (
            <ul className="absolute inset-x-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
              {searchResults.map((client) => (
                <li key={client.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col items-start gap-0.5 px-5 py-3 text-left text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    onClick={() => onClientSelect(client)}
                  >
                    <span className="font-medium text-slate-900 dark:text-slate-100">{client.name}</span>
                    {client.company ? (
                      <span className="text-xs text-slate-500 dark:text-slate-400">{client.company}</span>
                    ) : null}
                    {client.email ? (
                      <span className="text-xs text-slate-400 dark:text-slate-500">{client.email}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100"
          >
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: isDark ? '#38bdf8' : '#facc15' }} />
            {themeLabel}
          </button>
        </div>
      </div>
    </header>
  );
}
