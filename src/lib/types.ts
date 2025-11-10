
export type ProfitStatus = 'Profitable' | 'Near Breakeven' | 'Loss';
export type PaymentType = 'COD' | 'Online';

export type TaxDetails = {
    bankFee: number;
    wht: number;
    fed: number;
    provincialTax: number;
    total: number;
    bankFeePercent: number;
    whtPercent: number;
    fedImpactPercent: number;
    provincialTaxPercent: number;
  };

export type BaseAnalysis = {
  id: string;
  productName: string;
  category: string;
  date: string; // ISO string
  profitStatus: ProfitStatus;
  summary: string;
  paymentType: PaymentType;
  fbrTax: number;
  taxDetails?: TaxDetails | null;
};

export type LaunchPlan = BaseAnalysis & {
  type: 'Launch';
  sourcingCost: number;
  sellingPrice: number;
  marketingBudget: number;
  courier: string;
  courierRate: number;
  
  // Calculated
  profitPerUnit: number;
  breakevenUnits: number;
  profitMargin: number;
  breakevenROAS: number;
};

export type FeasibilityCheck = BaseAnalysis & {
  type: 'Feasibility';
  shopifyPlan: 'trial' | 'regular';
  shopifyMonthlyCost: number;
  bank: string;
  debitCardTax: number;
  courier: string;
  courierRate: number;
  adBudget: number;
  adSpend?: number;
  costPerConversion?: number;
  sellingPrice: number;
  sourcingCost: number;
  adDurationDays?: number;
  ordersReceived?: number;
  returnedOrdersCount?: number;
  returnedOrdersPercent?: number;

  // Calculated
  totalMonthlyFixedCosts: number;
  breakevenConversions: number;
  netProfit: number;
  breakEvenPrice: number;
  profitMargin: number;
  roasMultiplier: number;
  roasPercent: number;
};

export type HistoryRecord = LaunchPlan | FeasibilityCheck;

export type Bank = {
  name: string;
  tax: number;
};

export type ShopifyPlan = {
    plan: string;
    costPerMonth: number;
}

export interface AppSettings {
    banks: Bank[];
    shopifyPlans: ShopifyPlan[];
    taxRate: number;
    isFiler: boolean;
    provincialTaxEnabled: boolean;
    provincialTaxRate: number;
}

    