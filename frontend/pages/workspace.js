import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { io } from 'socket.io-client';

import ChatWindow from '@/components/workspace/ChatWindow';
import ClientInfoPanel from '@/components/workspace/ClientInfoPanel';
import DashboardMenu from '@/components/workspace/DashboardMenu';
import SmartInput from '@/components/workspace/SmartInput';
import useApiClient from '@/hooks/useApiClient';
import useAuthGuard from '@/hooks/useAuthGuard';
import useStore from '@/state/useStore';
import getApiUrl from '@/utils/getApiUrl';

const COMMANDS = [
  {
    id: 'клиент',
    label: 'Создать клиента',
    description: 'Добавление нового клиента с контактами и потребностями',
    action: 'create-client'
  },
  {
    id: 'поиск',
    label: 'Найти клиента',
    description: 'Введите последние 4 цифры номера телефона',
    action: 'search-client'
  },
  {
    id: 'напоминание',
    label: 'Добавить напоминание',
    description: 'Планируйте follow-up в календаре CRM',
    action: 'add-reminder'
  },
  {
    id: 'взаимодействие',
    label: 'Логировать взаимодействие',
    description: 'Звонок, WhatsApp или email с итогом',
    action: 'add-interaction'
  }
];

const ACTION_BUTTONS = {
  'create-client': {
    label: 'Создать клиента',
    variant: 'primary'
  },
  'add-reminder': {
    label: 'Добавить напоминание'
  },
  'add-interaction': {
    label: 'Добавить взаимодействие'
  },
  'attach-invoice': {
    label: 'Приложить счёт'
  }
};

function formatTimestamp(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  } catch (error) {
    return date.toLocaleString();
  }
}

