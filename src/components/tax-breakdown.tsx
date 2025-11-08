
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { TaxDetails } from '@/lib/types';
import { Coins } from 'lucide-react';

interface TaxBreakdownProps {
  details: TaxDetails;
}

const formatPkr = (num: number) => {
    return `PKR ${num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};

export function TaxBreakdown({ details }: TaxBreakdownProps) {
  if (!details || details.total <= 0) return null;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="tax-breakdown">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold">💸 Tax Breakdown</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 rounded-md border bg-background/50 p-4">
            <ul className="space-y-1 text-sm">
              {details.bankFee > 0 && (
                <li className="flex justify-between">
                    <span className="text-muted-foreground">Bank Conversion Fee ({details.bankFeePercent.toFixed(2)}%)</span>
                    <span>{formatPkr(details.bankFee)}</span>
                </li>
              )}
              <li className="flex justify-between">
                <span className="text-muted-foreground">Withholding Tax (WHT) ({details.whtPercent.toFixed(1)}%)</span>
                <span>{formatPkr(details.wht)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Federal Excise Duty (FED Impact)</span>
                <span>{formatPkr(details.fed)}</span>
              </li>
              {details.provincialTax > 0 && (
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Provincial Sales Tax ({details.provincialTaxPercent.toFixed(1)}%)</span>
                  <span>{formatPkr(details.provincialTax)}</span>
                </li>
              )}
            </ul>
            <div className="!mt-4 flex justify-between border-t pt-2 font-bold">
              <span>Total Int'l Transaction Taxes</span>
              <span>{formatPkr(details.total)}</span>
            </div>
          </div>
          <p className="mt-2 px-1 text-xs text-muted-foreground">
            *These tax values are estimates based on Pakistan’s current international payment deductions and may vary by bank or payment processor.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
