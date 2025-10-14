'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { useHistory } from '@/hooks/use-history';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/header';
import { Loader2, Info } from 'lucide-react';
import type { FeasibilityCheck } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { courierRates } from '@/lib/courier-rates';

const formSchema = z.object({
  productName: z.string().min(2),
  category: z.string().min(2),
  sourcingCost: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(1),
  shopifyPlan: z.enum(['trial', 'regular']),
  shopifyMonthlyCost: z.coerce.number().min(0).optional(),
  bank: z.string().min(1, { message: 'Please select a bank.' }),
  debitCardTax: z.coerce.number().min(0),
  courier: z.string().min(1),
  courierRate: z.coerce.number().min(0),
  adBudget: z.coerce.number().min(0),
  costPerConversion: z.coerce.number().min(0),
  paymentType: z.enum(['COD', 'Online']),
}).refine(data => data.shopifyPlan === 'trial' || (data.shopifyMonthlyCost !== undefined && data.shopifyMonthlyCost > 0), {
  message: 'Please enter your Shopify monthly cost.',
  path: ['shopifyMonthlyCost'],
}).refine(data => data.sellingPrice > data.sourcingCost, {
    message: "Selling price must be greater than sourcing cost.",
    path: ["sellingPrice"],
});

export default function FeasibilityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addHistoryRecord } = useHistory();
  const [settings, setSettings] = useSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      productName: '',
      category: '',
      sourcingCost: 0,
      sellingPrice: 0,
      shopifyPlan: 'trial',
      bank: settings.banks[0]?.name || '',
      debitCardTax: settings.banks[0]?.tax || 1.5,
      courier: 'TCS',
      courierRate: courierRates.TCS.COD,
      adBudget: 0,
      costPerConversion: 0,
      paymentType: 'COD',
    },
  });
  
  const shopifyPlan = form.watch('shopifyPlan');
  const paymentType = form.watch('paymentType');
  const selectedCourier = form.watch('courier');

  useEffect(() => {
    const courier = selectedCourier as keyof typeof courierRates;
    if (courier && courier !== 'Other') {
        const rate = courierRates[courier][paymentType as 'COD' | 'Online'];
        form.setValue('courierRate', rate, { shouldValidate: true });
    }
  }, [paymentType, selectedCourier, form]);

  const watchedValues = form.watch();
  
  useEffect(() => {
    toast({ title: 'Recalculating...' });
  }, [
    watchedValues.sourcingCost,
    watchedValues.sellingPrice,
    watchedValues.shopifyPlan,
    watchedValues.shopifyMonthlyCost,
    watchedValues.bank,
    watchedValues.debitCardTax,
    watchedValues.courier,
    watchedValues.courierRate,
    watchedValues.adBudget,
    watchedValues.costPerConversion,
    watchedValues.paymentType,
  ]);

  const handleBankChange = (bankName: string) => {
    const selectedBank = settings.banks.find(b => b.name === bankName);
    if (selectedBank) {
      form.setValue('debitCardTax', selectedBank.tax);
    }
  };

  const handlePaymentTypeChange = (value: 'COD' | 'Online') => {
      form.setValue('paymentType', value);
  };

  const calculateFeasibility = (values: z.infer<typeof formSchema>) => {
    const { adBudget, costPerConversion, sellingPrice, sourcingCost, courierRate, paymentType } = values;
    const shopifyCost = values.shopifyPlan === 'trial' ? 1 * 300 : (values.shopifyMonthlyCost || 0) * 300; // Approx USD to PKR
      
    const totalMonthlyFixedCosts = shopifyCost + adBudget;

    const fbrTaxRate = paymentType === 'COD' ? 0.02 : 0.01;
    const fbrTax = sellingPrice * fbrTaxRate;
    
    const profitPerSale = sellingPrice - sourcingCost - courierRate - fbrTax;
    const breakevenConversions = totalMonthlyFixedCosts > 0 && profitPerSale > 0 ? Math.ceil(totalMonthlyFixedCosts / profitPerSale) : 0;
      
    const conversionsPerMonth = adBudget > 0 && costPerConversion > 0 ? adBudget / costPerConversion : 0;
    const totalRevenue = conversionsPerMonth * sellingPrice;
    const totalSourcingCost = conversionsPerMonth * sourcingCost;
    const totalCourierCost = conversionsPerMonth * courierRate;
    const totalFbrTax = conversionsPerMonth * fbrTax;

    const netProfit = totalRevenue - totalSourcingCost - totalCourierCost - totalMonthlyFixedCosts - totalFbrTax;
    
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const roas = adBudget > 0 ? (totalRevenue / adBudget) * 100 : 0;

    let profitStatus: FeasibilityCheck['profitStatus'] = 'Loss';
    let summary = "You're projected to be at a loss. You need more sales or lower costs to be profitable.";
    if (netProfit > 0) {
        profitStatus = 'Profitable';
        summary = `You are making an estimated profit of PKR ${netProfit.toLocaleString('en-US', {maximumFractionDigits: 0})}/month.`;
    } else if (netProfit > -totalMonthlyFixedCosts * 0.2 && netProfit <= 0) { 
        profitStatus = 'Near Breakeven';
        summary = `You're close to breaking even. A small improvement in sales or costs could make you profitable.`;
    }

    const breakEvenPrice = sourcingCost + courierRate + fbrTax;

    const taxMessage = paymentType === 'COD' 
        ? "A 2% FBR tax will be deducted by your courier as per Section 236Y." 
        : "A 1% FBR tax applies on non-cash transactions as per FBR rules.";

    return {
        totalMonthlyFixedCosts,
        breakevenConversions,
        netProfit,
        summary, 
        profitStatus,
        breakEvenPrice,
        fbrTax,
        taxMessage,
        profitMargin,
        roas,
    };
  }

  const calculatedValues = useMemo(() => {
    return calculateFeasibility(watchedValues);
  }, [watchedValues]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    toast({ title: "Calculating...", description: "Running the numbers for your report." });

    setTimeout(() => {
      const finalCalculatedValues = calculateFeasibility(values);
      
      const resultData: FeasibilityCheck = {
          id: uuidv4(),
          date: new Date().toISOString(),
          ...values,
          type: 'Feasibility',
          shopifyMonthlyCost: values.shopifyPlan === 'trial' ? 1 : (values.shopifyMonthlyCost || 0),
          ...finalCalculatedValues,
      };
      
      addHistoryRecord(resultData);
      toast({ title: "Feasibility Report Saved ✅", description: "Your ad feasibility check has been saved locally."});
      router.push(`/history/${resultData.id}`);
      setIsSubmitting(false);
    }, 500);
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

                 <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg">Courier, Payments & Taxes</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="paymentType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                    Payment Type
                                     <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">{calculatedValues.taxMessage}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </FormLabel>
                                <Select onValueChange={(value: 'COD' | 'Online') => { field.onChange(value); handlePaymentTypeChange(value); }} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select payment type" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="COD">Cash on Delivery (COD)</SelectItem>
                                        <SelectItem value="Online">Online / Non-COD</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="courier"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Courier Company</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select a courier" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.keys(courierRates).map(courierName => (
                                                <SelectItem key={courierName} value={courierName}>{courierName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField control={form.control} name="courierRate" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Courier Rate (per delivery)</FormLabel>
                                <FormControl><Input type="number" {...field} disabled={selectedCourier !== 'Other'} /></FormControl>
                                <FormMessage />
                            </FormItem>
                         )} />
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
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="adBudget" render={({ field }) => (
                        <FormItem><FormLabel>Ad Budget (monthly)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="costPerConversion" render={({ field }) => (
                        <FormItem><FormLabel>Cost per Conversion</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Total Profit</CardTitle>
                        <CardDescription>Net profit after all deductions</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <p className={`text-2xl font-bold ${calculatedValues.netProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            PKR {calculatedValues.netProfit.toLocaleString('en-US', {maximumFractionDigits: 0})}
                        </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                        <CardTitle>ROAS (Return on Ad Spend)</CardTitle>
                        <CardDescription>How efficiently your ad spend performs</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <p className="text-2xl font-bold">{calculatedValues.roas.toFixed(1)}%</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                        <CardTitle>Profit Margin</CardTitle>
                        <CardDescription>Percentage profit on your selling price</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <p className="text-2xl font-bold">{calculatedValues.profitMargin.toFixed(1)}%</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                        <CardTitle>Break-even Point</CardTitle>
                        <CardDescription>Minimum selling price to avoid loss</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <p className="text-2xl font-bold">PKR {calculatedValues.breakEvenPrice?.toFixed(0) || '—'}</p>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1 md:col-span-2 text-center">
                        <CardHeader>
                        <CardTitle>Feasibility Verdict</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <p
                            className={`text-2xl font-semibold ${
                            calculatedValues.profitMargin > 15
                                ? 'text-green-500'
                                : calculatedValues.profitMargin > 0
                                ? 'text-yellow-500'
                                : 'text-red-500'
                            }`}
                        >
                            {calculatedValues.profitMargin > 15
                            ? 'Profitable ✅'
                            : calculatedValues.profitMargin > 0
                            ? 'Near Break-even ⚠️'
                            : 'Loss Making ❌'}
                        </p>
                        </CardContent>
                    </Card>
                </div>


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
