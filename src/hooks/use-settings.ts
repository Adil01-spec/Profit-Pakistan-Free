'use client';
import { AppSettings } from "@/lib/types";
import { defaultBanks } from "@/lib/banks";
import { createContext, useContext } from "react";
import createPersistedState from 'use-local-storage-state';

const useSettingsState = createPersistedState<AppSettings>('settings', {
    defaultValue: {
        banks: defaultBanks,
        taxRate: 5,
    }
});

const SettingsContext = createContext<ReturnType<typeof useSettingsState> | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const value = useSettingsState();
    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
