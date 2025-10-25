import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';

export default function useAuthGuard(redirectTo = '/login') {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const redirectIfNeeded = useCallback(() => {
    if (router.pathname !== redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router.pathname, router]);

  const clearToken = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem('token');
    setToken(null);
    setIsChecking(false);
    redirectIfNeeded();
  }, [redirectIfNeeded]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkToken = () => {
      const storedToken = window.localStorage.getItem('token');
      if (!storedToken) {
        clearToken();
        return;
      }

      setToken(storedToken);
      setIsChecking(false);
    };

    checkToken();

    const handleStorage = () => {
      if (typeof window === 'undefined') return;
      const storedToken = window.localStorage.getItem('token');
      if (!storedToken) {
        clearToken();
      } else {
        setToken(storedToken);
        setIsChecking(false);
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [clearToken]);

  return { token, isAuthenticated: Boolean(token), isChecking, clearToken };
}
