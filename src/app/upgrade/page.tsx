
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

const freeFeatures = [
  'Basic Profitability Calculations',
  'Ad Feasibility Analysis',
  'Manual Data Entry',
  '5 Daily Report Exports',
  '10 Daily AI Prompts',
];

const proFeatures = [
  'All Free Features, plus:',
  'Advanced Profit & ROAS Dashboards',
  'Automated Data Sync (Shopify)',
  'AI-Powered Growth Insights',
  'Unlimited Report Exports',
  'Unlimited AI Marketing Prompts',
  'Priority Support',
];

export default function UpgradePage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] w-full flex-col items-center justify-center bg-background p-4 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Find the Right Plan for You
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start for free, and unlock powerful tools when you're ready to
            grow.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Free Plan Card */}
          <Card className="flex flex-col border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Profit Pakistan</CardTitle>
              <CardDescription>
                Essential tools for starting entrepreneurs.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <p className="text-4xl font-bold">
                ₨ 0 <span className="text-lg font-normal">/ forever</span>
              </p>
              <ul className="space-y-3">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Your Current Plan</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan Card */}
          <Card className="relative flex flex-col border-2 border-primary shadow-2xl shadow-primary/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
              Most Popular
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Profit Pakistan Pro</CardTitle>
              <CardDescription>
                Advanced tools for serious growth.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <p className="text-4xl font-bold">
                ₨ 799 <span className="text-lg font-normal">/ month</span>
              </p>
              <ul className="space-y-3">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex-col items-center gap-2">
              <Button
                size="lg"
                className="w-full cursor-not-allowed bg-gray-300 opacity-70 hover:bg-gray-300 dark:bg-gray-700"
                disabled
              >
                Coming Soon 🚀
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Profit Pakistan Pro is under final development. Stay tuned for
                early access!
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
