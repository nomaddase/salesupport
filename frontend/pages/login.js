import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import useTranslations from '@/hooks/useTranslations';
import useStore from '@/state/useStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Login() {
  const { t } = useTranslations();
  const router = useRouter();
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = window.localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('username', form.username);
      params.append('password', form.password);
      params.append('scope', '');

      const response = await axios.post(`${API_URL}/auth/login`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const token = response.data?.access_token;
      if (!token) {
        throw new Error('No token received');
      }

      window.localStorage.setItem('token', token);

      try {
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (meResponse.data?.user) {
          setCurrentUser(meResponse.data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (fetchError) {
        console.error('Не удалось получить пользователя', fetchError);
        setCurrentUser(null);
      }

      router.replace('/dashboard');
    } catch (loginError) {
      console.error('Ошибка входа', loginError);
      const message = loginError.response?.data?.detail;
      setError(typeof message === 'string' ? message : t('login_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-slate-900">{t('login_title')}</h1>
        <p className="mt-2 text-sm text-slate-500">{t('login_description')}</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700" htmlFor="username">
              {t('username')}
            </label>
            <input
              id="username"
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.username}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, username: event.target.value }))
              }
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              required
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('loading') : t('login_button')}
          </button>
        </form>
      </div>
    </main>
  );
}
