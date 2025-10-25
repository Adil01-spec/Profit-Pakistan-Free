
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useHistory } from '@/hooks/use-history';
import { useSettings } from '@/hooks/use-settings';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Loader2, Info } from 'lucide-react';
import type { FeasibilityCheck } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { courierRates } from '@/lib/courier-rates';
import { AdBanner } from '@/components/ad-banner';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { format } from 'date-fns';

// Helper function to safely format numbers
const formatNumber = (num: any, decimals = 0) => {
  const n = parseFloat(num);
  if (typeof n === 'number' && !isNaN(n)) {
    return n.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return '—';
};
const formatNumberWithDecimals = (num: any, decimals = 1) => {
  const parsed = parseFloat(num);
  if (typeof parsed === 'number' && !isNaN(parsed)) {
    return parsed.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return '—';
};

const formSchema = z
  .object({
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
    adSpend: z.coerce.number().min(0).optional(),
    costPerConversion: z.coerce.number().optional(),
    paymentType: z.enum(['COD', 'Online']),
    adDurationDays: z.coerce.number().optional(),
  })
  .refine(
    (data) =>
      data.shopifyPlan === 'trial' ||
      (data.shopifyMonthlyCost !== undefined && data.shopifyMonthlyCost > 0),
    {
      message: 'Please enter your Shopify monthly cost.',
      path: ['shopifyMonthlyCost'],
    }
  )
  .refine((data) => data.sellingPrice > data.sourcingCost, {
    message: 'Selling price must be greater than sourcing cost.',
    path: ['sellingPrice'],
  });

type CalculatedValues = (Omit<FeasibilityCheck, 'id' | 'date'> & {
    estimatedAdRevenue?: number;
    newRoasMultiplier?: number;
    newRoasPercent?: number;
    roasVerdict?: string;
}) | null;

function ManualRateInput({ onSetRate, lastSavedRate }: { onSetRate: (rate: number) => void; lastSavedRate?: number }) {
    const [manualRate, setManualRate] = useState(lastSavedRate || 280);

    const handleManualSubmit = () => {
        if(manualRate > 0) {
            onSetRate(manualRate);
        }
    };

    return (
        <div className="flex items-center gap-2 mt-2 p-3 rounded-md border border-dashed border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <Input 
                type="number" 
                value={manualRate} 
                onChange={(e) => setManualRate(parseFloat(e.target.value))}
                placeholder="e.g. 280"
                className="w-40"
            />
            <Button onClick={handleManualSubmit} size="sm">Set Rate</Button>
            <p className="text-xs text-muted-foreground">Enter USD to PKR rate.</p>
        </div>
    );
}

export default function FeasibilityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addHistoryRecord } = useHistory();
  const [settings, setSettings, {isPersistent}] = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [calculatedValues, setCalculatedValues] =
    useState<CalculatedValues>(null);
  const { rate: usdToPkrRate, isLoading: isRateLoading, lastUpdated, showManualInput, setManualRate, lastSavedRate } = useExchangeRate();
  const [effectiveRate, setEffectiveRate] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
        productName: '',
        category: '',
        sourcingCost: 0,
        sellingPrice: 0,
        shopifyPlan: 'trial',
        shopifyMonthlyCost: 0,
        bank: '',
        debitCardTax: 0,
        courier: 'TCS',
        courierRate: courierRates.TCS.COD,
        adBudget: 0,
        adSpend: 0,
        costPerConversion: '' as any, // Use empty string for controlled input
        paymentType: 'COD',
        adDurationDays: '' as any, // Use empty string for controlled input
    },
  });

  const { watch, setValue, reset } = form;

  useEffect(() => {
    if (isPersistent) {
        if (!settings || !settings.shopifyPlans || !settings.banks) return;
        reset({
            productName: '',
            category: '',
            sourcingCost: 0,
            sellingPrice: 0,
            shopifyPlan: 'trial',
            shopifyMonthlyCost: settings.shopifyPlans.find(p => p.plan === 'Regular')?.costPerMonth || 0,
            bank: settings.banks[0]?.name || '',
            debitCardTax: settings.banks[0]?.tax || 1.5,
            courier: 'TCS',
            courierRate: courierRates.TCS.COD,
            adBudget: 0,
            adSpend: 0,
            costPerConversion: '' as any,
            paymentType: 'COD',
            adDurationDays: '' as any,
        });
    }
  }, [isPersistent, settings, reset]);


  const watchedSourcingCost = watch('sourcingCost');
  const watchedSellingPrice = watch('sellingPrice');
  const watchedAdBudget = watch('adBudget');
  const watchedAdSpend = watch('adSpend');
  const watchedCostPerConversion = watch('costPerConversion');
  const watchedCourierRate = watch('courierRate');
  const watchedShopifyPlan = watch('shopifyPlan');
  const watchedShopifyMonthlyCost = watch('shopifyMonthlyCost');
  const watchedPaymentType = watch('paymentType');
  const watchedBank = watch('bank');
  const watchedDebitCardTax = watch('debitCardTax');
  const watchedAdDurationDays = watch('adDurationDays');

  useEffect(() => {
    if (usdToPkrRate && watchedDebitCardTax !== undefined) {
      const calculatedEffectiveRate = usdToPkrRate * (1 + watchedDebitCardTax / 100);
      setEffectiveRate(calculatedEffectiveRate);
    } else {
      setEffectiveRate(null);
    }
  }, [usdToPkrRate, watchedDebitCardTax]);


  useEffect(() => {
    const toNum = (val: any): number => {
      const n = parseFloat(val);
      return isFinite(n) ? n : 0;
    };
    
    const sourcingCost = toNum(watchedSourcingCost);
    const sellingPrice = toNum(watchedSellingPrice);
    const adBudget = toNum(watchedAdBudget);
    const adSpend = toNum(watchedAdSpend);
    const costPerConversion = toNum(watchedCostPerConversion);
    const courierRate = toNum(watchedCourierRate);
    const shopifyMonthlyCost = watchedShopifyPlan === 'trial' ? 1 : toNum(watchedShopifyMonthlyCost);
    const paymentType = watchedPaymentType;
    
    if (sellingPrice <= 0 || sellingPrice <= sourcingCost || !effectiveRate) {
      setCalculatedValues(null);
      return;
    }

    const shopifyCostPkr = shopifyMonthlyCost * effectiveRate;
    const totalMonthlyFixedCosts = shopifyCostPkr + adBudget;
    const fbrTaxRate = paymentType === 'COD' ? 0.02 : 0.01;
    const fbrTax = sellingPrice * fbrTaxRate;
    const profitPerSale = sellingPrice - sourcingCost - courierRate - fbrTax;
    const breakevenConversions =
      totalMonthlyFixedCosts > 0 && profitPerSale > 0
        ? Math.ceil(totalMonthlyFixedCosts / profitPerSale)
        : 0;

    const conversionsPerMonth = costPerConversion > 0 ? adBudget / costPerConversion : 0;
    const totalRevenue = conversionsPerMonth * sellingPrice;
    const totalSourcingCost = conversionsPerMonth * sourcingCost;
    const totalCourierCost = conversionsPerMonth * courierRate;
    const totalFbrTax = conversionsPerMonth * fbrTax;
    
    const finalAdSpend = adSpend > 0 ? adSpend : adBudget;

    const netProfit =
      totalRevenue -
      totalSourcingCost -
      totalCourierCost -
      (shopifyCostPkr + finalAdSpend) -
      totalFbrTax;

    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    const roasMultiplier = finalAdSpend > 0 ? totalRevenue / finalAdSpend : 0;
    const roasPercent = roasMultiplier * 100;
    
    let profitStatus: 'Profitable' | 'Near Breakeven' | 'Loss' = 'Loss';
    let summary = "You're projected to be at a loss. You need more sales or lower costs to be profitable.";
    if (netProfit > 0) {
      profitStatus = 'Profitable';
      summary = `You are making an estimated profit of PKR ${netProfit.toLocaleString(
        'en-US',
        { maximumFractionDigits: 0 }
      )}/month.`;
    } else if (netProfit > -(shopifyCostPkr + finalAdSpend) * 0.2 && netProfit <= 0) {
      profitStatus = 'Near Breakeven';
      summary = `You're close to breaking even. A small improvement in sales or costs could make you profitable.`;
    }

    const breakEvenPrice = sourcingCost + courierRate + fbrTax;
    
    // New ROAS Calculations
    const adDuration = toNum(watchedAdDurationDays);
    const expectedDailyOrders = costPerConversion > 0 ? (adBudget / 30) / costPerConversion : 0;
    const estimatedAdRevenue = expectedDailyOrders * sellingPrice * adDuration;

    let newRoasMultiplier, newRoasPercent, roasVerdict;

    if (estimatedAdRevenue > 0 && adSpend > 0) {
        newRoasMultiplier = estimatedAdRevenue / adSpend;
        newRoasPercent = newRoasMultiplier * 100;
        if (newRoasPercent >= 400) roasVerdict = 'Highly Feasible — Excellent performance.';
        else if (newRoasPercent >= 200) roasVerdict = 'Feasible — Good, but optimize your ads.';
        else roasVerdict = 'Not Feasible — Review ad strategy and creatives.';
    }


    setCalculatedValues({
        ...(form.getValues()),
        totalMonthlyFixedCosts,
        breakevenConversions,
        netProfit,
        summary,
        profitStatus,
        breakEvenPrice,
        fbrTax,
        profitMargin,
        roasMultiplier,
        roasPercent,
        roas: 0, // Keep for type compatibility, though roasMultiplier is used
        estimatedAdRevenue,
        newRoasMultiplier,
        newRoasPercent,
        roasVerdict,
    });

  }, [
    watchedSourcingCost,
    watchedSellingPrice,
    watchedAdBudget,
    watchedAdSpend,
    watchedCostPerConversion,
    watchedCourierRate,
    watchedShopifyPlan,
    watchedShopifyMonthlyCost,
    watchedPaymentType,
    effectiveRate,
    watchedAdDurationDays,
    form,
  ]);


  const shopifyPlan = watch('shopifyPlan');
  const paymentType = watch('paymentType');
  const selectedCourier = watch('courier');

  useEffect(() => {
    const courier = selectedCourier as keyof typeof courierRates;
    if (courier && courier !== 'Other') {
      const rate = courierRates[courier][paymentType as 'COD' | 'Online'];
      setValue('courierRate', rate, { shouldValidate: true });
    }
  }, [paymentType, selectedCourier, setValue]);

  const handleBankChange = (bankName: string) => {
    if (!settings || !settings.banks) return;
    const selectedBank = settings.banks.find((b) => b.name === bankName);
    if (selectedBank) {
      setValue('bank', selectedBank.name, { shouldValidate: true });
      setValue('debitCardTax', selectedBank.tax, { shouldValidate: true });
    }
  };

  const handlePaymentTypeChange = (value: 'COD' | 'Online') => {
    setValue('paymentType', value);
  };

  const taxMessage =
    paymentType === 'COD'
      ? 'A 2% FBR tax will be deducted by your courier as per Section 236Y.'
      : 'A 1% FBR tax applies on non-cash transactions as per FBR rules.';

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    
    if (!calculatedValues) {
        toast({
            variant: 'destructive',
            title: 'Calculation Missing',
            description: 'Please fill out the form to see calculations before saving.',
        });
        setIsSaving(false);
        return;
    }

    try {
        const resultData: FeasibilityCheck = {
          id: uuidv4(),
          date: new Date().toISOString(),
          type: 'Feasibility',
          ...values,
          ...calculatedValues,
        };
        addHistoryRecord(resultData);
        toast({
          title: 'Report Saved ✅',
          description: `Your feasibility check for "${values.productName}" has been saved.`,
        });
        router.push(`/history/${resultData.id}`);
    } catch(err) {
        console.error("Error saving report:", err);
        toast({
            title: "Error Saving Report",
            description: "Something went wrong while saving your report.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
  }
  
  if (!isPersistent || !isClient) {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        </div>
    );
  }

  return (
    <main className="container mx-auto max-w-4xl p-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold md:text-3xl">
            Ad Feasibility Calculator
          </CardTitle>
          <CardDescription>
            Values update automatically as you type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Smart Watch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Electronics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="sourcingCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sourcing Cost (per unit)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sellingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="shopifyPlan"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Shopify Plan Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="trial" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            "$1 for 3-month trial"
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="regular" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Regular Plan
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {shopifyPlan === 'regular' && (
                <FormField
                  control={form.control}
                  name="shopifyMonthlyCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shopify Monthly Cost (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 29" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Courier, Payments & Taxes
                  </CardTitle>
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
                                <p className="max-w-xs">{taxMessage}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <Select
                          onValueChange={(value: 'COD' | 'Online') => {
                            field.onChange(value);
                            handlePaymentTypeChange(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="COD">
                              Cash on Delivery (COD)
                            </SelectItem>
                            <SelectItem value="Online">
                              Online / Non-COD
                            </SelectItem>
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a courier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.keys(courierRates).map((courierName) => (
                              <SelectItem
                                key={courierName}
                                value={courierName}
                              >
                                {courierName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="courierRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Courier Rate (per delivery)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            disabled={selectedCourier !== 'Other'}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <div className="col-span-1 sm:col-span-2 space-y-2">
                    <FormField
                        control={form.control}
                        name="bank"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bank for Payments</FormLabel>
                            <Select
                            onValueChange={(value) => handleBankChange(value)}
                            value={field.value}
                            >
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a bank" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {settings?.banks.map((b) => (
                                <SelectItem key={b.name} value={b.name}>
                                    {b.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    {isClient && isRateLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Fetching live exchange rate...</span>
                        </div>
                    ) : isClient && effectiveRate ? (
                        <p className="text-sm text-muted-foreground">
                        💰 <b>Effective USD Rate:</b> ₨{effectiveRate.toFixed(2)} (includes {watchedBank}'s {watchedDebitCardTax}% conversion fee)
                        </p>
                    ) : null}

                     {isClient && showManualInput && (
                        <ManualRateInput onSetRate={setManualRate} lastSavedRate={lastSavedRate} />
                    )}

                    {isClient && lastUpdated && (
                        <p className="text-xs text-gray-500">💱 Last updated: {format(new Date(lastUpdated), "dd MMM yyyy, h:mm a")}</p>
                    )}

                    </div>

                  <FormField
                    control={form.control}
                    name="debitCardTax"
                    render={({ field }) => (
                      <FormItem className='hidden'>
                        <FormLabel>Debit Card Tax (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">
                        Advertising & ROAS
                    </CardTitle>
                    <CardDescription>
                      If you don’t know your total ad revenue, we’ll estimate it using your daily orders and ad duration.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="adBudget"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Ad Budget (monthly)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="costPerConversion"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cost per Conversion</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="adSpend"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Actual Ad Spend (monthly)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} placeholder="Optional, for accurate ROAS"/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                        control={form.control}
                        name="adDurationDays"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Ad Duration (Days)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
              </Card>

              {calculatedValues && (
                <div className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Total Profit</CardTitle>
                        <CardDescription>
                          Net profit after all deductions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p
                          className={`text-2xl font-bold ${
                            calculatedValues.netProfit > 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          PKR {formatNumber(calculatedValues.netProfit)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Return on Ad Spend (ROAS)</CardTitle>
                        <CardDescription>
                          {watchedAdSpend > 0 ? '(Actual)' : '(Estimated)'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {formatNumber(calculatedValues.roasMultiplier, 2)}x
                        </p>
                        <p className="text-muted-foreground text-sm">
                          (
                          {formatNumber(calculatedValues.roasPercent, 1)}
                          %)
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Profit Margin</CardTitle>
                        <CardDescription>
                          Percentage profit on your selling price
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {formatNumberWithDecimals(
                            calculatedValues.profitMargin
                          )}
                          %
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Break-even Point</CardTitle>
                        <CardDescription>
                          Minimum selling price to avoid loss
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          PKR {formatNumber(calculatedValues.breakEvenPrice)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="col-span-1 md:col-span-2 text-center">
                      <CardHeader>
                        <CardTitle>Feasibility Verdict</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p
                          className={`text-2xl font-semibold ${
                            calculatedValues.profitStatus === 'Profitable'
                              ? 'text-green-500'
                              : calculatedValues.profitStatus === 'Near Breakeven'
                              ? 'text-yellow-500'
                              : 'text-red-500'
                          }`}
                        >
                          {calculatedValues.profitStatus}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                   {calculatedValues.roasVerdict && (
                    <Card>
                        <CardHeader>
                            <CardTitle>📊 Ad Performance Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="text-center">
                                <p className="text-sm text-muted-foreground">ROAS Verdict</p>
                                <p className="text-lg font-semibold">{calculatedValues.roasVerdict}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">Estimated Ad Revenue</p>
                                    <p className="text-xl font-bold">Rs. {formatNumber(calculatedValues.estimatedAdRevenue)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Calculated ROAS</p>
                                    <p className="text-xl font-bold">{formatNumber(calculatedValues.newRoasMultiplier, 2)}x ({formatNumber(calculatedValues.newRoasPercent, 1)}%)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                  )}
                  <AdBanner />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSaving}
              >
                {isSaving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Report
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}

    

    