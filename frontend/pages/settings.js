import { useEffect } from 'react';
import axios from 'axios';
import AdminPanel from '@/components/AdminPanel';
import useStore from '@/state/useStore';
import useTranslations from '@/hooks/useTranslations';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Settings() {
  const { t } = useTranslations();
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    if (!token || currentUser) return;

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.user) {
          setCurrentUser(response.data.user);
        }
      } catch (error) {
        console.error('Не удалось получить пользователя', error);
      }
    };

    fetchUser();
  }, [currentUser, setCurrentUser]);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">{t('settings')}</h1>
      </header>
      <AdminPanel currentUser={currentUser} />
    </main>
  );
}
