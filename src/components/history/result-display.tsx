
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LaunchPlan, FeasibilityCheck } from "@/lib/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Download, Loader2 } from "lucide-react";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUsage } from "@/hooks/use-usage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { TaxBreakdown } from "../tax-breakdown";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { WhatIfSimulator } from "./what-if-simulator";


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
    <p className="text-xl md:text-2xl font-bold">{typeof value === 'number' ? `PKR ${value.toLocaleString('en-US', {maximumFractionDigits: 0})}` : value}</p>
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
        const headers = [...universalHeaders, "Shopify Plan", "Shopify Monthly Cost (USD)", "Bank", "Debit Card Tax (%)", "Ad Budget", "Actual Ad Spend", "Cost Per Conversion", "Returned Orders (%)", "Total Monthly Fixed Costs", "Breakeven Conversions", "Net Profit", "Break-even Price", "ROAS Multiplier", "ROAS Percent"];
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
                feasibilityRecord.adSpend || 0,
                feasibilityRecord.costPerConversion,
                feasibilityRecord.returnedOrdersPercent || 0,
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
        doc.text("Profit Pakistan", 105, 20, { align: 'center' });
        
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
            const roasLabel = r.adSpend && r.adSpend > 0 ? 'ROAS (Actual)' : 'ROAS (Estimated)';
            body.push(
                ['Product Category', r.category],
                ['Payment Type', r.paymentType],
                ['Profit Status', r.profitStatus],
                [{content: 'Key Metrics', styles: {fontStyle: 'bold', fillColor: isDark ? [40,40,40] : [240,240,240]}}],
                ['Estimated Net Profit', `PKR ${r.netProfit.toLocaleString()}`],
                ['Breakeven Conversions', r.breakevenConversions.toLocaleString()],
                ['Break-even Price', `PKR ${r.breakEvenPrice.toLocaleString()}`],
                [roasLabel, `${(r.roasMultiplier || 0).toFixed(2)}x (${(r.roasPercent || 0).toFixed(1)}%)`],
                [{content: 'Inputs', styles: {fontStyle: 'bold', fillColor: isDark ? [40,40,40] : [240,240,240]}}],
                ['Sourcing Cost', `PKR ${r.sourcingCost.toLocaleString()}`],
                ['Selling Price', `PKR ${r.sellingPrice.toLocaleString()}`],
                ['Shopify Plan', `${r.shopifyPlan} ($${r.shopifyMonthlyCost})`],
                ['Courier', r.courier],
                ['Bank for Payments', `${r.bank} (${r.debitCardTax}%)`],
                ['Monthly Ad Budget', `PKR ${r.adBudget.toLocaleString()}`],
                ['Returned Orders', `${r.returnedOrdersPercent || 0}%`],
                ['Cost per Conversion', `PKR ${r.costPerConversion?.toLocaleString() || 'N/A'}`],
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
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">{record.productName}</CardTitle>
                <CardDescription className="mt-1">{record.category} &middot; Report from {format(new Date(record.date), 'PP')}</CardDescription>
            </div>
            <Badge variant={getStatusVariant(record.profitStatus)} className="text-sm mt-2 sm:mt-0">{record.profitStatus}</Badge>
        </div>
    </CardHeader>
    <CardContent className="space-y-6">
        <Card>
            <CardHeader><CardTitle className="text-lg">Analysis Summary</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{record.summary}</p></CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <MetricCard label="Profit Margin" value={`${record.profitMargin.toFixed(1)}%`} />
            <MetricCard label="Profit per Unit" value={record.profitPerUnit} />
            <MetricCard label="Breakeven ROAS" value={`1:${record.breakevenROAS.toFixed(2)}`} subtext="Sell Price / Profit per Unit"/>
            <MetricCard label="Breakeven Units" value={record.breakevenUnits} subtext="To cover monthly marketing budget" />
        </div>
        
        {record.taxDetails && <TaxBreakdown details={record.taxDetails} />}

        <Card>
            <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
            <CardContent>
                <ul className="divide-y text-sm">
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
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">{record.productName}</CardTitle>
                <CardDescription className="mt-1">{record.category} &middot; Report from {format(new Date(record.date), 'PP')}</CardDescription>
            </div>
            <Badge variant={getStatusVariant(record.profitStatus)} className="text-sm mt-2 sm:mt-0">{record.profitStatus}</Badge>
        </div>
    </CardHeader>
    <CardContent className="space-y-6">
         <Card>
            <CardHeader><CardTitle className="text-lg">Analysis Summary</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{record.summary}</p></CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MetricCard label="Estimated Net Profit" value={record.netProfit} subtext="per month" />
            <MetricCard label="Return on Ad Spend (ROAS)" value={`${(record.roasMultiplier || 0).toFixed(2)}x`} subtext={`${(record.adSpend && record.adSpend > 0) ? '(Actual)' : '(Estimated)'} (${(record.roasPercent || 0).toFixed(1)}%)`} />
            <MetricCard label="Breakeven Conversions" value={record.breakevenConversions} subtext="sales needed to break even per month" />
            <MetricCard label="Break-even Price" value={record.breakEvenPrice} subtext="to cover per-unit costs" />
        </div>

        {record.taxDetails && <TaxBreakdown details={record.taxDetails} />}

        <Card>
            <CardHeader><CardTitle className="text-lg">Inputs</CardTitle></CardHeader>
            <CardContent>
                <ul className="divide-y text-sm">
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Sourcing Cost</span><span>PKR {record.sourcingCost.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Selling Price</span><span>PKR {record.sellingPrice.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Shopify Plan</span><span className="capitalize">{record.shopifyPlan} ($${record.shopifyMonthlyCost})</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Payment Type</span><span>{record.paymentType}</span></li>
                     <li className="flex justify-between py-2"><span className="text-muted-foreground">FBR Tax (per unit)</span><span>PKR {record.fbrTax.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Bank</span><span>{record.bank} (${record.debitCardTax}%)</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Monthly Ad Budget</span><span>PKR {record.adBudget.toLocaleString()}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Returned Orders</span><span>{record.returnedOrdersPercent || 0}%</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Cost per Conversion</span><span>PKR {(record.costPerConversion || 0).toLocaleString()}</span></li>
                     <li className="flex justify-between py-2"><span className="text-muted-foreground">Courier</span><span>{record.courier}</span></li>
                    <li className="flex justify-between py-2"><span className="text-muted-foreground">Courier Rate</span><span>PKR {record.courierRate.toLocaleString()}</span></li>
                </ul>
            </CardContent>
        </Card>
        
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="what-if">
                <AccordionTrigger className="text-lg font-semibold">💡 What-If Simulator: Try Different Scenarios</AccordionTrigger>
                <AccordionContent>
                    <WhatIfSimulator initialRecord={record} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>

    </CardContent>
    </>
);


export const ResultDisplay = ({ record }: ResultDisplayProps) => {
    const { toast } = useToast();
    const { usageState, canUseFeature, recordFeatureUsage, grantUsage } = useUsage();
    const [showAdPrompt, setShowAdPrompt] = useState(false);
    const [isAdLoading, setIsAdLoading] = useState(false);
    const [downloadType, setDownloadType] = useState<'pdf' | 'csv' | null>(null);

    const canDownload = canUseFeature('export');
    const downloadsLeft = usageState.export.limit - usageState.export.used;

    const checkAndTriggerDownload = (type: 'pdf' | 'csv') => {
        if (canDownload) {
            recordFeatureUsage('export');
            if (type === 'pdf') handleDownloadPdf(record, toast);
            else handleDownloadCsv(record);
        } else {
            setDownloadType(type);
            setShowAdPrompt(true);
        }
    };

    const handleWatchAd = () => {
        setIsAdLoading(true);
        setTimeout(() => {
            grantUsage('export', 1);
            setIsAdLoading(false);
            setShowAdPrompt(false);
            toast({
                title: '✅ Export unlocked',
                description: 'Enjoy your download!',
            });
            if (downloadType) {
                if (downloadType === 'pdf') handleDownloadPdf(record, toast);
                else handleDownloadCsv(record);
                setDownloadType(null);
            }
        }, 1500);
    };

    const onAdPromptOpenChange = (open: boolean) => {
        if (!open) {
            setShowAdPrompt(false);
            if (!isAdLoading) {
                 toast({
                    variant: 'destructive',
                    title: '⚠️ Watch a short ad to download again.',
                });
            }
        }
    }


    return (
        <>
            <Card className="w-full overflow-hidden">
                {record.type === 'Launch' ? <LaunchResult record={record as LaunchPlan} /> : <FeasibilityResult record={record as FeasibilityCheck} />}
                <CardFooter className="flex-col sm:flex-col items-start border-t pt-6 gap-2">
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-full sm:w-auto">
                                        <Button onClick={() => checkAndTriggerDownload('pdf')} className="w-full" disabled={!canDownload && !isAdLoading}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download PDF
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                {!canDownload && <TooltipContent><p>Watch ad to unlock.</p></TooltipContent>}
                            </Tooltip>
                        </TooltipProvider>
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="w-full sm:w-auto">
                                        <Button variant="outline" onClick={() => checkAndTriggerDownload('csv')} className="w-full" disabled={!canDownload && !isAdLoading}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Download CSV
                                        </Button>
                                    </div>
                                </TooltipTrigger>
                                {!canDownload && <TooltipContent><p>Watch ad to unlock.</p></TooltipContent>}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                     <p className="text-xs text-muted-foreground mt-2 text-left w-full">
                        Free users get {usageState.export.limit} download daily. {downloadsLeft > 0 ? `${downloadsLeft} left.` : "Watch ads to unlock more."}
                    </p>
                </CardFooter>
            </Card>

             <AlertDialog open={showAdPrompt} onOpenChange={onAdPromptOpenChange}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Unlock Another Download</AlertDialogTitle>
                    <AlertDialogDescription>
                    You’ve used your free report export for today. Watch a short ad to unlock another download.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Maybe Later</AlertDialogCancel>
                    <AlertDialogAction onClick={handleWatchAd} disabled={isAdLoading}>
                        {isAdLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Watch Ad
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
