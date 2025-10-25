import { useMemo } from 'react';
import createApiClient from '@/utils/createApiClient';

export default function useApiClient(token, options = {}) {
  const { onUnauthorized } = options;

  return useMemo(() => {
    if (!token) {
      return null;
    }

    return createApiClient(token, { onUnauthorized });
  }, [onUnauthorized, token]);
}
