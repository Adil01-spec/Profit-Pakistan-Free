
'use client';
import { AppSettings } from "@/lib/types";
import { defaultBanks } from "@/lib/banks";
import { defaultShopifyPlans } from "@/lib/shopify-plans";
import { createContext, useContext, ReactNode } from "react";
import useLocalStorageState from 'use-local-storage-state';

const SettingsContext = createContext<[AppSettings, (newValue: AppSettings | ((prevState: AppSettings) => AppSettings)) => void, {isPersistent: boolean;}] | undefined>(undefined);

const defaultSettings: AppSettings = {
    banks: defaultBanks,
    shopifyPlans: defaultShopifyPlans,
    taxRate: 5,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings, { isPersistent }] = useLocalStorageState<AppSettings>('settings', {
        defaultValue: defaultSettings
    });

    const value: [AppSettings, (newValue: AppSettings | ((prevState: AppSettings) => AppSettings)) => void, {isPersistent: boolean;}] = [settings ?? defaultSettings, setSettings, { isPersistent }];

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

    