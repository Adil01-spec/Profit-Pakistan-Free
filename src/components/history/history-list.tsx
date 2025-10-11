'use client';

import type { HistoryRecord } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, BarChart3, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryListProps {
  history: HistoryRecord[];
  loading: boolean;
}

export function HistoryList({ history, loading }: HistoryListProps) {
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="py-16 text-center">
        <h3 className="text-lg font-medium text-muted-foreground">
          No reports found.
        </h3>
        <p className="text-sm text-muted-foreground">
          Start by planning a product or checking feasibility.
        </p>
      </div>
    );
  }

  const getStatusVariant = (status: HistoryRecord['profitStatus']) => {
    switch (status) {
      case 'Profitable':
        return 'success';
      case 'Near Breakeven':
        return 'warning';
      case 'Loss':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="divide-y">
      {history.map((record) => (
        <Link
          href={`/history/${record.id}`}
          key={record.id}
          className="block transition-colors hover:bg-muted/50"
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div
                className={cn('rounded-full p-2', {
                  'bg-green-100 dark:bg-green-900/30': record.type === 'Launch',
                  'bg-blue-100 dark:bg-blue-900/30': record.type === 'Feasibility',
                })}
              >
                {record.type === 'Launch' ? (
                  <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <p className="font-semibold">{record.productName}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(record.date), 'PP')} &middot; {record.category}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={getStatusVariant(record.profitStatus) as any}>
                {record.profitStatus}
              </Badge>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Add custom variants to BadgeProps
declare module '@/components/ui/badge' {
    interface BadgeProps {
        variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
    }
}
