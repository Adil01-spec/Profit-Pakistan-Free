'use client';
import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

const DAILY_EXPORT_LIMIT = 1;
const DAILY_AI_LIMIT = 2;
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

export function UsageProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const firestore = useFirestore();
  const [userId, setUserId] = useLocalStorage<string | null>('device_id', null);
  const [usageState, setUsageState] = useState<UsageState>(initialUsageState);
  const [isUsageLoading, setIsUsageLoading] = useState(true);

  const getUsageDocRef = useCallback((uid: string) => {
      if (!firestore) return null;
      return doc(firestore, 'free_usage', uid);
  }, [firestore]);
  
  // Effect for authenticating and fetching/creating usage data
  useEffect(() => {
    const handleAuth = async () => {
      if (auth.currentUser) {
        setUserId(auth.currentUser.uid);
        return auth.currentUser.uid;
      }
      
      try {
        const userCredential = await signInAnonymously(auth);
        setUserId(userCredential.user.uid);
        return userCredential.user.uid;
      } catch (error) {
        console.error("Anonymous sign-in failed", error);
        // Fallback to a temporary device ID if auth fails
        const tempId = userId || uuidv4();
        if (!userId) setUserId(tempId);
        return tempId;
      }
    };

    const syncUsage = async (uid: string) => {
      setIsUsageLoading(true);
      const docRef = getUsageDocRef(uid);
      if (!docRef) {
          setIsUsageLoading(false);
          return;
      }

      try {
        const docSnap = await getDoc(docRef);
        const now = Date.now();

        if (docSnap.exists()) {
          const data = docSnap.data();
          const lastReset = (data.lastReset?.toDate() || new Date(0)).getTime();

          if (now - lastReset > TWENTY_FOUR_HOURS_IN_MS) {
            // Reset expired
            const newState = { ...initialUsageState, lastReset: now };
            setUsageState(newState);
            await setDoc(docRef, { 
                exportsUsed: 0, 
                aiPromptsUsed: 0,
                lastReset: serverTimestamp() 
            });
          } else {
            // Still within 24h window
            setUsageState({
              export: { used: data.exportsUsed || 0, limit: DAILY_EXPORT_LIMIT },
              ai: { used: data.aiPromptsUsed || 0, limit: DAILY_AI_LIMIT },
              lastReset: lastReset,
            });
          }
        } else {
          // No record, create one
          const newState = { ...initialUsageState, lastReset: now };
          setUsageState(newState);
          await setDoc(docRef, { 
            exportsUsed: 0, 
            aiPromptsUsed: 0,
            lastReset: serverTimestamp() 
          });
        }
      } catch (error) {
        console.error("Failed to sync usage from Firestore:", error);
        // Use local state as fallback
        setUsageState(initialUsageState);
      } finally {
        setIsUsageLoading(false);
      }
    };
    
    handleAuth().then(uid => {
        if(uid) syncUsage(uid);
    });

  }, [auth, firestore, setUserId]);


  const updateUsageInFirestore = async (feature: Feature, newUsedCount: number) => {
      if (!userId) return;
      const docRef = getUsageDocRef(userId);
      if (!docRef) return;

      const fieldToUpdate = feature === 'export' ? 'exportsUsed' : 'aiPromptsUsed';
      try {
          await setDoc(docRef, { [fieldToUpdate]: newUsedCount }, { merge: true });
      } catch(e) {
          console.error("Failed to update usage in Firestore:", e);
      }
  };


  const canUseFeature = (feature: Feature) => {
    return usageState[feature].used < usageState[feature].limit;
  };

  const recordFeatureUsage = (feature: Feature) => {
    if (canUseFeature(feature)) {
      setUsageState(prev => {
        const newUsed = prev[feature].used + 1;
        updateUsageInFirestore(feature, newUsed);
        return {
          ...prev,
          [feature]: { ...prev[feature], used: newUsed },
        };
      });
    }
  };

  const grantUsage = (feature: Feature, amount: number) => {
    setUsageState(prev => ({
      ...prev,
      [feature]: { ...prev[feature], limit: prev[feature].limit + amount },
    }));
  };

  const value = {
    usageState,
    isUsageLoading,
    canUseFeature,
    recordFeatureUsage,
    grantUsage,
    userId
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
