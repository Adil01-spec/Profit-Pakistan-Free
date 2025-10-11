'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/header';
import { HistoryList } from '@/components/history/history-list';
import type { HistoryRecord } from '@/lib/types';
import { getUserHistory } from '@/lib/firebase-service';
import { Card, CardContent } from '@/components/ui/card';

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        setHistoryLoading(true);
        const userHistory = await getUserHistory(user.uid);
        setHistory(userHistory);
        setHistoryLoading(false);
      };
      fetchHistory();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            All Reports
          </h1>
          <Card>
            <CardContent className="p-0">
              <HistoryList history={history} loading={historyLoading} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
