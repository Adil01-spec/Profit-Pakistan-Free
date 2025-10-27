
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function PaymentFailedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
           <div className="mx-auto mb-4">
                <Logo />
            </div>
          <CardTitle className="text-2xl font-bold">Payment Unsuccessful</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <XCircle className="h-12 w-12 text-destructive" />
          <CardDescription>
            Your payment was cancelled or failed. Your card has not been charged.
          </CardDescription>
          <div className="flex gap-4 mt-4">
             <Button onClick={() => router.push('/upgrade')}>Try Again</Button>
             <Button variant="outline" onClick={() => router.push('/')}>Back to Home</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
