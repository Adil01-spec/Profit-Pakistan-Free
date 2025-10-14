import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LaunchPlan, FeasibilityCheck } from "@/lib/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';
import { useToast } from "@/hooks/use-toast";

// Extend the jsPDF interface to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDFWithAutoTable;
}

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

const handleDownloadCsv = (record: LaunchPlan | FeasibilityCheck) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    const universalHeaders = [
        "Report ID", "Report Type", "Date Generated", "Product Name", "Category", 
        "Sourcing Cost", "Selling Price", "Courier", "Courier Rate", "Profit Status", "Summary",
        "Payment Type", "FBR Tax"
    ];

    if (record.type === 'Launch') {
        const launchRecord = record as LaunchPlan;
        const headers = [...universalHeaders, "Marketing Budget", "Profit Per Unit", "Breakeven Units", "Profit Margin (%)", "Breakeven ROAS"];
        const rows = [
            headers.join(','),
            [
                launchRecord.id,
                launchRecord.type,
                `"${format(new Date(launchRecord.date), 'yyyy-MM-dd HH:mm:ss')}"`,
                `"${launchRecord.productName}"`,
                `"${launchRecord.category}"`,
                launchRecord.sourcingCost,
                launchRecord.sellingPrice,
                launchRecord.courier,
                launchRecord.courierRate,
                launchRecord.profitStatus,
                `"${launchRecord.summary}"`,
                launchRecord.paymentType,
                launchRecord.fbrTax.toFixed(2),
                launchRecord.marketingBudget,
                launchRecord.profitPerUnit,
                launchRecord.breakevenUnits,
                launchRecord.profitMargin.toFixed(2),
                launchRecord.breakevenROAS.toFixed(2)
            ].join(',')
        ];
        csvContent += rows.join('\n');
    } else { // Feasibility
        const feasibilityRecord = record as FeasibilityCheck;
        const headers = [...universalHeaders, "Shopify Plan", "Shopify Monthly Cost (USD)", "Bank", "Debit Card Tax (%)", "Ad Budget", "Cost Per Conversion", "Total Monthly Fixed Costs", "Breakeven Conversions", "Net Profit", "Break-even Price", "ROAS Multiplier", "ROAS Percent"];
        const rows = [
            headers.join(','),
            [
                feasibilityRecord.id,
                feasibilityRecord.type,
                `"${format(new Date(feasibilityRecord.date), 'yyyy-MM-dd HH:mm:ss')}"`,
                `"${feasibilityRecord.productName}"`,
                `"${feasibilityRecord.category}"`,
                feasibilityRecord.sourcingCost,
                feasibilityRecord.sellingPrice,
                feasibilityRecord.courier,
                feasibilityRecord.courierRate,
                feasibilityRecord.profitStatus,
                `"${feasibilityRecord.summary}"`,
                feasibilityRecord.paymentType,
                feasibilityRecord.fbrTax.toFixed(2),
                feasibilityRecord.shopifyPlan,
                feasibilityRecord.shopifyMonthlyCost,
                feasibilityRecord.bank,
                feasibilityRecord.debitCardTax,
                feasibilityRecord.adBudget,
                feasibilityRecord.costPerConversion,
                feasibilityRecord.totalMonthlyFixedCosts,
                feasibilityRecord.breakevenConversions,
                feasibilityRecord.netProfit,
                feasibilityRecord.breakEvenPrice,
                (feasibilityRecord.roasMultiplier || 0).toFixed(2),
                (feasibilityRecord.roasPercent || 0).toFixed(1)
            ].join(',')
        ];
        csvContent += rows.join('\n');
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report-${record.productName.replace(/ /g, "_")}-${record.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const handleDownloadPdf = (record: LaunchPlan | FeasibilityCheck, toast: any) => {
    toast({ title: "Generating PDF...", description: "Please wait a moment." });

    setTimeout(() => {
        const doc = new jsPDF() as jsPDFWithAutoTable;
        const isDark = document.documentElement.classList.contains('dark');
        const primaryColor = isDark ? '#90EE90' : '#10B981';
        const textColor = isDark ? '#FFFFFF' : '#000000';
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.setFontSize(20);
        doc.text("Profit Pakistan Pro", 105, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setTextColor(textColor);
        doc.text(`Report: ${record.productName}`, 105, 30, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Generated on: ${format(new Date(record.date), 'PPpp')}`, 105, 35, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(20, 40, 190, 40);

        const body = [];
        
        if (record.type === 'Launch') {
            const r = record as LaunchPlan;
            body.push(
                ['Product Category', r.category],
                ['Payment Type', r.paymentType],
                ['Profit Status', r.profitStatus],
                [{content: 'Key Metrics', styles: {fontStyle: 'bold', fillColor: isDark ? [40,40,40] : [240,240,240]}}],
                ['Profit Margin', `${r.profitMargin.toFixed(1)}%`],
                ['Profit per Unit', `PKR ${r.profitPerUnit.toLocaleString()}`],
                ['Breakeven ROAS', `1:${r.breakevenROAS.toFixed(2)}`],
                ['Breakeven Units', r.breakevenUnits.toLocaleString()],
                [{content: 'Inputs', styles: {fontStyle: 'bold', fillColor: isDark ? [40,40,40] : [240,240,240]}}],
                ['Sourcing Cost', `PKR ${r.sourcingCost.toLocaleString()}`],
                ['Selling Price', `PKR ${r.sellingPrice.toLocaleString()}`],
                ['Marketing Budget', `PKR ${r.marketingBudget.toLocaleString()}`],
                ['Courier', r.courier],
                ['Courier Rate', `PKR ${r.courierRate.toLocaleString()}`],
                ['FBR Tax (per unit)', `PKR ${r.fbrTax.toLocaleString()}`],
            );
        } else {
            const r = record as FeasibilityCheck;
            body.push(
                ['Product Category', r.category],
                ['Payment Type', r.paymentType],
                ['Profit Status', r.profitStatus],
                [{content: 'Key Metrics', styles: {fontStyle: 'bold', fillColor: isDark ? [40,40,40] : [240,240,240]}}],
                ['Estimated Net Profit', `PKR ${r.netProfit.toLocaleString()}`],
                ['Breakeven Conversions', r.breakevenConversions.toLocaleString()],
                ['Break-even Price', `PKR ${r.breakEvenPrice.toLocaleString()}`],
                ['ROAS', `${(r.roasMultiplier || 0).toFixed(2)}x (${(r.roasPercent || 0).toFixed(1)}%)`],
                [{content: 'Inputs', styles: {fontStyle: 'bold', fillColor: isDark ? [40,40,40] : [240,240,240]}}],
                ['Sourcing Cost', `PKR ${r.sourcingCost.toLocaleString()}`],
                ['Selling Price', `PKR ${r.sellingPrice.toLocaleString()}`],
                ['Shopify Plan', `${r.shopifyPlan} ($${r.shopifyMonthlyCost})`],
                ['Courier', r.courier],
                ['Bank for Payments', `${r.bank} (${r.debitCardTax}%)`],
                ['Monthly Ad Budget', `PKR ${r.adBudget.toLocaleString()}`],
                ['Cost per Conversion', `PKR ${r.costPerConversion.toLocaleString()}`],
                ['Courier Rate', `PKR ${r.courierRate.toLocaleString()}`],
                ['FBR Tax (per unit)', `PKR ${r.fbrTax.toLocaleString()}`],
            );
        }

        doc.autoTable({
            startY: 45,
            head: [['Metric', 'Value']],
            body: body,
            theme: isDark ? 'striped' : 'grid',
            headStyles: { fillColor: primaryColor, textColor: isDark ? '#000' : '#fff' },
            didParseCell: function (data) {
                if (data.row.raw && (data.row.raw as any).length === 1) {
                    data.cell.styles.halign = 'center';
                }
            },
        });
        
        const finalY = (doc as any).lastAutoTable.finalY;
        doc.setFontSize(8);
        doc.setTextColor(isDark ? '#AAAAAA' : '#888888');
        doc.text(
            "Courier rates applied as per live or default data for selected company. Taxes calculated per FBR Sec. 236Y rules.",
            14,
            finalY + 10
        );


        doc.save(`report-${record.productName.replace(/ /g, "_")}-${record.id}.pdf`);
    }, 500);
};

const LaunchResult = ({ record }: { record: LaunchPlan }) => (
    <>
    <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-3xl font-bold">{record.productName}</CardTitle>
                <CardDescription className="mt-1">{record.category} &middot; Report from {format(new Date(record.date), 'PP')}</CardDescription>
            </div>
            <Badge variant={getStatusVariant(record.profitStatus)} className="text-sm">{record.profitStatus}</Badge>
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
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Payment Type</span><span>{record.paymentType}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Courier</span><span>{record.courier}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">FBR Tax (per unit)</span><span>PKR {record.fbrTax.toLocaleString()}</span></li>
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
            <Badge variant={getStatusVariant(record.profitStatus)} className="text-sm">{record.profitStatus}</Badge>
        </div>
    </CardHeader>
    <CardContent className="space-y-6">
         <Card>
            <CardHeader><CardTitle className="text-lg">Analysis Summary</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{record.summary}</p></CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MetricCard label="Estimated Net Profit" value={record.netProfit} subtext="per month" />
            <MetricCard label="Return on Ad Spend (ROAS)" value={`${(record.roasMultiplier || 0).toFixed(2)}x`} subtext={`(${(record.roasPercent || 0).toFixed(1)}%)`} />
            <MetricCard label="Breakeven Conversions" value={record.breakevenConversions} subtext="sales needed to break even per month" />
            <MetricCard label="Break-even Price" value={record.breakEvenPrice} subtext="to cover per-unit costs" />
        </div>
        <Card>
            <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
            <CardContent>
                <ul className="divide-y">
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Sourcing Cost</span><span>PKR {record.sourcingCost.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Selling Price</span><span>PKR {record.sellingPrice.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Shopify Plan</span><span className="capitalize">{record.shopifyPlan} (${record.shopifyMonthlyCost})</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Payment Type</span><span>{record.paymentType}</span></li>
                     <li className="flex justify-between py-2"><span className="text-muted-foreground">FBR Tax (per unit)</span><span>PKR {record.fbrTax.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Bank</span><span>{record.bank} ({record.debitCardTax}%)</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Monthly Ad Budget</span><span>PKR {record.adBudget.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Cost per Conversion</span><span>PKR {record.costPerConversion.toLocaleString()}</span></li>
                     <li className="flex justify-between py-2"><span className="text-muted-foreground">Courier</span><span>{record.courier}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Courier Rate</span><span>PKR {record.courierRate.toLocaleString()}</span></li>
                </ul>
            </CardContent>
        </Card>
    </CardContent>
    </>
);


export const ResultDisplay = ({ record }: ResultDisplayProps) => {
    const { toast } = useToast();
    return (
        <Card className="w-full">
            {record.type === 'Launch' ? <LaunchResult record={record as LaunchPlan} /> : <FeasibilityResult record={record as FeasibilityCheck} />}
             <CardFooter className="flex-row-reverse border-t pt-6 gap-2">
                <Button onClick={() => handleDownloadPdf(record, toast)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
                <Button variant="outline" onClick={() => handleDownloadCsv(record)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                </Button>
            </CardFooter>
        </Card>
    );
};

    
