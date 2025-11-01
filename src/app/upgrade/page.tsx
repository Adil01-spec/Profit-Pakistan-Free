'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, CheckCircle, Upload } from "lucide-react"
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { useFirebase } from "@/firebase/provider";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";


const paymentSchema = z.object({
  name: z.string().min(3, "Full name is required."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(11, "Please enter a valid 11-digit phone number."),
  paymentMethod: z.enum(["JazzCash", "EasyPaisa", "Bank Transfer"]),
  transactionId: z.string().optional(),
  screenshot: z.any().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

function UpgradeHeader() {
    return (
      <div className="absolute top-6 left-6 flex items-center gap-2 mb-4">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
}

export default function UpgradePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      paymentMethod: "JazzCash",
      transactionId: "",
    }
  });

  const onSubmit = async (data: PaymentFormValues) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database service is not available.' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addDoc(collection(firestore, 'proRequests'), {
        name: data.name,
        email: data.email,
        phone: data.phone,
        paymentId: 'SP' + Date.now(),
        status: 'pending',
        requestedAt: serverTimestamp()
      });
      setSubmissionSuccess(true);
       toast({
        title: "✅ Payment request submitted.",
        description: "We'll verify and send your Pro credentials soon.",
      });

    } catch (error) {
      console.error("Error submitting payment request: ", error);
      toast({
        variant: "destructive",
        title: "⚠️ Submission Failed",
        description: "Could not submit your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="min-h-screen px-6 py-12 bg-background flex items-center justify-center">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle>Request Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              ✅ Payment request submitted successfully! Please send your screenshot to our WhatsApp for faster approval. You’ll receive your login details within 24 hours after verification.
            </p>
            <Button onClick={() => router.push('/')}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-background text-foreground transition-colors duration-300 font-sans relative">
       <UpgradeHeader />
      <h1 className="text-3xl font-bold text-center mb-2 mt-8 sm:mt-0">Upgrade to Pro</h1>
      <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
        To upgrade to the Pro Plan for ₨599/month, please complete the payment using one of the methods below and submit the form for manual verification.
      </p>

      <Card className="max-w-xl mx-auto">
        <CardHeader>
            <CardTitle>Submit Payment Details</CardTitle>
            <CardDescription>Fill out this form after you've made the payment.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Ahmed Khan" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="ahmed.khan@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input type="tel" placeholder="03001234567" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a payment method" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="JazzCash">JazzCash</SelectItem>
                                    <SelectItem value="EasyPaisa">EasyPaisa</SelectItem>
                                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="transactionId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Transaction ID (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. 1234567890" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="screenshot"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Payment Screenshot (Optional)</FormLabel>
                            <FormControl>
                                <Input type="file" {...form.register('screenshot')} />
                            </FormControl>
                             <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit for Verification
                    </Button>
                </form>
            </Form>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
            <Alert>
                <AlertDescription className="text-center">
                    After completing payment, please send your payment screenshot to our WhatsApp at <strong>+92XXXXXXXXXX</strong> for quick verification.
                </AlertDescription>
            </Alert>
             <p className="text-xs text-muted-foreground text-center w-full">
                Note: Account verification is manual. Once your payment is confirmed, your Profit Pakistan Pro credentials will be emailed to you.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
