import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import useTranslations from '@/hooks/useTranslations';
import getApiUrl from '@/utils/getApiUrl';

const roleOptions = [
  { value: 'admin', labelKey: 'role_admin' },
  { value: 'manager', labelKey: 'role_manager' },
  { value: 'supervisor', labelKey: 'role_supervisor' }
];

function useAuthToken() {
  const [token, setToken] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('token');
    if (saved) {
      setToken(saved);
    }
  }, []);

  return token;
}

function UserManager({ token }) {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'manager' });
  const [editingUser, setEditingUser] = useState(null);
  const [editingForm, setEditingForm] = useState({ name: '', email: '', role: 'manager', password: '' });
  const apiUrl = getApiUrl();

  const usersQuery = useQuery(
    ['admin-users', token, apiUrl],
    async () => {
      const response = await axios.get(`${apiUrl}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    { enabled: Boolean(token) }
  );

  const createUser = useMutation(
    async (payload) => {
      await axios.post(`${apiUrl}/admin/users`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        setForm({ name: '', email: '', password: '', role: 'manager' });
        queryClient.invalidateQueries(['admin-users']);
      }
    }
  );

  const updateUser = useMutation(
    async ({ id, data }) => {
      await axios.patch(`${apiUrl}/admin/users/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        setEditingUser(null);
        queryClient.invalidateQueries(['admin-users']);
      }
    }
  );

  const deleteUser = useMutation(
    async (id) => {
      await axios.delete(`${apiUrl}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-users']);
      }
    }
  );

  const users = usersQuery.data?.items ?? [];
  const isLoading = useMemo(
    () => usersQuery.isLoading || usersQuery.isFetching,
    [usersQuery.isLoading, usersQuery.isFetching]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    createUser.mutate(form);
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    if (!editingUser) return;
    const payload = {};
    if (editingForm.name !== editingUser.name) payload.name = editingForm.name;
    if (editingForm.email !== editingUser.email) payload.email = editingForm.email;
    if (editingForm.role !== editingUser.role) payload.role = editingForm.role;
    if (editingForm.password) payload.password = editingForm.password;
    updateUser.mutate({ id: editingUser.id, data: payload });
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{t('user_management')}</h2>
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
          onClick={() => usersQuery.refetch()}
        >
          {t('refresh')}
        </button>
      </header>

      {isLoading ? (
        <p className="text-sm text-slate-500">{t('loading')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('name')}</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('email')}</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('user_role')}</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-sm text-slate-500">
                    {t('no_users')}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-slate-700">{user.name}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-slate-500">{user.email}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-slate-500">{t(`role_${user.role}`)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-slate-500">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-200"
                          onClick={() => {
                            setEditingUser(user);
                            setEditingForm({ name: user.name, email: user.email, role: user.role, password: '' });
                          }}
                        >
                          {t('edit_user')}
                        </button>
                        <button
                          type="button"
                          className="rounded bg-rose-100 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-200"
                          onClick={() => deleteUser.mutate(user.id)}
                        >
                          {t('delete_user')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700">{t('name')}</label>
          <input
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700">{t('email')}</label>
          <input
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700">{t('password')}</label>
          <input
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700">{t('user_role')}</label>
          <select
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            {t('add_user')}
          </button>
        </div>
      </form>

      {editingUser && (
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleEditSubmit}>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700">{t('name')}</label>
            <input
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={editingForm.name}
              onChange={(event) => setEditingForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700">{t('email')}</label>
            <input
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              type="email"
              value={editingForm.email}
              onChange={(event) => setEditingForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700">{t('password')}</label>
            <input
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              type="password"
              value={editingForm.password}
              onChange={(event) => setEditingForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="••••••"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700">{t('user_role')}</label>
            <select
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={editingForm.role}
              onChange={(event) => setEditingForm((prev) => ({ ...prev, role: event.target.value }))}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4 md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              {t('save')}
            </button>
            <button
              type="button"
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600 hover:bg-slate-200"
              onClick={() => setEditingUser(null)}
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function ApiKeyManager({ token }) {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', service: '', key_value: '' });
  const [editingKey, setEditingKey] = useState(null);
  const [editingForm, setEditingForm] = useState({ name: '', service: '', key_value: '' });

  const apiKeysQuery = useQuery(
    ['admin-api-keys', token],
    async () => {
      const response = await axios.get(`${API_URL}/admin/api-keys`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    { enabled: Boolean(token) }
  );

  const createApiKey = useMutation(
    async (payload) => {
      await axios.post(`${API_URL}/admin/api-keys`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        setForm({ name: '', service: '', key_value: '' });
        queryClient.invalidateQueries(['admin-api-keys']);
      }
    }
  );

  const updateApiKey = useMutation(
    async ({ id, data }) => {
      await axios.patch(`${API_URL}/admin/api-keys/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        setEditingKey(null);
        queryClient.invalidateQueries(['admin-api-keys']);
      }
    }
  );

  const deleteApiKey = useMutation(
    async (id) => {
      await axios.delete(`${API_URL}/admin/api-keys/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-api-keys']);
      }
    }
  );

  const apiKeys = apiKeysQuery.data?.items ?? [];
  const isLoading = useMemo(
    () => apiKeysQuery.isLoading || apiKeysQuery.isFetching,
    [apiKeysQuery.isLoading, apiKeysQuery.isFetching]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    createApiKey.mutate(form);
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    if (!editingKey) return;
    const payload = {};
    if (editingForm.name !== editingKey.name) payload.name = editingForm.name;
    if (editingForm.service !== editingKey.service) payload.service = editingForm.service;
    if (editingForm.key_value) payload.key_value = editingForm.key_value;
    updateApiKey.mutate({ id: editingKey.id, data: payload });
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{t('api_key_management')}</h2>
        <button
          type="button"
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
          onClick={() => apiKeysQuery.refetch()}
        >
          {t('refresh')}
        </button>
      </header>

      {isLoading ? (
        <p className="text-sm text-slate-500">{t('loading')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('name')}</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('api_service')}</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('api_key_value')}</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{t('created_at')}</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {apiKeys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-sm text-slate-500">
                    {t('no_api_keys')}
                  </td>
                </tr>
              ) : (
                apiKeys.map((apiKey) => (
                  <tr key={apiKey.id}>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-slate-700">{apiKey.name}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-slate-500">{apiKey.service}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-slate-500">{apiKey.key_value}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-slate-500">
                      {new Date(apiKey.created_at).toLocaleString('ru-RU')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-slate-500">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-200"
                          onClick={() => {
                            setEditingKey(apiKey);
                            setEditingForm({ name: apiKey.name, service: apiKey.service, key_value: '' });
                          }}
                        >
                          {t('edit_user')}
                        </button>
                        <button
                          type="button"
                          className="rounded bg-rose-100 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-200"
                          onClick={() => deleteApiKey.mutate(apiKey.id)}
                        >
                          {t('delete_user')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <form className="mt-6 grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700">{t('name')}</label>
          <input
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700">{t('api_service')}</label>
          <input
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.service}
            onChange={(event) => setForm((prev) => ({ ...prev, service: event.target.value }))}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-700">{t('api_key_value')}</label>
          <input
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={form.key_value}
            onChange={(event) => setForm((prev) => ({ ...prev, key_value: event.target.value }))}
            required
          />
        </div>
        <div className="md:col-span-3">
          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            {t('add_key')}
          </button>
        </div>
      </form>

      {editingKey && (
        <form className="mt-6 grid gap-4 md:grid-cols-3" onSubmit={handleEditSubmit}>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700">{t('name')}</label>
            <input
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={editingForm.name}
              onChange={(event) => setEditingForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700">{t('api_service')}</label>
            <input
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={editingForm.service}
              onChange={(event) => setEditingForm((prev) => ({ ...prev, service: event.target.value }))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700">{t('api_key_value')}</label>
            <input
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={editingForm.key_value}
              onChange={(event) => setEditingForm((prev) => ({ ...prev, key_value: event.target.value }))}
              placeholder="••••••"
            />
          </div>
          <div className="flex items-center gap-4 md:col-span-3">
            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              {t('save')}
            </button>
            <button
              type="button"
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600 hover:bg-slate-200"
              onClick={() => setEditingKey(null)}
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default function AdminPanel({ currentUser }) {
  const { t } = useTranslations();
  const token = useAuthToken();

  if (!currentUser) {
    return (
      <section className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow">
        {t('loading')}
      </section>
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <section className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow">
        {t('access_denied')}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">{t('admin_panel')}</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <UserManager token={token} />
        <ApiKeyManager token={token} />
      </div>
    </div>
  );
}
