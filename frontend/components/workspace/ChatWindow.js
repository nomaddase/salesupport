import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages, onAction, isLoading }) {
  return (
    <section className="flex h-full flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Рабочее место</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Общайтесь с клиентами, управляйте сделками и получайте подсказки от AI
          </p>
        </div>
        {isLoading ? (
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Синхронизация
          </span>
        ) : null}
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
              <p className="font-medium text-slate-600 dark:text-slate-200">Начните с команды «/клиент» или напишите сообщение, чтобы получить подсказки AI.</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} onAction={onAction} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
