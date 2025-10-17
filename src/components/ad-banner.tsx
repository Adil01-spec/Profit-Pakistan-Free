'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdBanner() {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // Only push if the ad slot hasn't been filled yet.
    // AdSense adds a `data-adsbygoogle-status` attribute when it processes an ad.
    if (insRef.current && !insRef.current.hasAttribute('data-adsbygoogle-status')) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, []);

  return (
    <div className="mx-auto my-8 max-w-full overflow-hidden text-center">
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXX" // Replace with your ad client ID
        data-ad-slot="YYYYYYYYYY" // Replace with your ad slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
