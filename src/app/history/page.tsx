
'use client';

import { useHistory } from '@/hooks/use-history';
import { HistoryList } from '@/components/history/history-list';
import { Card, CardContent } from '@/components/ui/card';
import { SettingsDialog } from '@/components/settings-dialog';
import { AdBanner } from '@/components/ad-banner';

export default function HistoryPage() {
  const { history, loading } = useHistory();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              All Reports
            </h1>
            <SettingsDialog />
          </div>
          <Card>
            <CardContent className="p-0">
              <HistoryList history={history} loading={loading} />
            </CardContent>
          </Card>
          <AdBanner />
        </div>
      </main>
    </div>
  );
}
