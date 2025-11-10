'use client';

import { useState, useEffect } from 'react';
import type { FeasibilityCheck } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Info } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useSettings } from '@/hooks/use-settings';

interface WhatIfSimulatorProps {
  initialRecord: FeasibilityCheck;
}

const formatPkr = (num: number, decimals = 0) => {
    return `PKR ${num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })}`;
};

const getStatusVariant = (status: FeasibilityCheck['profitStatus']) => {
    switch (status) {
      case 'Profitable':
        return 'success';
      case 'Near Breakeven':
        return 'warning';
      case 'Loss':
        return 'destructive';
      default:
        return 'secondary';
    }
};

export function WhatIfSimulator({ initialRecord }: WhatIfSimulatorProps) {
  const [settings] = useSettings();
  const [sellingPrice, setSellingPrice] = useState(initialRecord.sellingPrice);
  const [costPerConversion, setCostPerConversion] = useState(initialRecord.costPerConversion || 0);
  const [adBudget, setAdBudget] = useState(initialRecord.adBudget);
  const [simulatedMetrics, setSimulatedMetrics] = useState({
    netProfit: 0,
    roasMultiplier: 0,
    summary: '',
    profitStatus: 'Loss' as FeasibilityCheck['profitStatus'],
  });

  useEffect(() => {
    if (!settings) return;

    // Re-use calculation logic, similar to the main feasibility page
    const { 
        sourcingCost, courierRate, paymentType, shopifyPlan, shopifyMonthlyCost, debitCardTax,
        returnedOrdersPercent
    } = initialRecord;

    const toNum = (val: any): number => {
      const n = parseFloat(val);
      return isFinite(n) ? n : 0;
    };
    
    // Use simulated values
    const currentSellingPrice = toNum(sellingPrice);
    const currentCostPerConversion = toNum(costPerConversion);
    const currentAdBudget = toNum(adBudget);
    
    // Existing values from record
    const shopifyMonthlyCostUsd = toNum(shopifyMonthlyCost);

    // This is a simplified version of tax calculation and should be kept in sync with the main form.
    // For a pure client-side simulator, we use the initial tax details if available or simplified rates.
    const whtPercent = settings.isFiler ? 0.01 : 0.04;
    const fedImpactPercent = 0.16 * 0.25; 
    const provincialTaxPercent = settings.provincialTaxEnabled ? settings.provincialTaxRate / 100 : 0;
    
    // NOTE: For simplicity, we are not fetching the live USD rate here. We use a simplified calculation.
    // The total tax impact on USD transactions (Shopify) and PKR transactions (Ads) is approximated.
    const usdTransactionTaxRate = (debitCardTax / 100) + whtPercent + fedImpactPercent + provincialTaxPercent;
    const pkrTransactionTaxRate = whtPercent + fedImpactPercent + provincialTaxPercent;

    const shopifyCostPkr = shopifyPlan === 'regular' ? (shopifyMonthlyCostUsd * 285) * (1 + usdTransactionTaxRate) : 0;
    const taxedAdBudget = currentAdBudget * (1 + pkrTransactionTaxRate);
    
    const totalMonthlyFixedCosts = shopifyCostPkr + taxedAdBudget;

    const fbrTaxRate = paymentType === 'COD' ? 0.02 : 0.01;
    const fbrTax = currentSellingPrice * fbrTaxRate;
    const profitPerSale = currentSellingPrice - sourcingCost - courierRate - fbrTax;

    const totalOrders = currentCostPerConversion > 0 ? currentAdBudget / currentCostPerConversion : 0;
    const effectiveReturnRate = (returnedOrdersPercent || 0) / 100;
    const successfulOrders = totalOrders * (1 - effectiveReturnRate);

    const totalRevenue = successfulOrders * currentSellingPrice;
    const totalSourcingCost = successfulOrders * sourcingCost;
    const totalCourierCost = successfulOrders * courierRate;
    const totalFbrTax = successfulOrders * fbrTax;

    const netProfit =
      totalRevenue -
      totalSourcingCost -
      totalCourierCost -
      totalMonthlyFixedCosts -
      totalFbrTax;

    const roasMultiplier = taxedAdBudget > 0 ? totalRevenue / taxedAdBudget : 0;
    
    let profitStatus: FeasibilityCheck['profitStatus'] = 'Loss';
    let summary = "You're projected to be at a loss. You need more sales or lower costs to be profitable.";
    if (netProfit > 0) {
      profitStatus = 'Profitable';
      summary = `With these settings, you could make an estimated profit of ${formatPkr(netProfit)}/month.`;
    } else if (netProfit > -totalMonthlyFixedCosts * 0.2 && netProfit <= 0) {
      profitStatus = 'Near Breakeven';
      summary = `You're close to breaking even. A small improvement could make you profitable.`;
    }
    
    setSimulatedMetrics({ netProfit, roasMultiplier, summary, profitStatus });

  }, [sellingPrice, costPerConversion, adBudget, initialRecord, settings]);

  return (
    <div className="space-y-6 rounded-md border p-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className='flex justify-between items-center'>
            <Label htmlFor="sellingPrice-slider" className='flex items-center gap-1.5'>
                Selling Price
                 <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-3 w-3 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs">How much will you sell your product for?</p>
                    </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </Label>
            <span className="text-sm font-semibold">{formatPkr(sellingPrice)}</span>
          </div>
          <Slider
            id="sellingPrice-slider"
            min={initialRecord.sourcingCost * 1.1}
            max={initialRecord.sellingPrice * 3}
            step={50}
            value={[sellingPrice]}
            onValueChange={(value) => setSellingPrice(value[0])}
          />
        </div>
        <div className="space-y-3">
            <div className='flex justify-between items-center'>
                <Label htmlFor="cpc-slider" className='flex items-center gap-1.5'>
                    Cost per Conversion
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-3 w-3 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">How much does it cost to get one sale from your ads?</p>
                        </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Label>
                <span className="text-sm font-semibold">{formatPkr(costPerConversion)}</span>
            </div>
            <Slider
                id="cpc-slider"
                min={100}
                max={(initialRecord.costPerConversion || 500) * 3}
                step={50}
                value={[costPerConversion]}
                onValueChange={(value) => setCostPerConversion(value[0])}
            />
        </div>
        <div className="space-y-3 md:col-span-2">
            <div className='flex justify-between items-center'>
                <Label htmlFor="adBudget-slider" className='flex items-center gap-1.5'>
                    Monthly Ad Budget
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-3 w-3 cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">How much will you spend on ads per month?</p>
                        </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Label>
                 <span className="text-sm font-semibold">{formatPkr(adBudget)}</span>
            </div>
          <Slider
            id="adBudget-slider"
            min={0}
            max={initialRecord.adBudget * 3 || 100000}
            step={1000}
            value={[adBudget]}
            onValueChange={(value) => setAdBudget(value[0])}
          />
        </div>
      </div>
      
      <Card className="bg-background/50">
        <CardHeader>
            <div className='flex justify-between items-center'>
                <CardTitle className='text-lg'>Simulated Results</CardTitle>
                <Badge variant={getStatusVariant(simulatedMetrics.profitStatus)}>
                    {simulatedMetrics.profitStatus}
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Estimated Net Profit</p>
                    <p className={`text-xl font-bold ${
                        simulatedMetrics.netProfit > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                        {formatPkr(simulatedMetrics.netProfit)}
                    </p>
                </div>
                 <div>
                    <p className="text-sm text-muted-foreground">Return on Ad Spend (ROAS)</p>
                    <p className="text-xl font-bold">{simulatedMetrics.roasMultiplier.toFixed(2)}x</p>
                </div>
            </div>
            <p className="text-center text-sm text-muted-foreground italic">{simulatedMetrics.summary}</p>
        </CardContent>
      </Card>

    </div>
  );
}