function ActionSheet({
  type,
  clients,
  currentClient,
  onClose,
  onCreateClient,
  onCreateReminder,
  onCreateInteraction,
  onAttachInvoice,
  isBusy
}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!type) {
      setForm({});
      return;
    }

    if (type === 'create-client') {
      setForm({
        name: '',
        phone: '',
        email: '',
        city: '',
        demand: '',
        status: 'new',
        priority: 'medium',
        total_sum: ''
      });
    }

    if (type === 'add-reminder') {
      setForm({
        client_id: currentClient?.id || '',
        due_date: '',
        text: '',
        auto_generated: false
      });
    }

    if (type === 'add-interaction') {
      setForm({
        client_id: currentClient?.id || '',
        type: 'call',
        result: ''
      });
    }

    if (type === 'attach-invoice') {
      setForm({
        client_id: currentClient?.id || '',
        file: null,
        notes: ''
      });
    }
  }, [currentClient?.id, type]);

  if (!type) return null;

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, file }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (type === 'create-client') {
      await onCreateClient(form);
    }

    if (type === 'add-reminder') {
      await onCreateReminder(form);
    }

    if (type === 'add-interaction') {
      await onCreateInteraction(form);
    }

    if (type === 'attach-invoice') {
      await onAttachInvoice(form);
    }
  };

  const renderClientSelect = (field = 'client_id') => (
    <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
      Клиент
      <select
        value={form[field] || ''}
        onChange={handleChange(field)}
        required
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        <option value="" disabled>
          Выберите клиента
        </option>
        {(clients || []).map((client) => (
          <option key={client.id} value={client.id}>
            {client.name} · {client.phone}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-6 py-12 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full max-w-lg flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Действие</p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {{
                'create-client': 'Создание клиента',
                'add-reminder': 'Новое напоминание',
                'add-interaction': 'Фиксация взаимодействия',
                'attach-invoice': 'Загрузка счёта'
              }[type]}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            Закрыть
          </button>
        </header>

        <div className="flex flex-col gap-3">
          {type === 'create-client' ? (
            <>
              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                Имя клиента
                <input
                  required
                  value={form.name || ''}
                  onChange={handleChange('name')}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Мария Смирнова"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                  Телефон
                  <input
                    required
                    value={form.phone || ''}
                    onChange={handleChange('phone')}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="+7 (900) 123-45-67"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                  Email
                  <input
                    required
                    type="email"
                    value={form.email || ''}
                    onChange={handleChange('email')}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="client@example.com"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                  Город
                  <input
                    value={form.city || ''}
                    onChange={handleChange('city')}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Москва"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                  Спрос
                  <input
                    value={form.demand || ''}
                    onChange={handleChange('demand')}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Интерес к 3D-сканерам"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                  Статус
                  <select
                    value={form.status || 'new'}
                    onChange={handleChange('status')}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="new">Новый</option>
                    <option value="in_progress">В работе</option>
                    <option value="hot">Горячий</option>
                    <option value="closed">Закрыт</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                  Приоритет
                  <select
                    value={form.priority || 'medium'}
                    onChange={handleChange('priority')}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="high">Высокий</option>
                    <option value="medium">Средний</option>
                    <option value="low">Низкий</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                Ориентировочная сумма сделки
                <input
                  value={form.total_sum || ''}
                  onChange={handleChange('total_sum')}
                  type="number"
                  min="0"
                  step="0.01"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="150000"
                />
              </label>
            </>
          ) : null}

          {type === 'add-reminder' ? (
            <>
              {renderClientSelect()}
              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                Дата и время
                <input
                  type="datetime-local"
                  required
                  value={form.due_date || ''}
                  onChange={handleChange('due_date')}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                Текст напоминания
                <textarea
                  required
                  value={form.text || ''}
                  onChange={handleChange('text')}
                  className="min-h-[100px] rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Связаться и уточнить детали счета"
                />
              </label>
            </>
          ) : null}

          {type === 'add-interaction' ? (
            <>
              {renderClientSelect()}
              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                Канал
                <select
                  value={form.type || 'call'}
                  onChange={handleChange('type')}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="call">Звонок</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                Итог общения
                <textarea
                  required
                  value={form.result || ''}
                  onChange={handleChange('result')}
                  className="min-h-[120px] rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Клиент запросил коммерческое предложение"
                />
              </label>
            </>
          ) : null}

          {type === 'attach-invoice' ? (
            <>
              {renderClientSelect()}
              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                Файл счёта
                <input
                  ref={fileInputRef}
                  required
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 transition hover:border-indigo-300"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                Комментарий для AI
                <textarea
                  value={form.notes || ''}
                  onChange={handleChange('notes')}
                  className="min-h-[100px] rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-indigo-300 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Отметьте важные позиции или сроки"
                />
              </label>
            </>
          ) : null}
        </div>

        <footer className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            Отменить
          </button>
          <button
            type="submit"
            disabled={isBusy}
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isBusy ? 'Сохранение…' : 'Сохранить'}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default function WorkspacePage() {
  const { token, isAuthenticated, isChecking, clearToken } = useAuthGuard();
  const api = useApiClient(token, { onUnauthorized: clearToken });
  const clients = useStore((state) => state.clients);
  const setClients = useStore((state) => state.setClients);
  const addClient = useStore((state) => state.addClient);
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const currentClient = useStore((state) => state.currentClient);
  const setCurrentClient = useStore((state) => state.setCurrentClient);
  const messages = useStore((state) => state.messages);
  const appendMessage = useStore((state) => state.appendMessage);
  const setDashboardStats = useStore((state) => state.setDashboardStats);
  const dashboardStats = useStore((state) => state.dashboardStats);
  const reminders = useStore((state) => state.reminders);
  const setReminders = useStore((state) => state.setReminders);
  const addReminder = useStore((state) => state.addReminder);
  const isDashboardOpen = useStore((state) => state.isDashboardOpen);
  const toggleDashboard = useStore((state) => state.toggleDashboard);
  const setAiSuggestions = useStore((state) => state.setAiSuggestions);

  const [interactions, setInteractions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [flowState, setFlowState] = useState(null);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);

  const ensureWelcomeMessage = useCallback(() => {
    if (messages.length) return;
    appendMessage({
      sender: 'system',
      type: 'notification',
      content: 'Добро пожаловать в рабочее место Salesupport CRM! Используйте команды внизу, чтобы начать.',
      timestamp: formatTimestamp(),
      actions: Object.entries(ACTION_BUTTONS).map(([value, config]) => ({
        value,
        label: config.label,
        variant: config.variant
      }))
    });
  }, [appendMessage, messages.length]);

  useEffect(() => {
    if (isChecking || !isAuthenticated) return;
    ensureWelcomeMessage();
  }, [ensureWelcomeMessage, isAuthenticated, isChecking]);

  const loadClients = useCallback(async () => {
    if (!api) return;
    const response = await api.get('/clients');
    setClients(response.data);
  }, [api, setClients]);

  const loadDashboard = useCallback(async () => {
    if (!api) return;
    const response = await api.get('/dashboard/stats');
    setDashboardStats(response.data);
    if (response.data?.aiRecommendations) {
      setAiSuggestions(response.data.aiRecommendations);
    }
  }, [api, setAiSuggestions, setDashboardStats]);

  const loadReminders = useCallback(async () => {
    if (!api) return;
    const response = await api.get('/reminders', { params: { due_today: true } });
    setReminders(response.data);
  }, [api, setReminders]);

  const loadInteractions = useCallback(async (clientId) => {
    if (!api || !clientId) return;
    const response = await api.get('/interactions', { params: { client_id: clientId } });
    setInteractions(response.data);
  }, [api]);

  const refreshClient = useCallback(async (clientId) => {
    if (!api || !clientId) return;
    const [clientResponse] = await Promise.all([
      api.get(`/clients/${clientId}`),
      loadInteractions(clientId),
      loadReminders()
    ]);
    setCurrentClient(clientResponse.data);
  }, [api, loadInteractions, loadReminders, setCurrentClient]);

  const bootstrap = useCallback(async () => {
    if (!api) return;
    setIsSyncing(true);
    try {
      const [{ data: profile }] = await Promise.all([
        api.get('/auth/me'),
        loadClients(),
        loadDashboard(),
        loadReminders()
      ]);
      setCurrentUser(profile.user);
    } catch (requestError) {
      console.error(requestError);
      setError('Не удалось загрузить данные. Попробуйте позже.');
    } finally {
      setIsSyncing(false);
    }
  }, [api, loadClients, loadDashboard, loadReminders, setCurrentUser]);

  useEffect(() => {
    if (!api) return;
    bootstrap();
  }, [api, bootstrap]);

  useEffect(() => {
    if (!token) return;
    const socket = io(getApiUrl(), {
      transports: ['websocket'],
      auth: { token }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      appendMessage({
        sender: 'system',
        type: 'notification',
        content: 'Подключение к уведомлениям установлено.',
        timestamp: formatTimestamp()
      });
    });

    socket.on('message', (payload) => {
      if (payload.type === 'reminder_due') {
        appendMessage({
          sender: 'system',
          type: 'notification',
          content: payload.message,
          timestamp: formatTimestamp(),
          actions: [ACTION_BUTTONS['add-interaction'], ACTION_BUTTONS['add-reminder']].map((config, index) => ({
            ...config,
            value: index === 0 ? 'add-interaction' : 'add-reminder'
          }))
        });
        loadReminders();
      } else if (payload.type === 'ai_recommendation') {
        appendMessage({
          sender: 'ai',
          type: 'ai',
          content: payload.message,
          aiContext: payload.context,
          timestamp: formatTimestamp(),
          actions: payload.actions?.map((action) => ({
            value: action.value,
            label: action.label,
            variant: action.variant
          }))
        });
      }
    });

    socket.on('disconnect', () => {
      appendMessage({
        sender: 'system',
        type: 'notification',
        content: 'Соединение с уведомлениями потеряно. Переподключение...',
        timestamp: formatTimestamp()
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [appendMessage, loadReminders, token]);

  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      loadDashboard();
      loadReminders();
      if (currentClient?.id) {
        refreshClient(currentClient.id);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [api, currentClient?.id, loadDashboard, loadReminders, refreshClient]);

  const handleCommand = useCallback((command) => {
    if (!command) return;

    if (command.action === 'search-client') {
      appendMessage({
        sender: 'system',
        content: 'Введите последние 4 цифры номера телефона клиента.',
        timestamp: formatTimestamp(),
        actions: []
      });
      setFlowState('search-client');
      return;
    }

    setPendingAction(command.action);
  }, [appendMessage]);

  const handleMessageAction = useCallback(
    (action) => {
      if (!action?.value) return;

      if (action.value.startsWith('select-client:')) {
        const [, id] = action.value.split(':');
        const client = clients.find((item) => String(item.id) === id);
        if (client) {
          setCurrentClient(client);
          loadInteractions(client.id);
          setFlowState(null);
          appendMessage({
            sender: 'system',
            type: 'notification',
            content: `Клиент ${client.name} выбран.`,
            timestamp: formatTimestamp(),
            actions: ['attach-invoice', 'add-reminder', 'add-interaction'].map((value) => ({
              ...ACTION_BUTTONS[value],
              value
            }))
          });
        }
        return;
      }

      if (ACTION_BUTTONS[action.value]) {
        setPendingAction(action.value);
        return;
      }

      if (action.value === 'open-dashboard') {
        toggleDashboard();
      }
    },
    [appendMessage, clients, loadInteractions, setCurrentClient, setFlowState, toggleDashboard]
  );

  const handleSend = useCallback(async ({ text, attachment }) => {
    if (!text && !attachment) return;

    if (flowState === 'search-client' && text) {
      setFlowState(null);
      try {
        const response = await api.get('/clients', { params: { phone_ends: text.replace(/\D/g, '') } });
        const matches = response.data;
        if (!matches.length) {
          appendMessage({
            sender: 'system',
            type: 'notification',
            content: 'Клиенты не найдены. Попробуйте уточнить номер или создайте нового клиента.',
            timestamp: formatTimestamp(),
            actions: [ACTION_BUTTONS['create-client']].map((config) => ({
              ...config,
              value: 'create-client'
            }))
          });
          return;
        }

        if (matches.length === 1) {
          setCurrentClient(matches[0]);
          loadInteractions(matches[0].id);
          appendMessage({
            sender: 'system',
            type: 'notification',
            content: `Найден клиент ${matches[0].name}. Что делаем дальше?`,
            timestamp: formatTimestamp(),
            actions: ['attach-invoice', 'add-reminder', 'add-interaction'].map((value) => ({
              ...ACTION_BUTTONS[value],
              value
            }))
          });
        } else {
          appendMessage({
            sender: 'system',
            type: 'notification',
            content: `Найдено ${matches.length} клиентов. Выберите нужного:`,
            timestamp: formatTimestamp()
          });
          matches.forEach((client) => {
            appendMessage({
              sender: 'system',
              content: `${client.name} · ${client.phone}`,
              timestamp: formatTimestamp(),
              actions: [
                {
                  label: 'Выбрать',
                  value: `select-client:${client.id}`,
                  variant: 'primary'
                }
              ]
            });
          });
        }
      } catch (requestError) {
        console.error(requestError);
        appendMessage({
          sender: 'system',
          type: 'notification',
          content: 'Ошибка поиска клиента. Попробуйте позже.',
          timestamp: formatTimestamp()
        });
      }
      return;
    }

    if (attachment) {
      setPendingAction('attach-invoice');
      appendMessage({
        sender: 'system',
        type: 'notification',
        content: 'Для обработки счёта используйте форму «Приложить счёт».',
        timestamp: formatTimestamp(),
        actions: [ACTION_BUTTONS['attach-invoice']].map((config) => ({
          ...config,
          value: 'attach-invoice'
        }))
      });
      return;
    }

    const messageId = Date.now();
    appendMessage({
      id: messageId,
      sender: 'manager',
      type: 'text',
      content: text,
      timestamp: formatTimestamp()
    });

    if (!api) return;

    try {
      setIsSending(true);
      const response = await api.post('/ai/suggest_message', {
        text,
        client_id: currentClient?.id,
        history: messages.slice(-5).map((item) => ({ sender: item.sender, content: item.content }))
      });

      appendMessage({
        sender: 'ai',
        type: 'ai',
        content: response.data.suggestion,
        aiContext: response.data.context,
        timestamp: formatTimestamp(),
        actions: response.data.actions?.map((action) => ({
          value: action.value,
          label: action.label,
          variant: action.variant
        })) ?? []
      });
    } catch (requestError) {
      console.error(requestError);
      appendMessage({
        sender: 'system',
        type: 'notification',
        content: 'AI временно недоступен. Попробуйте позже.',
        timestamp: formatTimestamp()
      });
    } finally {
      setIsSending(false);
    }
  }, [api, appendMessage, currentClient?.id, flowState, loadInteractions, messages, setCurrentClient]);

  const handleCloseAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  const handleCreateClient = useCallback(
    async (form) => {
      if (!api) return;
      try {
        setIsSending(true);
        const payload = {
          name: form.name,
          phone: form.phone,
          email: form.email,
          city: form.city,
          demand: form.demand,
          status: form.status,
          priority: form.priority,
          total_sum: form.total_sum ? Number(form.total_sum) : 0
        };
        const response = await api.post('/clients', payload);
        addClient(response.data);
        setCurrentClient(response.data);
        appendMessage({
          sender: 'system',
          type: 'notification',
          content: `Клиент ${response.data.name} создан.`,
          timestamp: formatTimestamp(),
          actions: ['attach-invoice', 'add-reminder', 'add-interaction'].map((value) => ({
            ...ACTION_BUTTONS[value],
            value
          }))
        });
        setPendingAction(null);
        await loadDashboard();
      } catch (requestError) {
        console.error(requestError);
        appendMessage({
          sender: 'system',
          type: 'notification',
          content: 'Ошибка создания клиента. Проверьте данные и попробуйте снова.',
          timestamp: formatTimestamp()
        });
      } finally {
        setIsSending(false);
      }
    },
    [addClient, api, appendMessage, loadDashboard, setCurrentClient]
  );

  const handleCreateReminder = useCallback(
    async (form) => {
      if (!api) return;
      try {
        setIsSending(true);
        const payload = {
          client_id: Number(form.client_id),
          remind_at: form.due_date,
          reason: form.text,
          auto_generated: Boolean(form.auto_generated)
        };
        const response = await api.post('/reminders', payload);
        appendMessage({
          sender: 'system',
          type: 'notification',
          content: 'Напоминание создано.',
          timestamp: formatTimestamp()
        });
        addReminder(response.data);
        setPendingAction(null);
        await loadDashboard();
      } catch (requestError) {
        console.error(requestError);
        appendMessage({
          sender: 'system',
          type: 'notification',
          content: 'Не удалось создать напоминание.',
          timestamp: formatTimestamp()
        });
      } finally {
        setIsSending(false);
      }
    },
    [addReminder, api, appendMessage, loadDashboard]
  );

  const handleCreateInteraction = useCallback(async (form) => {
    if (!api) return;
    try {
      setIsSending(true);
      const payload = {
        client_id: Number(form.client_id),
        type: form.type,
        result: form.result
      };
      await api.post('/interactions', payload);
      appendMessage({
        sender: 'system',
        type: 'notification',
        content: 'Взаимодействие сохранено.',
        timestamp: formatTimestamp()
      });
      if (payload.client_id === currentClient?.id) {
        await loadInteractions(payload.client_id);
      }
      setPendingAction(null);
      await loadDashboard();
    } catch (requestError) {
      console.error(requestError);
      appendMessage({
        sender: 'system',
        type: 'notification',
        content: 'Не удалось сохранить взаимодействие.',
        timestamp: formatTimestamp()
      });
    } finally {
      setIsSending(false);
    }
  }, [api, appendMessage, currentClient?.id, loadDashboard, loadInteractions]);

  const handleAttachInvoice = useCallback(async (form) => {
    if (!api || !form.file) return;
    try {
      setIsSending(true);
      const content = await form.file.text().catch(() => null);
      const payload = {
        client_id: Number(form.client_id),
        file_name: form.file.name,
        mime_type: form.file.type,
        notes: form.notes,
        content
      };
      const response = await api.post('/ai/invoice/parse', payload);
      appendMessage({
        sender: 'system',
        type: 'notification',
        content: `Счёт обработан. Итоговая сумма: ${response.data.total} ₽.`,
        timestamp: formatTimestamp(),
        files: [
          {
            name: form.file.name,
            url: '#',
            extension: form.file.name.split('.').pop(),
            size: `${(form.file.size / 1024).toFixed(1)} КБ`
          }
        ],
        actions: [ACTION_BUTTONS['add-interaction'], ACTION_BUTTONS['add-reminder']].map((config) => ({
          ...config,
          value: config === ACTION_BUTTONS['add-interaction'] ? 'add-interaction' : 'add-reminder'
        })),
        aiContext: response.data.context
      });
      setPendingAction(null);
      await loadDashboard();
    } catch (requestError) {
      console.error(requestError);
      appendMessage({
        sender: 'system',
        type: 'notification',
        content: 'Не удалось обработать счёт.',
        timestamp: formatTimestamp()
      });
    } finally {
      setIsSending(false);
    }
  }, [api, appendMessage, loadDashboard]);

  if (isChecking || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-center text-sm text-slate-500 shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Проверка доступа…
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Рабочее место менеджера — Salesupport CRM</title>
      </Head>
      <main className="flex min-h-screen w-full gap-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <DashboardMenu
          isOpen={isDashboardOpen}
          onClose={toggleDashboard}
          stats={dashboardStats}
          reminders={reminders}
        />

        <div className="flex flex-1 flex-col gap-4 lg:pl-80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Менеджер</p>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{currentUser?.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
            </div>
            <button
              type="button"
              onClick={toggleDashboard}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-700 lg:hidden"
            >
              {isDashboardOpen ? 'Скрыть дашборд' : 'Показать дашборд'}
            </button>
          </div>

          {error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600 shadow-sm dark:border-red-800/60 dark:bg-red-900/40 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <div className="flex flex-1 flex-col gap-4 lg:flex-row">
            <div className="flex flex-1 flex-col gap-4">
              <ChatWindow messages={messages} onAction={handleMessageAction} isLoading={isSyncing} />
              <SmartInput commands={COMMANDS} onCommandSelect={handleCommand} onSend={handleSend} isBusy={isSending} />
            </div>
            <ClientInfoPanel client={currentClient} interactions={interactions} reminders={reminders.filter((item) => item.client_id === currentClient?.id)} />
          </div>
        </div>

        <ActionSheet
          type={pendingAction}
          clients={clients}
          currentClient={currentClient}
          onClose={handleCloseAction}
          onCreateClient={handleCreateClient}
          onCreateReminder={handleCreateReminder}
          onCreateInteraction={handleCreateInteraction}
          onAttachInvoice={handleAttachInvoice}
          isBusy={isSending}
        />
      </main>
    </>
  );
}
