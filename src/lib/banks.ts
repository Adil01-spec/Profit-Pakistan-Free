
import type { Bank } from './types';

// Updated with user-provided conversion fees
export const defaultBanks: Bank[] = [
  { name: 'Meezan Bank', tax: 2.75 },
  { name: 'HBL', tax: 3.0 },
  { name: 'UBL', tax: 2.5 },
  { name: 'Sadapay', tax: 1.5 },
  { name: 'Nayapay', tax: 1.75 },
  { name: 'Standard Chartered', tax: 2.0 },
  { name: 'Bank Alfalah', tax: 1.8 },
  { name: 'Faysal Bank', tax: 1.5 },
  { name: 'Easypaisa', tax: 2.5 },
  { name: 'Other', tax: 2.0 },
];
