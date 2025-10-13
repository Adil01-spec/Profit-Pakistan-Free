'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useHistory } from '@/hooks/use-history';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Loader2 } from 'lucide-react';
import type { LaunchPlan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { PlannerResults } from '@/components/planner/planner-results';

const formSchema = z.object({
  productName: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  category: z.string().min(2, { message: 'Category must be at least 2 characters.' }),
  sourcingCost: z.coerce.number().min(0, { message: 'Sourcing cost must be a positive number.' }),
  sellingPrice: z.coerce.number().min(1, { message: 'Selling price must be greater than 0.' }),
  marketingBudget: z.coerce.number().min(0, { message: 'Marketing budget must be a positive number.' }),
  courierRate: z.coerce.number().min(0, { message: 'Courier rate must be a positive number.' }),
}).refine(data => data.sellingPrice > data.sourcingCost, {
  message: "Selling price must be greater than sourcing cost.",
  path: ["sellingPrice"],
});

export type PlannerFormValues = z.infer<typeof formSchema>;

export default function PlannerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addHistoryRecord } = useHistory();

  const form = useForm<PlannerFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      productName: '',
      category: '',
      sourcingCost: 0,
      sellingPrice: 0,
      marketingBudget: 0,
      courierRate: 200,
    },
  });

  const watchedValues = form.watch();

  const calculatedValues = useMemo(() => {
    const { sourcingCost, sellingPrice, marketingBudget, courierRate } = watchedValues;
    const profitPerUnit = sellingPrice - sourcingCost - courierRate;
    const breakevenUnits = marketingBudget > 0 && profitPerUnit > 0 ? Math.ceil(marketingBudget / profitPerUnit) : 0;
    const profitMargin = sellingPrice > 0 ? (profitPerUnit / sellingPrice) * 100 : 0;
    const breakevenROAS = profitPerUnit > 0 ? sellingPrice / profitPerUnit : 0;
    
    let profitStatus: LaunchPlan['profitStatus'] = 'Loss';
    let summary = "This product seems unprofitable at these metrics. Consider increasing the selling price or reducing costs.";
    if (profitMargin > 15) {
        profitStatus = 'Profitable';
        summary = `With a ${profitMargin.toFixed(1)}% profit margin, this product looks promising.`;
    } else if (profitMargin > 0) {
        profitStatus = 'Near Breakeven';
        summary = `The profit margin is low (${profitMargin.toFixed(1)}%). Be cautious with ad spend.`;
    }

    return { profitPerUnit, breakevenUnits, profitMargin, breakevenROAS, profitStatus, summary };
  }, [watchedValues]);


  async function onSubmit(values: PlannerFormValues) {
    setIsSubmitting(true);

    const resultData: LaunchPlan = {
        id: uuidv4(),
        type: 'Launch',
        date: new Date().toISOString(),
        ...values,
        ...calculatedValues
    };

    addHistoryRecord(resultData);
    toast({ title: "Report Saved ✅", description: "Your product launch plan has been saved locally."});
    router.push(`/history/${resultData.id}`);
  }

  return (
    <>
      <Header />
      <main className="container mx-auto max-w-2xl p-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Product Launch Planner</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="productName" render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                        <FormLabel>Product Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Handcrafted Leather Wallet" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                        <FormLabel>Product Category</FormLabel>
                        <FormControl><Input placeholder="e.g., Fashion Accessories" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="sourcingCost" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Sourcing Cost (per unit)</FormLabel>
                        <FormControl><Input type="number" placeholder="1000" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Expected Selling Price</FormLabel>
                        <FormControl><Input type="number" placeholder="2500" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="marketingBudget" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Marketing Budget (monthly)</FormLabel>
                        <FormControl><Input type="number" placeholder="50000" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="courierRate" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Courier Rate (per delivery)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )} />
                </div>
                
                <PlannerResults results={calculatedValues} />

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
