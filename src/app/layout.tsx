
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { SettingsProvider } from '@/hooks/use-settings';
import { HistoryProvider } from '@/hooks/use-history';
import Script from 'next/script';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { UsageProvider } from '@/hooks/use-usage';
import { Header } from '@/components/header';

export const metadata: Metadata = {
  title: 'Profit Pakistan Pro',
  description: 'Analyze financial feasibility for your Shopify store in Pakistan.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXX"
            crossOrigin="anonymous"
            strategy="lazyOnload"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <Providers>
          <FirebaseClientProvider>
            <SettingsProvider>
              <HistoryProvider>
                <UsageProvider>
                    <Header />
                    <main>{children}</main>
                    <Toaster />
                </UsageProvider>
              </HistoryProvider>
            </SettingsProvider>
          </FirebaseClientProvider>
        </Providers>
      </body>
    </html>
  );
}
