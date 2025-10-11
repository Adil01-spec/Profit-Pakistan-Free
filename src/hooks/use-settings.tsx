'use client';
import { AppSettings } from "@/lib/types";
import { defaultBanks } from "@/lib/banks";
import { createContext, useContext, ReactNode } from "react";
import useLocalStorageState from 'use-local-storage-state';

const SettingsContext = createContext<[AppSettings, React.Dispatch<React.SetStateAction<AppSettings>>, {isPersistent: boolean;}] | undefined>(undefined);

const defaultSettings: AppSettings = {
    banks: defaultBanks,
    taxRate: 5,
};

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings, { isPersistent }] = useLocalStorageState<AppSettings>('settings', {
        defaultValue: defaultSettings
    });

    const value: [AppSettings, React.Dispatch<React.SetStateAction<AppSettings>>, {isPersistent: boolean;}] = [settings, setSettings, { isPersistent }];

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
