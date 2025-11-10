
'use client';
import { HistoryRecord } from "@/lib/types";
import { createContext, useContext, ReactNode, useEffect } from "react";
import useLocalStorageState from 'use-local-storage-state';
import createPersistedState from 'use-persisted-state';
import { useFirebase } from "@/firebase/provider";

const useSessionStorageState = createPersistedState('history', sessionStorage);

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
    const { user, isUserLoading } = useFirebase();

    // Determine which storage to use based on authentication
    const [localHistory, setLocalHistory, { isLoading: isLocalLoading }] = useLocalStorageState<HistoryRecord[]>('history', { defaultValue: [] });
    const [sessionHistory, setSessionHistory] = useSessionStorageState<HistoryRecord[]>([]);

    const isPersistent = !!user;
    const history = isPersistent ? localHistory : sessionHistory;
    
    const setHistory = (update: HistoryRecord[] | ((prev: HistoryRecord[]) => HistoryRecord[])) => {
        if (isPersistent) {
            setLocalHistory(update as any);
        } else {
            setSessionHistory(update as any);
        }
    };

    const addHistoryRecord = (record: HistoryRecord) => {
        setHistory(prev => [record, ...(prev ?? [])]);
    };

    const removeHistoryRecord = (recordId: string) => {
        setHistory(prev => (prev ?? []).filter(r => r.id !== recordId));
    };

    const clearHistory = () => {
        setHistory([]);
    };
    
    const value = { 
        history: history ?? [], 
        addHistoryRecord, 
        removeHistoryRecord, 
        clearHistory, 
        loading: isUserLoading || isLocalLoading,
        isPersistent
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
