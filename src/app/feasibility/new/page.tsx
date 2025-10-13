'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useHistory } from '@/hooks/use-history';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Loader2 } from 'lucide-react';
import type { FeasibilityCheck } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';


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
  costPerConversion: z.coerce.number().min(0),
}).refine(data => data.shopifyPlan === 'trial' || (data.shopifyMonthlyCost !== undefined && data.shopifyMonthlyCost > 0), {
  message: 'Please enter your Shopify monthly cost.',
  path: ['shopifyMonthlyCost'],
}).refine(data => data.sellingPrice > data.sourcingCost, {
    message: "Selling price must be greater than sourcing cost.",
    path: ["sellingPrice"],
});

const BreakEvenCard = ({ form }: { form: any }) => {
    const { sourcingCost, courierRate, sellingPrice } = form.watch();
    
    // This calculation only considers per-unit variable costs.
    const breakEvenPrice = useMemo(() => {
        return (sourcingCost || 0) + (courierRate || 0);
    }, [sourcingCost, courierRate]);

    // Profitability is determined by whether the selling price covers the per-unit costs.
    // The profitability status considering fixed costs (like ads) is determined on submission.
    const isProfitable = sellingPrice > breakEvenPrice;
    const isAtBreakeven = sellingPrice === breakEvenPrice;
    const isBelowCost = sellingPrice > 0 && sellingPrice < breakEvenPrice;

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Per-Unit Break-even Analysis</CardTitle>
                <CardDescription>
                    The minimum price you need to sell at to cover your sourcing and courier costs for a single unit. This does not include fixed monthly costs like ads or Shopify fees.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Break-even Price (per unit)</p>
                    <p className="text-3xl font-bold">
                        PKR {breakEvenPrice.toLocaleString('en-US', {maximumFractionDigits: 0})}
                    </p>
                    {sellingPrice > 0 && (
                         <div className={cn("mt-2 text-sm font-semibold", 
                            isProfitable && "text-green-600",
                            isAtBreakeven && "text-yellow-600",
                            isBelowCost && "text-red-600"
                         )}>
                             {isProfitable && "Profitable Margin on each unit sold!"}
                             {isAtBreakeven && "Breaking even on each unit sold."}
                             {isBelowCost && "You’re selling each unit at a loss!"}
                         </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default function FeasibilityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addHistoryRecord } = useHistory();
  const [settings, setSettings] = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      category: '',
      sourcingCost: 0,
      sellingPrice: 0,
      shopifyPlan: 'trial',
      bank: settings.banks[0]?.name || '',
      debitCardTax: settings.banks[0]?.tax || 1.5,
      courierRate: 200,
      adBudget: 0,
      costPerConversion: 0,
    },
  });
  
  const shopifyPlan = form.watch('shopifyPlan');

  const handleBankChange = (bankName: string) => {
    const selectedBank = settings.banks.find(b => b.name === bankName);
    if (selectedBank) {
      form.setValue('debitCardTax', selectedBank.tax);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    toast({ title: "Calculating...", description: "Running the numbers for your report." });

    // Use a timeout to allow the toast to render before blocking the main thread
    setTimeout(() => {
      const { adBudget, costPerConversion, sellingPrice, sourcingCost, courierRate } = values;
      const shopifyCost = values.shopifyPlan === 'trial' ? 1 * 300 : (values.shopifyMonthlyCost || 0) * 300; // Approx USD to PKR
      
      const totalMonthlyFixedCosts = shopifyCost + adBudget;
      const profitPerSale = sellingPrice - sourcingCost - courierRate;
      const breakevenConversions = totalMonthlyFixedCosts > 0 && profitPerSale > 0 ? Math.ceil(totalMonthlyFixedCosts / profitPerSale) : 0;
      
      const conversionsPerMonth = adBudget > 0 && costPerConversion > 0 ? adBudget / costPerConversion : 0;
      const totalRevenue = conversionsPerMonth * sellingPrice;
      const totalSourcingCost = conversionsPerMonth * sourcingCost;
      const totalCourierCost = conversionsPerMonth * courierRate;

      // Net profit calculation including all costs
      const netProfit = totalRevenue - totalSourcingCost - totalCourierCost - totalMonthlyFixedCosts;

      let profitStatus: FeasibilityCheck['profitStatus'] = 'Loss';
      let summary = "You're projected to be at a loss. You need more sales or lower costs to be profitable.";
      if (netProfit > 0) {
          profitStatus = 'Profitable';
          summary = `You are making an estimated profit of PKR ${netProfit.toLocaleString('en-US', {maximumFractionDigits: 0})}/month.`;
      } else if (netProfit > -totalMonthlyFixedCosts * 0.2) { // Within 20% of breakeven
          profitStatus = 'Near Breakeven';
          summary = `You're close to breaking even. A small improvement in sales or costs could make you profitable.`;
      }

      // This is the break-even price for a single unit (variable costs only)
      const breakEvenPrice = sourcingCost + courierRate;

      const resultData: FeasibilityCheck = {
          id: uuidv4(),
          date: new Date().toISOString(),
          ...values,
          type: 'Feasibility',
          shopifyMonthlyCost: values.shopifyPlan === 'trial' ? 1 : (values.shopifyMonthlyCost || 0),
          totalMonthlyFixedCosts,
          breakevenConversions,
          netProfit,
          summary, 
          profitStatus,
          breakEvenPrice, // This matches the on-screen calculation
      };
      
      addHistoryRecord(resultData);
      toast({ title: "Feasibility Report Saved ✅", description: "Your ad feasibility check has been saved locally."});
      router.push(`/history/${resultData.id}`);
      setIsSubmitting(false);
    }, 500); // 500ms delay
  }

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
                            <SelectContent>{settings.banks.map(b => <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>)}</SelectContent>
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
                
                <BreakEvenCard form={form} />

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
