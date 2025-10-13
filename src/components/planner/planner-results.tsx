'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PlannerResultsProps = {
  results: {
    profitPerUnit: number;
    breakevenUnits: number;
    profitMargin: number;
    breakevenROAS: number;
    profitStatus: 'Profitable' | 'Near Breakeven' | 'Loss';
  };
};

const MetricDisplay = ({ label, value, subtext }: { label: string; value: string; subtext?: string }) => (
  <div className="flex flex-col rounded-lg border bg-card p-3 shadow-sm">
    <p className="text-xs text-muted-foreground">{label}</p>
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
  const { profitPerUnit, breakevenUnits, profitMargin, breakevenROAS, profitStatus } = results;

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
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricDisplay
          label="Profit Margin"
          value={`${profitMargin.toFixed(1)}%`}
        />
        <MetricDisplay
          label="Profit per Unit"
          value={`PKR ${profitPerUnit.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
        />
        <MetricDisplay
          label="Breakeven ROAS"
          value={`1:${breakevenROAS.toFixed(2)}`}
          subtext="Sell Price / Profit"
        />
        <MetricDisplay
          label="Breakeven Units"
          value={breakevenUnits.toLocaleString()}
          subtext="To cover marketing"
        />
      </CardContent>
    </Card>
  );
};
