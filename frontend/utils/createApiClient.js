import axios from 'axios';
import getApiUrl from '@/utils/getApiUrl';

export default function createApiClient(token, { onUnauthorized } = {}) {
  const instance = axios.create({
    baseURL: getApiUrl(),
    headers: {
      'Content-Type': 'application/json'
    }
  });

  instance.interceptors.request.use((config) => {
    const nextConfig = { ...config };
    if (token) {
      nextConfig.headers = {
        ...nextConfig.headers,
        Authorization: `Bearer ${token}`
      };
    }
    return nextConfig;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && typeof onUnauthorized === 'function') {
        onUnauthorized();
      }
      return Promise.reject(error);
    }
  );

  return instance;
}
