
export async function getUsdToPkrRate({ force = false } = {}): Promise<number> {
  const KEY = 'usdToPkrRate_v1';
  try {
    // Check cache
    if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem(KEY);
        if (!force && cached) {
          const parsed = JSON.parse(cached);
          const cachedDate = new Date(parsed.ts);
          const now = new Date();
          if (cachedDate.toDateString() === now.toDateString() && parsed.rate) {
            console.log('Using cached USD→PKR rate:', parsed.rate);
            return parsed.rate;
          }
        }
    }


    // Fetch from multiple sources
    const urls = [
      'https://api.exchangerate.host/latest?base=USD&symbols=PKR',
      'https://open.er-api.com/v6/latest/USD',
      'https://api.exchangerate-api.com/v4/latest/USD'
    ];

    let rate: number | null = null;
    let raw: any = null;

    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
          console.warn('Rate API responded non-ok:', url, res.status);
          continue;
        }
        raw = await res.json();
        console.log('Raw rate response from', url, raw);
        rate = (raw?.rates?.PKR) ? Number(raw.rates.PKR) : null;
        if (rate && rate > 0) break;
      } catch (err) {
        console.warn('Rate fetch failed for', url, err);
      }
    }

    // Fallback
    if (!rate) {
        if (typeof window !== 'undefined' && window.localStorage) {
            const cached = localStorage.getItem(KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.rate) {
                console.warn('Using last cached rate:', parsed.rate);
                return parsed.rate;
                }
            }
        }
      const defaultRate = 285;
      console.error('All rate APIs failed. Using default rate:', defaultRate);
      return defaultRate;
    }

    // Cache and return
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(KEY, JSON.stringify({ rate, ts: new Date().toISOString(), raw }));
    }
    console.log('Fetched & cached USD→PKR rate:', rate);
    return rate;
  } catch (error) {
    console.error('getUsdToPkrRate error:', error);
    return 285;
  }
}

    