
'use client';
import { HistoryRecord } from "@/lib/types";
import { createContext, useContext, ReactNode } from "react";
import useLocalStorageState from 'use-local-storage-state';

interface HistoryContextType {
    history: HistoryRecord[];
    addHistoryRecord: (record: HistoryRecord) => void;
    removeHistoryRecord: (recordId: string) => void;
    clearHistory: () => void;
    loading: boolean;
    isPersistent: boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
    // App works without auth, so we only use session storage.
    const [sessionHistory, setSessionHistory, { isLoading }] = useLocalStorageState<HistoryRecord[]>('history-session', {
      defaultValue: [],
      storageSync: false, // This ensures it doesn't sync across tabs, acting like session storage.
    });

    const addHistoryRecord = (record: HistoryRecord) => {
        setSessionHistory(prev => [record, ...(prev ?? [])]);
    };

    const removeHistoryRecord = (recordId: string) => {
        setSessionHistory(prev => (prev ?? []).filter(r => r.id !== recordId));
    };

    const clearHistory = () => {
        setSessionHistory([]);
    };
    
    // isPersistent is always false in the free, unauthenticated version.
    const value = { 
        history: sessionHistory ?? [], 
        addHistoryRecord, 
        removeHistoryRecord, 
        clearHistory, 
        loading: isLoading,
        isPersistent: false 
    };

    return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
