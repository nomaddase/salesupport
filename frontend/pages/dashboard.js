import { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import useStore from '@/state/useStore';
import useTranslations from '@/hooks/useTranslations';
import useAuthGuard from '@/hooks/useAuthGuard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const { t } = useTranslations();
  const { token, isAuthenticated, isChecking, clearToken } = useAuthGuard();
  const [socket, setSocket] = useState(null);
  const clients = useStore((state) => state.clients);
  const setClients = useStore((state) => state.setClients);
  const setCurrentUser = useStore((state) => state.setCurrentUser);

  useEffect(() => {
    if (!token) return;

    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.user) {
          setCurrentUser(response.data.user);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          clearToken();
        }
        console.error('Не удалось получить пользователя', error);
      }
    };

    const fetchClients = async () => {
      try {
        const response = await axios.get(`${API_URL}/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          clearToken();
        }
        console.error('Не удалось загрузить клиентов', error);
      }
    };

    fetchCurrentUser();
    fetchClients();
  }, [clearToken, setClients, setCurrentUser, token]);

  useEffect(() => {
    if (!token) return undefined;

    const socketInstance = io(API_URL, {
      transports: ['websocket'],
      auth: { token }
    });
    socketInstance.on('connect', () => {
      setSocket(socketInstance);
    });
    socketInstance.on('disconnect', () => {
      setSocket(null);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  const highPriority = useMemo(
    () => clients.filter((client) => client.priority === 'high'),
    [clients]
  );

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">{t('loading')}</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">{t('dashboard')}</h1>
        <p className="text-slate-600">{t('clients')}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-slate-700">{t('total_clients')}</h2>
          <p className="text-4xl font-bold text-slate-900">{clients.length}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-slate-700">{t('high_priority')}</h2>
          <p className="text-4xl font-bold text-rose-500">{highPriority.length}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-slate-700">{t('socket_status')}</h2>
          <p className="text-sm text-slate-500">{socket ? t('connected') : t('connecting')}</p>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">{t('client_list')}</h2>
        </div>
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  {t('name')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  {t('status')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  {t('priority')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-slate-700">{client.name}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-slate-500">{client.status}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        client.priority === 'high'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {client.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
