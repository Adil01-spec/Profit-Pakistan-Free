'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHistory } from '@/hooks/use-history';
import type { HistoryRecord, LaunchPlan, FeasibilityCheck } from '@/lib/types';
import { Header } from '@/components/header';
import { Loader2 } from 'lucide-react';
import { ResultDisplay } from '@/components/history/result-display';

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { history, loading } = useHistory();

  const [record, setRecord] = useState<HistoryRecord | null>(null);

  useEffect(() => {
    if (!loading && typeof id === 'string') {
      const foundRecord = history.find((r) => r.id === id);
      if (foundRecord) {
        setRecord(foundRecord);
      } else {
        router.push('/history');
      }
    }
  }, [id, history, loading, router]);

  if (loading || !record) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
            {record.type === 'Launch' && <ResultDisplay record={record as LaunchPlan} />}
            {record.type === 'Feasibility' && <ResultDisplay record={record as FeasibilityCheck} />}
        </div>
      </main>
    </div>
  );
}
