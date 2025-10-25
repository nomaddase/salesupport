import clsx from 'clsx';

const senderStyles = {
  manager: 'bg-sky-500 text-white ml-auto rounded-3xl rounded-tr-md shadow-lg',
  system: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-3xl rounded-tl-md',
  ai: 'bg-indigo-500/10 text-indigo-900 dark:text-indigo-100 border border-indigo-200 dark:border-indigo-700 rounded-3xl rounded-tl-md',
};

function ActionButtons({ actions, onAction }) {
  if (!actions?.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.value}
          type="button"
          onClick={() => onAction?.(action)}
          className={clsx(
            'rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2',
            action.variant === 'primary'
              ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-200'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700'
          )}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

function AttachmentList({ files }) {
  if (!files?.length) return null;

  return (
    <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
      {files.map((file) => (
        <li key={file.url} className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-100">
            {file.extension?.toUpperCase() || 'PDF'}
          </span>
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="truncate text-sky-600 transition hover:text-sky-500"
          >
            {file.name}
          </a>
          {file.size ? <span className="text-xs text-slate-400">{file.size}</span> : null}
        </li>
      ))}
    </ul>
  );
}

function AiContext({ context }) {
  if (!context) return null;
  return (
    <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-700 dark:border-indigo-800/80 dark:bg-indigo-900/40 dark:text-indigo-100">
      <p className="font-semibold uppercase tracking-wide text-[0.65rem] text-indigo-500 dark:text-indigo-200">
        Контекст AI
      </p>
      <p className="mt-1 leading-relaxed">{context}</p>
    </div>
  );
}

export default function MessageBubble({ message, onAction }) {
  const alignment = message.sender === 'manager' ? 'items-end' : 'items-start';
  const bubbleStyle = senderStyles[message.sender] || senderStyles.system;

  return (
    <article className={clsx('flex flex-col gap-2', alignment)}>
      <div className={clsx('max-w-xl rounded-3xl px-5 py-3 text-sm leading-relaxed shadow-sm', bubbleStyle)}>
        {message.title ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {message.title}
          </p>
        ) : null}
        {message.type === 'notification' ? (
          <p className="font-semibold text-slate-900 dark:text-slate-100">{message.content}</p>
        ) : (
          <p>{message.content}</p>
        )}

        {message.meta ? (
          <p className="mt-2 text-xs text-slate-400">{message.meta}</p>
        ) : null}

        <AttachmentList files={message.files} />
        <ActionButtons actions={message.actions} onAction={onAction} />
        <AiContext context={message.aiContext} />
      </div>
      <time className="px-2 text-[0.65rem] uppercase tracking-wide text-slate-400">
        {message.timestamp}
      </time>
    </article>
  );
}
