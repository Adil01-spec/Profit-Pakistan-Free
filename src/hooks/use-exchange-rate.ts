
'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';

const API_URL = 'https://open.er-api.com/v6/latest/USD';
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

  useEffect(() => {
    const fetchRate = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rate');
        }
        const data = await response.json();
        if (data.result === 'success' && data.rates.PKR) {
          setRateData({
            rate: data.rates.PKR,
            lastUpdated: Date.now(),
          });
        } else {
          throw new Error('Invalid API response');
        }
      } catch (e: any) {
        console.error('Exchange rate fetch error:', e);
        setError(e.message || 'Could not fetch rate.');
        // Don't clear old data if fetch fails, use stale data if available
      } finally {
        setIsLoading(false);
      }
    };

    const now = Date.now();
    if (!rateData || now - rateData.lastUpdated > CACHE_DURATION) {
      fetchRate();
    } else {
      setIsLoading(false);
    }
  }, []); // Run only on mount

  return {
    rate: rateData?.rate,
    isLoading,
    error,
    lastUpdated: rateData?.lastUpdated,
  };
}
