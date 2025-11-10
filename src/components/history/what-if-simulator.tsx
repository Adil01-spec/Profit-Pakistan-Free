
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { FeasibilityCheck } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Info, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useSettings } from '@/hooks/use-settings';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

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

interface SimulatedMetrics {
    netProfit: number;
    roasMultiplier: number;
    totalRevenue: number;
    summary: string;
    profitStatus: FeasibilityCheck['profitStatus'];
};

const ComparisonMetric = ({ label, value, originalValue }: { label: string, value: number, originalValue: number }) => {
    const change = originalValue !== 0 ? ((value - originalValue) / Math.abs(originalValue)) * 100 : (value > 0 ? 100 : 0);
    const isIncrease = change > 0;
    const isDecrease = change < 0;
    const isNeutral = Math.abs(change) < 0.1;


    const formattedValue = label === 'ROAS' ? `${value.toFixed(2)}x` : formatPkr(value);
    
    // For ROAS and Revenue, increase is good. For Profit, it depends. Let's assume increase is good for simplicity.
    const isGood = (label === 'ROAS' || label === 'Net Profit' || label === 'Revenue') ? isIncrease : isDecrease;

    return (
        <div className='text-center'>
            <p className='text-sm text-muted-foreground'>{label}</p>
            <p className='text-lg font-bold'>{formattedValue}</p>
             <div className={cn(
                'flex items-center justify-center text-xs font-semibold',
                isNeutral && 'text-muted-foreground',
                isIncrease && 'text-green-500',
                isDecrease && 'text-red-500'
            )}>
                {isIncrease && <TrendingUp className="h-4 w-4 mr-1" />}
                {isDecrease && <TrendingDown className="h-4 w-4 mr-1" />}
                {isNeutral ? 'No Change' : `${isIncrease ? '+' : ''}${change.toFixed(1)}%`}
            </div>
        </div>
    );
};

const AdSenseBlock = () => {
    useEffect(() => {
        try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense load error", e);
        }
    }, []);

    return (
        <div className="flex flex-col items-center mt-6 mb-2">
            <p className="text-center text-xs text-gray-400 mb-2">Advertisement</p>
            <div className="flex justify-center w-full">
                <ins
                    className="adsbygoogle"
                    style={{ display: "block", width: "100%", maxWidth: "728px", height: "90px" }}
                    data-ad-client="ca-pub-XXXXXXXXXXXXXXX"
                    data-ad-slot="YYYYYYYYYY"
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                ></ins>
            </div>
        </div>
    );
};


