
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { SettingsProvider } from '@/hooks/use-settings';
import { HistoryProvider } from '@/hooks/use-history';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { UsageProvider } from '@/hooks/use-usage';

export const metadata: Metadata = {
  title: 'Profit Pakistan',
  description: 'A profitability and ROAS calculator designed for Pakistani entrepreneurs.',
};

function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <Providers>
        <SettingsProvider>
          <HistoryProvider>
            <UsageProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Toaster />
              <Footer />
            </UsageProvider>
          </HistoryProvider>
        </SettingsProvider>
    </Providers>
  );
}


export default function RootLayout({ children }: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased flex flex-col min-h-screen')}>
        <FirebaseProvider>
          <ClientWrapper>{children}</ClientWrapper>
        </FirebaseProvider>
      </body>
    </html>
  );
}
