export type ProfitStatus = 'Profitable' | 'Near Breakeven' | 'Loss';

export type BaseAnalysis = {
  id?: string;
  userId: string;
  productName: string;
  category: string;
  date: string; // ISO string
  profitStatus: ProfitStatus;
  summary: string;
};

export type LaunchPlan = BaseAnalysis & {
  type: 'Launch';
  sourcingCost: number;
  sellingPrice: number;
  marketingBudget: number;
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
  courierRate: number;
  adBudget: number;
  costPerConversion: number;
  sellingPrice: number;
  sourcingCost: number;

  // Calculated
  totalMonthlyFixedCosts: number;
  breakevenConversions: number;
  netProfit: number;
};

export type HistoryRecord = (LaunchPlan | FeasibilityCheck) & { id: string };
