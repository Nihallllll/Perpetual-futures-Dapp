import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import App from './App';
import { wagmiConfig, chains } from './config/wagmi';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          <BrowserRouter>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1F2937',
                  color: '#F9FAFB',
                  border: '1px solid #374151',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#1F2937',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#1F2937',
                  },
                },
              }}
            />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  </StrictMode>
);