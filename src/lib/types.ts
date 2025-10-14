export type ProfitStatus = 'Profitable' | 'Near Breakeven' | 'Loss';
export type PaymentType = 'COD' | 'Online';

export type BaseAnalysis = {
  id: string;
  productName: string;
  category: string;
  date: string; // ISO string
  profitStatus: ProfitStatus;
  summary: string;
  paymentType: PaymentType;
  fbrTax: number;
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
  costPerConversion: number;
  sellingPrice: number;
  sourcingCost: number;

  // Calculated
  totalMonthlyFixedCosts: number;
  breakevenConversions: number;
  netProfit: number;
  breakEvenPrice: number;
  profitMargin: number;
  roas: number;
  roasMultiplier: number;
  roasPercent: number;
};

export type HistoryRecord = LaunchPlan | FeasibilityCheck;

export type Bank = {
  name: string;
  tax: number;
};

export interface AppSettings {
    banks: Bank[];
    taxRate: number;
}
