
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useLocalStorage } from 'usehooks-ts';

interface StoredInsight {
  insight: string;
  date: string;
}

export function DailyInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storedInsight, setStoredInsight] = useLocalStorage<StoredInsight | null>('dailyInsight', null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    const fetchInsight = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/daily-insight');
        if (!response.ok) {
          throw new Error('Failed to fetch insight from API.');
        }
        const data = await response.json();
        const newInsight = data.insight;
        setInsight(newInsight);
        setStoredInsight({ insight: newInsight, date: today });
      } catch (e: any) {
        console.error(e);
        setError("Couldn’t load today’s tip. Try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (storedInsight && storedInsight.date === today) {
      setInsight(storedInsight.insight);
      setIsLoading(false);
    } else {
      fetchInsight();
    }
  }, [setStoredInsight, storedInsight]);

  return (
    <Card className="mb-8 bg-accent/20 border-accent/50">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="p-2 rounded-full bg-accent/30 text-accent-foreground">
          <BrainCircuit className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">🧠 Daily Insight</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Fetching today's tip...</span>
          </div>
        )}
        {error && (
            <p className="text-sm text-destructive">{error}</p>
        )}
        {!isLoading && !error && insight && (
             <p className="text-muted-foreground italic">"{insight}"</p>
        )}
      </CardContent>
    </Card>
  );
}
