
'use client';
import { HistoryRecord } from "@/lib/types";
import { createContext, useContext, ReactNode, useEffect } from "react";
import useLocalStorageState from 'use-local-storage-state';
import { useFirebase } from "@/firebase/provider";

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
    const [sessionHistory, setSessionHistory] = useLocalStorageState<HistoryRecord[]>('history-session', {
      defaultValue: [],
      storageSync: false, // Important for session storage
    });
    
    useEffect(() => {
        // use-local-storage-state does not have a direct session storage option, so we simulate it.
        // This is a simple way to ensure it doesn't sync across tabs, but data will persist if a tab is refreshed.
        // True session-only storage would require a different library or custom implementation.
        // For this app's purpose, this is a sufficient approximation.
    }, []);


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
