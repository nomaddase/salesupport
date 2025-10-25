import { useEffect } from 'react';
import axios from 'axios';
import AdminPanel from '@/components/AdminPanel';
import useStore from '@/state/useStore';
import useTranslations from '@/hooks/useTranslations';
import useAuthGuard from '@/hooks/useAuthGuard';
import getApiUrl from '@/utils/getApiUrl';

export default function Admin() {
  const { t } = useTranslations();
  const { token, isAuthenticated, isChecking, clearToken } = useAuthGuard();
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const apiUrl = getApiUrl();

  useEffect(() => {
    if (!token || currentUser) return;

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${apiUrl}/auth/me`, {
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

    fetchUser();
  }, [apiUrl, clearToken, currentUser, setCurrentUser, token]);

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
      <AdminPanel currentUser={currentUser} />
    </main>
  );
}
