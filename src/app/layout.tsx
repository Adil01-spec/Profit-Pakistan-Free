
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { SettingsProvider } from '@/hooks/use-settings';
import { HistoryProvider } from '@/hooks/use-history';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import Script from 'next/script';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Profit Pakistan (Free)',
  description: 'A free profitability and ROAS calculator designed for Pakistani entrepreneurs.',
};

function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <>
        <Providers>
          <FirebaseClientProvider>
            <SettingsProvider>
              <HistoryProvider>
                <Header />
                <main className="flex-grow">{children}</main>
                <Toaster />
                <Footer />
              </HistoryProvider>
            </SettingsProvider>
          </FirebaseClientProvider>
        </Providers>
        <Script
            id="adsbygoogle-script"
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXX"
            crossOrigin="anonymous"
            strategy="lazyOnload"
        />
    </>
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
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