export function WhatIfSimulator({ initialRecord }: WhatIfSimulatorProps) {
  const [settings] = useSettings();
  const [sellingPrice, setSellingPrice] = useState(initialRecord.sellingPrice);
  const [costPerConversion, setCostPerConversion] = useState(initialRecord.costPerConversion || 0);
  const [adBudget, setAdBudget] = useState(initialRecord.adBudget);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const originalMetrics = useMemo(() => ({
    netProfit: initialRecord.netProfit,
    roasMultiplier: initialRecord.roasMultiplier || 0,
    totalRevenue: (initialRecord.successfulOrders || 0) * initialRecord.sellingPrice,
    sellingPrice: initialRecord.sellingPrice,
    adBudget: initialRecord.adBudget,
    costPerConversion: initialRecord.costPerConversion || 0,
  }), [initialRecord]);

  const [simulatedMetrics, setSimulatedMetrics] = useState<SimulatedMetrics>({
    netProfit: originalMetrics.netProfit,
    roasMultiplier: originalMetrics.roasMultiplier,
    totalRevenue: originalMetrics.totalRevenue,
    summary: initialRecord.summary,
    profitStatus: initialRecord.profitStatus,
  });
  
  // Debounce the inputs to avoid excessive API calls
  const debouncedSellingPrice = useDebounce(sellingPrice, 500);
  const debouncedCostPerConversion = useDebounce(costPerConversion, 500);
  const debouncedAdBudget = useDebounce(adBudget, 500);

  const [aiInsight, setAiInsight] = useState<string>('Adjust the sliders to see real-time AI feedback on your strategy.');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const getAiInsight = useCallback(async (oldMetrics: typeof originalMetrics, newMetrics: SimulatedMetrics, newInputs: any) => {
    setIsAiLoading(true);
    try {
        const response = await fetch('/api/simulator-insight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                originalPrice: oldMetrics.sellingPrice,
                originalAdBudget: oldMetrics.adBudget,
                originalCpc: oldMetrics.costPerConversion,
                originalProfit: oldMetrics.netProfit.toFixed(0),
                originalRoas: oldMetrics.roasMultiplier.toFixed(2),
                originalRevenue: oldMetrics.totalRevenue.toFixed(0),
                newPrice: newInputs.sellingPrice,
                newAdBudget: newInputs.adBudget,
                newCpc: newInputs.costPerConversion,
                newProfit: newMetrics.netProfit.toFixed(0),
                newRoas: newMetrics.roasMultiplier.toFixed(2),
                newRevenue: newMetrics.totalRevenue.toFixed(0),
            })
        });
        if (!response.ok) throw new Error('Failed to fetch insight.');
        const data = await response.json();
        setAiInsight(data.insight);
    } catch (error) {
        console.error(error);
        setAiInsight('💡 Could not fetch AI insight. Please try again.');
    } finally {
        setIsAiLoading(false);
    }
  }, []);


  useEffect(() => {
    if (!settings) return;

    const toNum = (val: any): number => {
      const n = parseFloat(val);
      return isFinite(n) ? n : 0;
    };
    
    const { 
        sourcingCost, courierRate, paymentType, shopifyPlan, shopifyMonthlyCost, debitCardTax,
        returnedOrdersPercent
    } = initialRecord;
    
    const currentSellingPrice = toNum(debouncedSellingPrice);
    const currentCostPerConversion = toNum(debouncedCostPerConversion);
    const currentAdBudget = toNum(debouncedAdBudget);
    
    const shopifyMonthlyCostUsd = toNum(shopifyMonthlyCost);
    const whtPercent = settings.isFiler ? 0.01 : 0.04;
    const fedImpactPercent = 0.16 * 0.25; 
    const provincialTaxPercent = settings.provincialTaxEnabled ? settings.provincialTaxRate / 100 : 0;
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
    
    const newMetrics = { netProfit, roasMultiplier, totalRevenue, summary, profitStatus };
    setSimulatedMetrics(newMetrics);
    
    const hasChanged = originalMetrics.netProfit.toFixed(0) !== newMetrics.netProfit.toFixed(0) || originalMetrics.roasMultiplier.toFixed(2) !== newMetrics.roasMultiplier.toFixed(2);
    if(hasChanged) {
       getAiInsight(originalMetrics, newMetrics, {
           sellingPrice: currentSellingPrice,
           adBudget: currentAdBudget,
           costPerConversion: currentCostPerConversion,
       });
    }

  }, [
    debouncedSellingPrice, debouncedCostPerConversion, debouncedAdBudget, 
    initialRecord, settings, getAiInsight, originalMetrics
  ]);

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

      <div className="space-y-4">
        <Card className="bg-muted/30">
            <CardHeader>
                <CardTitle className="text-lg">📊 Scenario Comparison</CardTitle>
                <CardDescription>Comparing your new scenario to the original report.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                    <ComparisonMetric label="Net Profit" value={simulatedMetrics.netProfit} originalValue={originalMetrics.netProfit} />
                    <ComparisonMetric label="ROAS" value={simulatedMetrics.roasMultiplier} originalValue={originalMetrics.roasMultiplier} />
                    <ComparisonMetric label="Revenue" value={simulatedMetrics.totalRevenue} originalValue={originalMetrics.totalRevenue} />
                </div>
            </CardContent>
        </Card>

         <Card className="bg-accent/10 border-accent/20">
            <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
                <CardTitle className="text-base">🧠 AI Comparison Summary</CardTitle>
                {isAiLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground transition-opacity duration-300 animate-in fade-in">
                {aiInsight}
                </p>
            </CardContent>
        </Card>

        {isClient && <AdSenseBlock />}

      </div>
    </div>
  );
}

    