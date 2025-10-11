'use client';
import { HistoryRecord } from "@/lib/types";
import { createContext, useContext, ReactNode } from "react";
import { createLocalStorageStateHook } from 'use-local-storage-state';

interface HistoryContextType {
    history: HistoryRecord[];
    setHistory: (history: HistoryRecord[] | ((prev: HistoryRecord[]) => HistoryRecord[])) => void;
    addHistoryRecord: (record: HistoryRecord) => void;
    clearHistory: () => void;
    loading: boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const useHistoryState = createLocalStorageStateHook<HistoryRecord[]>('history', []);

export function HistoryProvider({ children }: { children: ReactNode }) {
    const [history, setHistory, { isLoading }] = useHistoryState();

    const addHistoryRecord = (record: HistoryRecord) => {
        setHistory(prev => [record, ...prev]);
    };

    const clearHistory = () => {
        setHistory([]);
    };
    
    const value = { history: history ?? [], setHistory, addHistoryRecord, clearHistory, loading: isLoading };

    return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
