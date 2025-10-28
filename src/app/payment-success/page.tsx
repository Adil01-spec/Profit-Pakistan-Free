
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { verifySafepayPayment } from '@/app/actions/safepay';
import { Logo } from '@/components/logo';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const order_id = searchParams.get('order_id');

    if (!order_id) {
      setErrorMessage('No order ID found. Cannot verify payment.');
      setStatus('failed');
      return;
    }

    const verifyPayment = async () => {
      const result = await verifySafepayPayment(order_id);

      if (result.success && result.email) {
        setStatus('success');
        toast({
          title: '✅ Upgrade Successful!',
          description: 'Your payment has been verified. Welcome to Pro!',
        });
        
        // Redirect to signup page with email pre-filled
        setTimeout(() => {
          router.push(`/signup?email=${encodeURIComponent(result.email!)}`);
        }, 3000);

      } else {
        setErrorMessage(result.error || 'Payment verification failed. Please contact support.');
        setStatus('failed');
        toast({
          variant: 'destructive',
          title: '⚠️ Payment Verification Failed',
          description: result.error || 'Please contact support with your order ID.',
        });
      }
    };

    verifyPayment();
  }, [searchParams, router, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
            <div className="mx-auto mb-4">
                <Logo />
            </div>
          <CardTitle className="text-2xl font-bold">Payment Verification</CardTitle>
          <CardDescription>
            Please wait while we securely verify your payment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'verifying' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p>Verifying your transaction...</p>
            </div>
          )}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="font-semibold text-lg">Payment Verified!</p>
              <p className="text-muted-foreground">Your Pro account is ready. Redirecting you to create your account...</p>
            </div>
          )}
          {status === 'failed' && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="font-semibold text-lg">Verification Failed</p>
              <p className="text-muted-foreground">{errorMessage}</p>
              <Button onClick={() => router.push('/')}>Back to Home</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}

