import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

function ToastItem({ title, description, variant }) {
  const baseClasses =
    'pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 shadow-lg transition-all';
  const variantClasses =
    variant === 'destructive'
      ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/80 dark:text-rose-200'
      : 'border-slate-200 bg-white/95 text-slate-900 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-100';

  return (
    <div className={`${baseClasses} ${variantClasses}`} role="status" aria-live="polite">
      {title ? <p className="text-sm font-semibold">{title}</p> : null}
      {description ? <p className="mt-1 text-sm opacity-80">{description}</p> : null}
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeouts = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((items) => items.filter((toast) => toast.id !== id));
    const timeout = timeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeouts.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (toast) => {
      const id = toast.id || crypto.randomUUID();
      setToasts((items) => [...items, { ...toast, id }]);

      const timeout = setTimeout(() => removeToast(id), toast.duration ?? 4000);
      timeouts.current.set(id, timeout);
    },
    [removeToast]
  );

  const contextValue = useMemo(
    () => ({
      toast: (toast) => pushToast({ variant: 'default', ...toast }),
      dismiss: removeToast
    }),
    [pushToast, removeToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[999] flex flex-col items-center gap-3 px-4 sm:items-end">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            onClick={() => removeToast(toast.id)}
            className="pointer-events-auto focus:outline-none"
          >
            <ToastItem {...toast} />
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}
