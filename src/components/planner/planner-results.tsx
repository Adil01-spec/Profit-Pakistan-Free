
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

// Helper function to safely format numbers
const formatNumber = (num: any, decimals = 0) => {
  const parsed = parseFloat(num);
  if (typeof parsed === "number" && !isNaN(parsed)) {
    return parsed.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return "—";
};
const formatNumberWithDecimals = (num: any, decimals = 1) => {
    const parsed = parseFloat(num);
    if (typeof parsed === "number" && !isNaN(parsed)) {
      return parsed.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    return "—";
};

type PlannerResultsProps = {
  results: {
    profitPerUnit: number;
    breakevenUnits: number;
    profitMargin: number;
    breakevenROAS: number;
    profitStatus: 'Profitable' | 'Near Breakeven' | 'Loss';
    fbrTax: number;
  };
};

const MetricDisplay = ({ label, value, subtext, tooltipText }: { label: string; value: string; subtext?: string; tooltipText?: string; }) => (
  <div className="flex flex-col rounded-lg border bg-card p-3 shadow-sm">
    <p className="text-xs text-muted-foreground flex items-center gap-1">
      {label}
      {tooltipText && (
        <TooltipProvider>
            <Tooltip>
            <TooltipTrigger asChild>
                <Info className="h-3 w-3 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
                <p className="max-w-xs">{tooltipText}</p>
            </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      )}
    </p>
    <p className="text-xl font-bold">{value}</p>
    {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
  </div>
);

const getStatusVariant = (status: PlannerResultsProps['results']['profitStatus']) => {
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

export const PlannerResults = ({ results }: PlannerResultsProps) => {
  const { profitPerUnit, breakevenUnits, profitMargin, breakevenROAS, profitStatus, fbrTax } = results;

  return (
    <Card className="mt-6 bg-muted/30">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Real-time Analysis</CardTitle>
            <Badge variant={getStatusVariant(profitStatus)} className="text-sm">{profitStatus}</Badge>
        </div>
        <CardDescription>
          These values update automatically as you type.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <MetricDisplay
          label="Profit Margin"
          value={`${formatNumberWithDecimals(profitMargin)}%`}
        />
        <MetricDisplay
          label="Profit per Unit"
          value={`PKR ${formatNumber(profitPerUnit, 2)}`}
        />
        <MetricDisplay
          label="Breakeven ROAS"
          value={`1:${formatNumber(breakevenROAS, 2)}`}
          subtext="Sell Price / Profit"
          tooltipText="ROAS = Total Revenue ÷ Total Ad Spend. It shows how much you earn for every rupee spent on ads. Higher ROAS = better ad performance."
        />
        <MetricDisplay
          label="Breakeven Units"
          value={formatNumber(breakevenUnits)}
          subtext="To cover marketing"
        />
        <MetricDisplay
          label="FBR Tax (per unit)"
          value={`PKR ${formatNumber(fbrTax, 2)}`}
        />
      </CardContent>
    </Card>
  );
};

    