'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { addHistoryRecord } from '@/lib/firebase-service';
import { banks } from '@/lib/banks';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Loader2 } from 'lucide-react';
import type { FeasibilityCheck } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  productName: z.string().min(2),
  category: z.string().min(2),
  sourcingCost: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(1),
  shopifyPlan: z.enum(['trial', 'regular']),
  shopifyMonthlyCost: z.coerce.number().min(0).optional(),
  bank: z.string().min(1, { message: 'Please select a bank.' }),
  debitCardTax: z.coerce.number().min(0),
  courierRate: z.coerce.number().min(0),
  adBudget: z.coerce.number().min(0),
  costPerConversion: z.coerce.number().min(1, { message: 'Cost per conversion must be at least 1.' }),
}).refine(data => data.shopifyPlan === 'trial' || (data.shopifyMonthlyCost !== undefined && data.shopifyMonthlyCost > 0), {
  message: 'Please enter your Shopify monthly cost.',
  path: ['shopifyMonthlyCost'],
}).refine(data => data.sellingPrice > data.sourcingCost, {
    message: "Selling price must be greater than sourcing cost.",
    path: ["sellingPrice"],
});

export default function FeasibilityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      category: '',
      sourcingCost: 0,
      sellingPrice: 0,
      shopifyPlan: 'trial',
      bank: '',
      debitCardTax: 1.5,
      courierRate: 200,
      adBudget: 0,
      costPerConversion: 0,
    },
  });
  
  const shopifyPlan = form.watch('shopifyPlan');

  const handleBankChange = (bankName: string) => {
    const selectedBank = banks.find(b => b.name === bankName);
    if (selectedBank) {
      form.setValue('debitCardTax', selectedBank.tax);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    setIsSubmitting(true);

    const { adBudget, costPerConversion, sellingPrice, sourcingCost, courierRate } = values;
    const shopifyCost = values.shopifyPlan === 'trial' ? 1 * 300 : (values.shopifyMonthlyCost || 0) * 300; // Approx USD to PKR
    const totalMonthlyFixedCosts = shopifyCost + adBudget;
    
    const profitPerSale = sellingPrice - sourcingCost - courierRate;
    const breakevenConversions = totalMonthlyFixedCosts > 0 && profitPerSale > 0 ? Math.ceil(totalMonthlyFixedCosts / profitPerSale) : 0;
    
    const conversionsPerMonth = adBudget > 0 && costPerConversion > 0 ? adBudget / costPerConversion : 0;
    const totalProfitPerMonth = conversionsPerMonth * profitPerSale;
    const netProfit = totalProfitPerMonth - shopifyCost;

    let profitStatus: FeasibilityCheck['profitStatus'] = 'Loss';
    let summary = "You're currently at a loss. You need more sales or lower costs to be profitable.";
    if (netProfit > 0) {
        profitStatus = 'Profitable';
        summary = `You are making an estimated profit of PKR ${netProfit.toLocaleString('en-US', {maximumFractionDigits: 0})}/month.`;
    } else if (netProfit > -totalMonthlyFixedCosts * 0.1) {
        profitStatus = 'Near Breakeven';
        summary = `You're close to breaking even. A small improvement in sales or costs could make you profitable.`;
    }

    const resultData: Omit<FeasibilityCheck, 'id' | 'userId' | 'date'> = {
        ...values,
        type: 'Feasibility',
        shopifyMonthlyCost: shopifyCost / 300,
        totalMonthlyFixedCosts,
        breakevenConversions,
        netProfit,
    };
    
    try {
        const docId = await addHistoryRecord(user.uid, { ...resultData, summary, profitStatus });
        toast({ title: "Report Saved!", description: "Your ad feasibility check has been saved."});
        router.push(`/history/${docId}`);
    } catch (error) {
        console.error("Error saving record: ", error);
        toast({ title: "Error", description: "Could not save your report.", variant: "destructive"});
        setIsSubmitting(false);
    }
  }

  if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (!user) { router.push('/login'); return null; }

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-2xl p-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Ad Feasibility Calculator</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="productName" render={({ field }) => (
                    <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Smart Watch" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Product Category</FormLabel><FormControl><Input placeholder="e.g., Electronics" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="sourcingCost" render={({ field }) => (
                        <FormItem><FormLabel>Sourcing Cost (per unit)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                        <FormItem><FormLabel>Selling Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="shopifyPlan" render={({ field }) => (
                    <FormItem className="space-y-3"><FormLabel>Shopify Plan Type</FormLabel><FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="trial" /></FormControl><FormLabel className="font-normal">"$1 for 3-month trial"</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="regular" /></FormControl><FormLabel className="font-normal">Regular Plan</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl><FormMessage /></FormItem>
                )} />
                {shopifyPlan === 'regular' && (
                    <FormField control={form.control} name="shopifyMonthlyCost" render={({ field }) => (
                        <FormItem><FormLabel>Shopify Monthly Cost (USD)</FormLabel><FormControl><Input type="number" placeholder="e.g., 29" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                )}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="bank" render={({ field }) => (
                        <FormItem><FormLabel>Bank for Payments</FormLabel>
                        <Select onValueChange={(value) => { field.onChange(value); handleBankChange(value); }} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a bank" /></SelectTrigger></FormControl>
                            <SelectContent>{banks.map(b => <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>)}</SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="debitCardTax" render={({ field }) => (
                        <FormItem><FormLabel>Debit Card Tax (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="adBudget" render={({ field }) => (
                        <FormItem><FormLabel>Ad Budget (monthly)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="costPerConversion" render={({ field }) => (
                        <FormItem><FormLabel>Cost per Conversion</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="courierRate" render={({ field }) => (
                    <FormItem><FormLabel>Courier Rate</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Calculate & Save
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
