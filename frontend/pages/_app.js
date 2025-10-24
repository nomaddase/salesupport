import '@/styles/globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useState } from 'react';

function App({ Component, pageProps }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}

export default App;
