
'use client';

import type { HistoryRecord } from '@/lib/types';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, BarChart3, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useHistory } from '@/hooks/use-history';


interface HistoryListProps {
  history: HistoryRecord[];
  loading: boolean;
}

export function HistoryList({ history, loading }: HistoryListProps) {
  const { toast } = useToast();
  const { removeHistoryRecord, isPersistent } = useHistory();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (reportId: string) => {
    setDeletingId(reportId);
    try {
      removeHistoryRecord(reportId);
      toast({
        title: 'Report Deleted 🗑️',
        description: 'The report has been removed from this session.',
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: 'Deletion Failed',
        description: 'Something went wrong while deleting this report.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };


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
          No reports found for this session.
        </h3>
        <p className="text-sm text-muted-foreground">
          Reports are cleared when you close the tab.
        </p>
        <Button asChild className="mt-4">
          <Link href="/planner/new">Create First Report</Link>
        </Button>
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
        <div key={record.id} className="group relative transition-colors hover:bg-muted/50">
          <Link
            href={`/history/${record.id}`}
            className="block"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4 overflow-hidden">
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
                <div className="overflow-hidden">
                  <p className="font-semibold truncate">{record.productName}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {format(new Date(record.date), 'PP')} &middot; {record.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-2">
                <Badge variant={getStatusVariant(record.profitStatus) as any} className="hidden sm:inline-flex">
                  {record.profitStatus}
                </Badge>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-opacity group-hover:opacity-0" />
              </div>
            </div>
          </Link>

           <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 flex items-center">
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete Report</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the report
                    for "{record.productName}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={(e) => { e.preventDefault(); handleDelete(record.id)}}
                    disabled={deletingId === record.id}
                  >
                    {deletingId === record.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete Report
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
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
