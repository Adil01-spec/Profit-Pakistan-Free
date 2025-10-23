
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { useToast } from '@/hooks/use-toast';

const PRIMARY_API_URL = 'https://open.er-api.com/v6/latest/USD';
const BACKUP_API_URL = 'https://api.exchangerate.host/latest?base=USD&symbols=PKR';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface ExchangeRateData {
  rate: number;
  lastUpdated: number;
}

export function useExchangeRate() {
  const [rateData, setRateData] = useLocalStorage<ExchangeRateData | null>(
    'usd-pkr-rate',
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [showManualInput, setShowManualInput] = useState(false);

  const fetchWithFallback = useCallback(async () => {
    try {
      const response = await fetch(PRIMARY_API_URL);
      if (!response.ok) throw new Error('Primary API failed');
      const data = await response.json();
      if (data.result === 'success' && data.rates.PKR) {
        return data.rates.PKR;
      }
      throw new Error('Invalid primary API response');
    } catch (e) {
      console.warn("Primary exchange rate API failed, trying backup:", e);
      const backupResponse = await fetch(BACKUP_API_URL);
      if (!backupResponse.ok) throw new Error('Backup API also failed');
      const backupData = await backupResponse.json();
      if (backupData.success && backupData.rates.PKR) {
        return backupData.rates.PKR;
      }
      throw new Error('Invalid backup API response');
    }
  }, []);

  const setManualRate = useCallback((newRate: number) => {
    setRateData({
        rate: newRate,
        lastUpdated: Date.now()
    });
    setShowManualInput(false);
     toast({
        title: "Rate Updated",
        description: `Manual USD-PKR rate set to ${newRate}.`
    });
  }, [setRateData, toast]);


  useEffect(() => {
    const manageRateFetching = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const newRate = await fetchWithFallback();
        setRateData({
          rate: newRate,
          lastUpdated: Date.now(),
        });
        setShowManualInput(false);
      } catch (e: any) {
        console.error('Exchange rate fetch error (both APIs):', e);
        setError(e.message || 'Could not fetch rate.');
        if (rateData) {
          toast({
            variant: 'destructive',
            title: '⚠️ Live exchange rate unavailable.',
            description: 'Using last saved rate. You can also enter it manually.',
          });
        } else {
             toast({
                variant: 'destructive',
                title: "⚠️ Could not fetch live USD→PKR rate.",
                description: "Please enter it manually below."
            });
        }
        setShowManualInput(true);
      } finally {
        setIsLoading(false);
      }
    };

    const now = Date.now();
    if (!rateData || now - rateData.lastUpdated > CACHE_DURATION) {
      manageRateFetching();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  return {
    rate: rateData?.rate,
    isLoading,
    error,
    lastUpdated: rateData?.lastUpdated,
    showManualInput,
    setManualRate,
    lastSavedRate: rateData?.rate,
  };
}
