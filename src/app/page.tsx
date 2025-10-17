
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, BarChart3, ChevronRight } from 'lucide-react';
import { Header } from '@/components/header';
import { HistoryList } from '@/components/history/history-list';
import { useHistory } from '@/hooks/use-history';
import { AdBanner } from '@/components/ad-banner';

export default function DashboardPage() {
  const { history, loading: historyLoading } = useHistory();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          <section className="mb-8">
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Welcome to Profit Pakistan Pro!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your financial co-pilot for e-commerce in Pakistan. What would you like to analyze today?
            </p>
          </section>

          <section className="mb-12 grid gap-6 md:grid-cols-2">
            <Link href="/planner/new" passHref>
              <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-accent p-3">
                    <Lightbulb className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-xl">Plan a New Product Launch</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">
                    Estimate profit margins and breakeven points for your next big product idea.
                  </p>
                </CardContent>
                <div className="bg-muted/50 px-6 py-3 text-sm font-medium text-primary flex items-center">
                  Start Planning <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </Card>
            </Link>
            <Link href="/feasibility/new" passHref>
              <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-accent p-3">
                    <BarChart3 className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-xl">Check Ad Feasibility</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">
                    Analyze the profitability of your current ad campaigns and find your breakeven ROAS.
                  </p>
                </CardContent>
                <div className="bg-muted/50 px-6 py-3 text-sm font-medium text-primary flex items-center">
                  Check Feasibility <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </Card>
            </Link>
          </section>

          <AdBanner />

          <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold tracking-tight">Recent Reports</h2>
                {history.length > 5 && (
                    <Button asChild variant="ghost" className="text-primary">
                        <Link href="/history">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                )}
            </div>
            <Card>
              <CardContent className="p-0">
                <HistoryList history={history.slice(0, 5)} loading={historyLoading} />
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
