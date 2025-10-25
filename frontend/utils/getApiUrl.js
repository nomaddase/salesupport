const SERVER_DEFAULT = process.env.NEXT_PUBLIC_API_URL || 'http://45.136.57.52:8000';

export default function getApiUrl() {
  if (typeof window === 'undefined') {
    return SERVER_DEFAULT;
  }

  if (process.env.NEXT_PUBLIC_API_URL_BROWSER) {
    return process.env.NEXT_PUBLIC_API_URL_BROWSER;
  }

  try {
    const parsed = new URL(SERVER_DEFAULT);
    const hostname = window.location.hostname || parsed.hostname;
    const port = parsed.port ? `:${parsed.port}` : '';
    const pathname = parsed.pathname ? parsed.pathname.replace(/\/$/, '') : '';

    return `${parsed.protocol}//${hostname}${port}${pathname}`;
  } catch (error) {
    console.warn('Failed to parse API URL, falling back to server default', error);
    return SERVER_DEFAULT;
  }
}
