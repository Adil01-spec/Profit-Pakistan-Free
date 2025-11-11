
'use client';
import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { v4 as uuidv4 } from 'uuid';

const DAILY_EXPORT_LIMIT = 2; // Keep free limits
const DAILY_AI_LIMIT = 5;     // Keep free limits
const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

type Feature = 'export' | 'ai';

interface Usage {
  used: number;
  limit: number;
}

interface UsageState {
  export: Usage;
  ai: Usage;
  lastReset: number; // timestamp
}

interface UsageContextType {
  usageState: UsageState;
  isUsageLoading: boolean;
  canUseFeature: (feature: Feature) => boolean;
  recordFeatureUsage: (feature: Feature) => void;
  grantUsage: (feature: Feature, amount: number) => void;
  userId: string | null;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

const initialUsageState: UsageState = {
  export: { used: 0, limit: DAILY_EXPORT_LIMIT },
  ai: { used: 0, limit: DAILY_AI_LIMIT },
  lastReset: Date.now(),
};

interface UsageProviderProps {
    children: ReactNode;
}

export function UsageProvider({ children }: UsageProviderProps) {
  const [localDeviceId, setLocalDeviceId] = useLocalStorageState<string | null>('device_id', null);
  const [sessionUsage, setSessionUsage] = useLocalStorageState<UsageState>('usage-session', {
      defaultValue: initialUsageState,
      storageSync: false
  });

  const [isUsageLoading, setIsUsageLoading] = useState(true);

  useEffect(() => {
    // Ensure device ID exists for tracking usage
    if (!localDeviceId) {
      setLocalDeviceId(uuidv4());
    }

    // Check if usage needs to be reset
    const now = Date.now();
    if (now - sessionUsage.lastReset > TWENTY_FOUR_HOURS_IN_MS) {
      setSessionUsage({ ...initialUsageState, lastReset: now });
    }
    setIsUsageLoading(false);
  }, [localDeviceId, setLocalDeviceId, sessionUsage, setSessionUsage]);

  const canUseFeature = (feature: Feature) => {
    return sessionUsage[feature].used < sessionUsage[feature].limit;
  };

  const recordFeatureUsage = (feature: Feature) => {
    if (canUseFeature(feature)) {
      setSessionUsage(prev => ({
          ...prev,
          [feature]: { ...prev[feature], used: prev[feature].used + 1 },
        }));
    }
  };

  const grantUsage = (feature: Feature, amount: number) => {
    setSessionUsage(prev => ({
      ...prev,
      [feature]: { ...prev[feature], limit: prev[feature].limit + amount },
    }));
  };

  const value = {
    usageState: sessionUsage,
    isUsageLoading,
    canUseFeature,
    recordFeatureUsage,
    grantUsage,
    userId: localDeviceId
  };

  return <UsageContext.Provider value={value}>{children}</UsageContext.Provider>;
}

export const useUsage = () => {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error('useUsage must be used within a UsageProvider');
  }
  return context;
};
