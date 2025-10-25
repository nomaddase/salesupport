import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

function SuggestionList({ items, activeIndex, onSelect }) {
  if (!items.length) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-3 origin-bottom rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Команды</p>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className={clsx(
                'w-full rounded-2xl px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800',
                index === activeIndex
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-100'
                  : 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-indigo-900/40'
              )}
            >
              <span className="block font-medium">{item.label}</span>
              {item.description ? <span className="text-xs text-slate-500 dark:text-slate-400">{item.description}</span> : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AttachmentPreview({ attachment, onRemove }) {
  if (!attachment) return null;

  return (
    <div className="absolute -top-20 right-0 w-48 rounded-2xl border border-slate-200 bg-white/90 p-3 text-xs text-slate-500 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
      <p className="font-semibold text-slate-700 dark:text-slate-100">{attachment.name}</p>
      <p className="text-xs text-slate-400">{attachment.size}</p>
      <button
        type="button"
        onClick={onRemove}
        className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
      >
        Удалить
      </button>
    </div>
  );
}

export default function SmartInput({ onSend, onCommandSelect, isBusy, commands = [] }) {
  const [value, setValue] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const textareaRef = useRef(null);

  const visibleCommands = useMemo(() => {
    if (!value.startsWith('/')) return [];
    const query = value.slice(1).toLowerCase();
    return commands.filter((command) => command.id.toLowerCase().includes(query));
  }, [commands, value]);

  useEffect(() => {
    setActiveIndex(0);
  }, [visibleCommands.length]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!value.trim()) return;

    if (value.startsWith('/') && visibleCommands.length) {
      onCommandSelect?.(visibleCommands[activeIndex]);
      setValue('');
      return;
    }

    onSend?.({ text: value.trim(), attachment });
    setValue('');
    setAttachment(null);
  };

  const handleKeyDown = (event) => {
    if (visibleCommands.length && ['ArrowUp', 'ArrowDown', 'Tab'].includes(event.key)) {
      event.preventDefault();
      const offset = event.key === 'ArrowUp' ? -1 : 1;
      const nextIndex = (activeIndex + offset + visibleCommands.length) % visibleCommands.length;
      setActiveIndex(nextIndex);
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAttachment({
      file,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} КБ`
    });
  };

  const handleSuggestionClick = (command) => {
    onCommandSelect?.(command);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-3">
      <SuggestionList items={visibleCommands} activeIndex={activeIndex} onSelect={handleSuggestionClick} />
      <AttachmentPreview attachment={attachment} onRemove={() => setAttachment(null)} />

      <div className="flex items-end gap-3 rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm focus-within:border-indigo-300 dark:border-slate-700 dark:bg-slate-900/70">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение или используйте команды: /клиент, /напоминание, /взаимодействие"
          className="min-h-[60px] flex-1 resize-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
        />

        <div className="flex flex-col items-center gap-2">
          <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
            📎
          </label>
          <button
            type="submit"
            disabled={isBusy}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isBusy ? '…' : '➤'}
          </button>
        </div>
      </div>
    </form>
  );
}
