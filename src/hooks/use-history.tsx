'use client';
import { HistoryRecord } from "@/lib/types";
import { createContext, useContext, ReactNode } from "react";
import useLocalStorageState from 'use-local-storage-state';

interface HistoryContextType {
    history: HistoryRecord[];
    setHistory: (history: HistoryRecord[] | ((prev: HistoryRecord[]) => HistoryRecord[])) => void;
    addHistoryRecord: (record: HistoryRecord) => void;
    removeHistoryRecord: (recordId: string) => void;
    clearHistory: () => void;
    loading: boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
    const [history, setHistory, { isLoading }] = useLocalStorageState<HistoryRecord[]>('history', { defaultValue: [] });

    const addHistoryRecord = (record: HistoryRecord) => {
        setHistory(prev => [record, ...(prev ?? [])]);
    };

    const removeHistoryRecord = (recordId: string) => {
        setHistory(prev => (prev ?? []).filter(r => r.id !== recordId));
    };

    const clearHistory = () => {
        setHistory([]);
    };
    
    const value = { history: history ?? [], setHistory, addHistoryRecord, removeHistoryRecord, clearHistory, loading: isLoading };

    return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
