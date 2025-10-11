'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getHistoryRecord } from '@/lib/firebase-service';
import type { HistoryRecord, LaunchPlan, FeasibilityCheck } from '@/lib/types';
import { Header } from '@/components/header';
import { Loader2 } from 'lucide-react';
import { ResultDisplay } from '@/components/history/result-display';

export default function ReportDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [record, setRecord] = useState<HistoryRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    if (typeof id === 'string') {
      const fetchRecord = async () => {
        setLoading(true);
        const fetchedRecord = await getHistoryRecord(user.uid, id);
        if (fetchedRecord) {
          setRecord(fetchedRecord);
        } else {
          // Handle not found
          router.push('/history');
        }
        setLoading(false);
      };
      fetchRecord();
    }
  }, [id, user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!record) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex flex-1 items-center justify-center">
                <p>Report not found.</p>
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
