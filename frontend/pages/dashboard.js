import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import useAuthGuard from '@/hooks/useAuthGuard';
import useTranslations from '@/hooks/useTranslations';
import useStore from '@/state/useStore';
import useApiClient from '@/hooks/useApiClient';
import useThemeMode from '@/hooks/useThemeMode';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import ActivityChart from '@/components/dashboard/ActivityChart';
import RemindersWidget from '@/components/dashboard/RemindersWidget';
import InteractionsFeed from '@/components/dashboard/InteractionsFeed';
import QuickActions from '@/components/dashboard/QuickActions';
import ProgressIndicators from '@/components/dashboard/ProgressIndicators';
import TopClientsTable from '@/components/dashboard/TopClientsTable';
import { useToast } from '@/components/ui/ToastProvider';

const REFRESH_INTERVAL = 60000;

function getErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'Неизвестная ошибка. Попробуйте ещё раз позже.';
}

function formatDate(value) {
  if (!value) return '';
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return value;
  }
}

export default function Dashboard() {
  const { t } = useTranslations();
  const { toast } = useToast();
  const { token, isAuthenticated, isChecking, clearToken } = useAuthGuard();
  const apiClient = useApiClient(token, { onUnauthorized: clearToken });
  const queryClient = useQueryClient();
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const router = useRouter();
  const { isDark, toggleTheme } = useThemeMode();
  const [searchValue, setSearchValue] = useState('');

  const handleRequestError = useCallback(
    (error) => {
      toast({
        variant: 'destructive',
        title: t('request_error_title'),
        description: getErrorMessage(error)
      });
    },
    [t, toast]
  );

  const { data: currentUser } = useQuery(
    ['currentUser'],
    async () => {
      const { data } = await apiClient.get('/auth/me');
      const user = data?.user ?? data ?? null;
      setCurrentUser(user);
      return user;
    },
    {
      enabled: Boolean(apiClient),
      refetchInterval: REFRESH_INTERVAL,
      onError: handleRequestError
    }
  );

  const { data: statsData } = useQuery(
    ['dashboard', 'stats'],
    async () => {
      const { data } = await apiClient.get('/dashboard/stats');
      return data;
    },
    {
      enabled: Boolean(apiClient),
      refetchInterval: REFRESH_INTERVAL,
      onError: handleRequestError
    }
  );

  const { data: remindersData } = useQuery(
    ['dashboard', 'reminders'],
    async () => {
      const { data } = await apiClient.get('/reminders', {
        params: { limit: 5, sort: 'due_date' }
      });
      return data;
    },
    {
      enabled: Boolean(apiClient),
      refetchInterval: REFRESH_INTERVAL,
      onError: handleRequestError
    }
  );

  const { data: interactionsData } = useQuery(
    ['dashboard', 'interactions'],
    async () => {
      const { data } = await apiClient.get('/interactions', {
        params: { limit: 5, sort: 'created_at' }
      });
      return data;
    },
    {
      enabled: Boolean(apiClient),
      refetchInterval: REFRESH_INTERVAL,
      onError: handleRequestError
    }
  );

  const { data: searchResults, isFetching: isSearching } = useQuery(
    ['clients', 'search', searchValue],
    async () => {
      const { data } = await apiClient.get('/clients', {
        params: { query: searchValue.trim() }
      });
      return Array.isArray(data) ? data : data?.items ?? [];
    },
    {
      enabled: Boolean(apiClient) && searchValue.trim().length >= 2,
      staleTime: 5 * 60 * 1000,
      keepPreviousData: true,
      onError: handleRequestError
    }
  );

  const completeReminderMutation = useMutation(
    async (reminder) => {
      if (!apiClient) return null;
      await apiClient.post(`/reminders/${reminder.id}/complete`);
      return null;
    },
    {
      onSuccess: () => {
        toast({ title: t('reminder_completed_title'), description: t('reminder_completed_description') });
        queryClient.invalidateQueries(['dashboard', 'reminders']);
        queryClient.invalidateQueries(['dashboard', 'stats']);
      },
      onError: handleRequestError
    }
  );

  const topClients = useMemo(() => {
    const clients =
      statsData?.topClients ||
      statsData?.clients?.top ||
      statsData?.clients ||
      [];

    return Array.isArray(clients)
      ? clients.map((client) => ({
          id: client.id ?? client.client_id ?? client.email ?? client.name,
          name: client.name ?? client.full_name ?? '-',
          company: client.company ?? client.company_name ?? '',
          status: client.status ?? client.stage ?? ''
        }))
      : [];
  }, [statsData]);

  const summaryStats = useMemo(() => {
    if (!statsData) {
      return {
        labels: {
          clients: t('stats_clients'),
          interactions: t('stats_interactions'),
          reminders: t('stats_reminders')
        },
        totals: { clients: 0, interactions: 0, reminders: 0 },
        trends: {},
        activity: [],
        progress: []
      };
    }

    const totals = statsData.totals ?? {
      clients:
        statsData.clientsTotal ??
        statsData.totalClients ??
        statsData.clients_count ??
        statsData.clients?.total ??
        0,
      interactions:
        statsData.interactionsTotal ??
        statsData.totalInteractions ??
        statsData.interactions_count ??
        statsData.interactions?.total ??
        0,
      reminders:
        statsData.remindersTotal ??
        statsData.totalReminders ??
        statsData.reminders_count ??
        statsData.reminders?.total ??
        0
    };

    const trends = statsData.trends ?? {
      clients: statsData.clientsTrend,
      interactions: statsData.interactionsTrend,
      reminders: statsData.remindersTrend
    };

    const reminderCompleted =
      statsData.completedReminders ?? statsData.reminders?.completed ?? 0;
    const reminderOverdue = statsData.overdueReminders ?? 0;
    const reminderTotal = totals.reminders || reminderCompleted + reminderOverdue;

    const progress =
      statsData.progressIndicators ?? statsData.progress ?? [
        {
          label: t('progress_completed_reminders'),
          value: reminderCompleted,
          total: reminderTotal,
          accent: 'bg-emerald-400'
        },
        {
          label: t('progress_overdue_reminders'),
          value: reminderOverdue,
          total: reminderTotal,
          accent: 'bg-rose-400'
        },
        {
          label: t('progress_engagement_level'),
          value: statsData.engagementScore ?? 0,
          total: 100,
          accent: 'bg-sky-400'
        }
      ];

    const normalizedProgress = progress.map((item) => ({
      label: item.label ?? t('progress_indicator'),
      value: Number(item.value ?? 0),
      total: Number(item.total ?? 0) || 0,
      accent: item.accent
    }));

    const activity =
      statsData.activity ??
      statsData.activityChart ??
      statsData.weeklyActivity ??
      [];

    const normalizedActivity = Array.isArray(activity)
      ? activity
          .map((item) => ({
            label: item.label ?? item.day ?? item.date ?? '',
            value: Number(item.value ?? item.count ?? 0)
          }))
          .filter((item) => item.label)
      : [];

    return {
      labels: {
        clients: t('stats_clients'),
        interactions: t('stats_interactions'),
        reminders: t('stats_reminders')
      },
      totals,
      trends,
      progress: normalizedProgress,
      activity: normalizedActivity
    };
  }, [statsData, t]);

  const reminders = useMemo(() => {
    const source = Array.isArray(remindersData?.items) ? remindersData.items : remindersData;
    if (!Array.isArray(source)) {
      return [];
    }

    return source.map((reminder) => ({
      id: reminder.id ?? reminder.reminder_id,
      title: reminder.title ?? reminder.subject ?? t('reminder_without_title'),
      clientName: reminder.client?.name ?? reminder.clientName ?? reminder.client ?? '-',
      dueDate: formatDate(reminder.due_date ?? reminder.dueDate ?? reminder.due_at)
    }));
  }, [remindersData, t]);

  const interactions = useMemo(() => {
    const source = Array.isArray(interactionsData?.items) ? interactionsData.items : interactionsData;
    if (!Array.isArray(source)) {
      return [];
    }

    return source.map((interaction) => ({
      id: interaction.id ?? interaction.interaction_id,
      subject: interaction.subject ?? interaction.type ?? t('interaction_without_subject'),
      clientName: interaction.client?.name ?? interaction.clientName ?? interaction.client ?? '-',
      happenedAt: formatDate(interaction.created_at ?? interaction.happenedAt ?? interaction.date)
    }));
  }, [interactionsData, t]);

  const handleCompleteReminder = useCallback(
    (reminder) => {
      if (!reminder?.id || !apiClient) return;
      completeReminderMutation.mutate(reminder);
    },
    [apiClient, completeReminderMutation]
  );

  const handleClientSelect = useCallback(
    (client) => {
      setSearchValue('');
      toast({ title: t('search_result_selected'), description: client.name });
      if (client.id) {
        router.push(`/clients/${client.id}`).catch(() => {
          // ignore routing errors in case the page is not implemented yet
        });
      }
    },
    [router, t, toast]
  );

  const quickActions = useMemo(
    () => [
      {
        label: t('quick_action_create_client'),
        onClick: () => router.push('/clients/create').catch(() => {})
      },
      {
        label: t('quick_action_add_interaction'),
        onClick: () => router.push('/interactions/create').catch(() => {})
      },
      {
        label: t('quick_action_create_reminder'),
        onClick: () => router.push('/reminders/create').catch(() => {})
      }
    ],
    [router, t]
  );

  if (isChecking || !apiClient) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('loading')}</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 px-4 py-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DashboardHeader
          greeting={currentUser?.name ? t('dashboard_greeting', { name: currentUser.name }) : t('dashboard')}
          subtitle={t('dashboard_subtitle')}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          isSearching={isSearching}
          searchPlaceholder={t('dashboard_search_placeholder')}
          searchResults={searchResults}
          onClientSelect={handleClientSelect}
          profileLabel={t('dashboard_search_hint')}
          quickLink={{ href: '/clients', label: t('dashboard_open_clients') }}
          onToggleTheme={toggleTheme}
          isDark={isDark}
          themeLabel={isDark ? t('theme_night') : t('theme_day')}
        />

        <StatsCards stats={summaryStats} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityChart
              title={t('activity_widget_title')}
              description={t('activity_widget_description')}
              data={summaryStats.activity}
            />
          </div>
          <ProgressIndicators title={t('progress_title')} indicators={summaryStats.progress} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RemindersWidget
            title={t('reminders_title')}
            emptyState={t('reminders_empty')}
            reminders={reminders}
            onComplete={handleCompleteReminder}
          />
          <InteractionsFeed
            title={t('interactions_title')}
            emptyState={t('interactions_empty')}
            interactions={interactions}
          />
        </div>

        <TopClientsTable title={t('top_clients_title')} clients={topClients} emptyState={t('top_clients_empty')} />

        <QuickActions title={t('quick_actions_title')} actions={quickActions} />
      </div>
    </main>
  );
}
