import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LaunchPlan, FeasibilityCheck } from "@/lib/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type ResultDisplayProps = {
  record: LaunchPlan | FeasibilityCheck;
};

const MetricCard = ({ label, value, subtext }: { label: string; value: string | number; subtext?: string }) => (
  <div className="flex flex-col rounded-lg border bg-card p-4 shadow-sm">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-2xl font-bold">{typeof value === 'number' ? `PKR ${value.toLocaleString('en-US', {maximumFractionDigits: 0})}` : value}</p>
    {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
  </div>
);

const getStatusVariant = (status: LaunchPlan['profitStatus']) => {
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

const LaunchResult = ({ record }: { record: LaunchPlan }) => (
    <>
    <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-3xl font-bold">{record.productName}</CardTitle>
                <CardDescription className="mt-1">{record.category} &middot; Report from {format(new Date(record.date), 'PP')}</CardDescription>
            </div>
            <Badge variant={getStatusVariant(record.profitStatus) as any} className="text-sm">{record.profitStatus}</Badge>
        </div>
    </CardHeader>
    <CardContent className="space-y-6">
        <Card>
            <CardHeader><CardTitle className="text-lg">Analysis Summary</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{record.summary}</p></CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard label="Profit Margin" value={`${record.profitMargin.toFixed(1)}%`} />
            <MetricCard label="Profit per Unit" value={record.profitPerUnit} />
            <MetricCard label="Breakeven ROAS" value={`1:${record.breakevenROAS.toFixed(2)}`} subtext="Sell Price / Profit per Unit"/>
            <MetricCard label="Breakeven Units" value={record.breakevenUnits} subtext="To cover monthly marketing budget" />
        </div>
        <Card>
            <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
            <CardContent>
                <ul className="divide-y">
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Sourcing Cost</span><span>PKR {record.sourcingCost.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Selling Price</span><span>PKR {record.sellingPrice.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Monthly Marketing Budget</span><span>PKR {record.marketingBudget.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Courier Rate</span><span>PKR {record.courierRate.toLocaleString()}</span></li>
                </ul>
            </CardContent>
        </Card>
    </CardContent>
    </>
);

const FeasibilityResult = ({ record }: { record: FeasibilityCheck }) => (
    <>
    <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-3xl font-bold">{record.productName}</CardTitle>
                <CardDescription className="mt-1">{record.category} &middot; Report from {format(new Date(record.date), 'PP')}</CardDescription>
            </div>
            <Badge variant={getStatusVariant(record.profitStatus) as any} className="text-sm">{record.profitStatus}</Badge>
        </div>
    </CardHeader>
    <CardContent className="space-y-6">
         <Card>
            <CardHeader><CardTitle className="text-lg">Analysis Summary</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{record.summary}</p></CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MetricCard label="Estimated Net Profit" value={record.netProfit} subtext="per month" />
            <MetricCard label="Breakeven Conversions" value={record.breakevenConversions} subtext="sales needed to break even per month" />
        </div>
        <Card>
            <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
            <CardContent>
                <ul className="divide-y">
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Sourcing Cost</span><span>PKR {record.sourcingCost.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Selling Price</span><span>PKR {record.sellingPrice.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Shopify Plan</span><span className="capitalize">{record.shopifyPlan} (${record.shopifyMonthlyCost})</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Bank</span><span>{record.bank} ({record.debitCardTax}%)</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Monthly Ad Budget</span><span>PKR {record.adBudget.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Cost per Conversion</span><span>PKR {record.costPerConversion.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Courier Rate</span><span>PKR {record.courierRate.toLocaleString()}</span></li>
                </ul>
            </CardContent>
        </Card>
    </CardContent>
    </>
);


export const ResultDisplay = ({ record }: ResultDisplayProps) => {
    return (
        <Card className="w-full">
            {record.type === 'Launch' ? <LaunchResult record={record as LaunchPlan} /> : <FeasibilityResult record={record as FeasibilityCheck} />}
        </Card>
    );
};
