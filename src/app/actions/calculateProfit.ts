'use server';

type ProfitRequest = {
  productName: string;
  category: string;
  sellingPrice: number;
  sourcingCost: number;
  courierCost: number;
  adSpend: number; // Combined from adBudget or costPerConversion logic
  paymentType: 'COD' | 'Online';
  shopifyMonthlyCost: number; // USD
  shopifyPlan: 'trial' | 'regular';
  conversions: number; // Number of sales/conversions
  bankFeePercent: number;
};

type FeasibilityResult = {
  id: string;
  type: 'Feasibility';
  date: string;
  productName: string;
  category: string;
  profitStatus: 'Profitable' | 'Near Breakeven' | 'Loss';
  summary: string;

  // Inputs
  sourcingCost: number;
  sellingPrice: number;
  adBudget: number;
  costPerConversion: number;
  courier: string;
  courierRate: number;
  paymentType: 'COD' | 'Online';
  bank: string;
  debitCardTax: number;
  shopifyPlan: 'trial' | 'regular';
  shopifyMonthlyCost: number;

  // Calculated
  netProfit: number;
  profitMargin: number;
  roasMultiplier: number;
  roasPercent: number;
  breakevenConversions: number;
  breakEvenPrice: number;
  totalMonthlyFixedCosts: number;
  fbrTax: number;
};

type LaunchPlanResult = {
  id: string;
  type: 'Launch';
  date: string;
  productName: string;
  category: string;
  profitStatus: 'Profitable' | 'Near Breakeven' | 'Loss';
  summary: string;

  // Inputs
  sourcingCost: number;
  sellingPrice: number;
  marketingBudget: number;
  courier: string;
  courierRate: number;
  paymentType: 'COD' | 'Online';

  // Calculated
  profitPerUnit: number;
  breakevenUnits: number;
  profitMargin: number;
  breakevenROAS: number;
  fbrTax: number;
};

const toNum = (val: any): number => {
  const n = parseFloat(val);
  return isFinite(n) ? n : 0;
};

export async function calculateFeasibilityAction(
  data: any
): Promise<FeasibilityResult | { error: string }> {
  const sourcingCost = toNum(data.sourcingCost);
  const sellingPrice = toNum(data.sellingPrice);
  const adBudget = toNum(data.adBudget);
  const costPerConversion = toNum(data.costPerConversion);
  const courierRate = toNum(data.courierRate);
  const shopifyMonthlyCost =
    data.shopifyPlan === 'trial' ? 1 : toNum(data.shopifyMonthlyCost);
  const paymentType = data.paymentType;

  if (sellingPrice <= sourcingCost) {
    return { error: 'Selling price must be greater than sourcing cost.' };
  }

  // --- CALCULATIONS ---
  const shopifyCostPkr = shopifyMonthlyCost * 300; // Approx USD to PKR
  const totalMonthlyFixedCosts = shopifyCostPkr + adBudget;

  const fbrTaxRate = paymentType === 'COD' ? 0.02 : 0.01;
  const fbrTax = sellingPrice * fbrTaxRate;

  const profitPerSale = sellingPrice - sourcingCost - courierRate - fbrTax;
  const breakevenConversions =
    totalMonthlyFixedCosts > 0 && profitPerSale > 0
      ? Math.ceil(totalMonthlyFixedCosts / profitPerSale)
      : 0;

  const conversionsPerMonth =
    adBudget > 0 && costPerConversion > 0 ? adBudget / costPerConversion : 0;
  const totalRevenue = conversionsPerMonth * sellingPrice;
  const totalSourcingCost = conversionsPerMonth * sourcingCost;
  const totalCourierCost = conversionsPerMonth * courierRate;
  const totalFbrTax = conversionsPerMonth * fbrTax;

  const netProfit =
    totalRevenue -
    totalSourcingCost -
    totalCourierCost -
    totalMonthlyFixedCosts -
    totalFbrTax;

  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const roasMultiplier = adBudget > 0 ? totalRevenue / adBudget : 0;
  const roasPercent = roasMultiplier * 100;

  let profitStatus: 'Profitable' | 'Near Breakeven' | 'Loss' = 'Loss';
  let summary =
    "You're projected to be at a loss. You need more sales or lower costs to be profitable.";
  if (netProfit > 0) {
    profitStatus = 'Profitable';
    summary = `You are making an estimated profit of PKR ${netProfit.toLocaleString(
      'en-US',
      { maximumFractionDigits: 0 }
    )}/month.`;
  } else if (netProfit > -totalMonthlyFixedCosts * 0.2 && netProfit <= 0) {
    profitStatus = 'Near Breakeven';
    summary = `You're close to breaking even. A small improvement in sales or costs could make you profitable.`;
  }

  const breakEvenPrice = sourcingCost + courierRate + fbrTax;

  return {
    ...data,
    totalMonthlyFixedCosts: totalMonthlyFixedCosts || 0,
    breakevenConversions: breakevenConversions || 0,
    netProfit: netProfit || 0,
    summary,
    profitStatus,
    breakEvenPrice: breakEvenPrice || 0,
    fbrTax: fbrTax || 0,
    profitMargin: profitMargin || 0,
    roasMultiplier: roasMultiplier || 0,
    roasPercent: roasPercent || 0,
  };
}

export async function calculateLaunchPlanAction(
  data: any
): Promise<LaunchPlanResult | { error: string }> {
  const sourcingCost = toNum(data.sourcingCost);
  const sellingPrice = toNum(data.sellingPrice);
  const marketingBudget = toNum(data.marketingBudget);
  const courierRate = toNum(data.courierRate);
  const paymentType = data.paymentType;

  if (sellingPrice <= sourcingCost) {
    return { error: 'Selling price must be greater than sourcing cost.' };
  }

  // --- CALCULATIONS ---
  const fbrTaxRate = paymentType === 'COD' ? 0.02 : 0.01;
  const fbrTax = sellingPrice * fbrTaxRate;

  const profitPerUnit = sellingPrice - sourcingCost - courierRate - fbrTax;
  const breakevenUnits =
    marketingBudget > 0 && profitPerUnit > 0
      ? Math.ceil(marketingBudget / profitPerUnit)
      : 0;
  const profitMargin =
    sellingPrice > 0 ? (profitPerUnit / sellingPrice) * 100 : 0;
  const breakevenROAS = profitPerUnit > 0 ? sellingPrice / profitPerUnit : 0;

  let profitStatus: 'Profitable' | 'Near Breakeven' | 'Loss' = 'Loss';
  let summary =
    'This product seems unprofitable at these metrics. Consider increasing the selling price or reducing costs.';
  if (profitMargin > 15) {
    profitStatus = 'Profitable';
    summary = `With a ${profitMargin.toFixed(
      1
    )}% profit margin, this product looks promising.`;
  } else if (profitMargin > 0) {
    profitStatus = 'Near Breakeven';
    summary = `The profit margin is low (${profitMargin.toFixed(
      1
    )}%). Be cautious with ad spend.`;
  }
  
  return {
    ...data,
    profitPerUnit: profitPerUnit || 0,
    breakevenUnits: breakevenUnits || 0,
    profitMargin: profitMargin || 0,
    breakevenROAS: breakevenROAS || 0,
    profitStatus,
    summary,
    fbrTax: fbrTax || 0,
  };
}
