
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
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Profit Pakistan (Free)',
  description: 'A free profitability and ROAS calculator designed for Pakistani entrepreneurs to analyze products, marketing performance, and ad ROI.',
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
      </head>
      <body className={cn('font-body antialiased flex flex-col min-h-screen')}>
        <Providers>
          <FirebaseClientProvider>
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
          </FirebaseClientProvider>
        </Providers>
        <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXX"
            crossOrigin="anonymous"
            strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
