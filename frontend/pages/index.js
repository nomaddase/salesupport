import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = window.localStorage.getItem('token');
    router.replace(token ? '/dashboard' : '/login');
  }, [router]);

  return null;
}
