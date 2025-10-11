'use client';
import { HistoryRecord } from "@/lib/types";
import { createContext, useContext } from "react";
import createPersistedState from 'use-local-storage-state';

interface HistoryContextType {
    history: HistoryRecord[];
    setHistory: (history: HistoryRecord[]) => void;
    addHistoryRecord: (record: HistoryRecord) => void;
    clearHistory: () => void;
    loading: boolean;
}

const useHistoryState = createPersistedState<HistoryRecord[]>('history', {
    defaultValue: []
});

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);


export function HistoryProvider({ children }: { children: React.ReactNode }) {
    const [history, setHistory, { isLoading }] = useHistoryState();

    const addHistoryRecord = (record: HistoryRecord) => {
        setHistory(prev => [record, ...prev]);
    };

    const clearHistory = () => {
        setHistory([]);
    };
    
    const value = { history, setHistory, addHistoryRecord, clearHistory, loading: isLoading };

    return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
