import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useState } from 'react';
import { ToastProvider } from '@/components/ui/ToastProvider';

function App({ Component, pageProps }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
