'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

export function AdBanner() {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error(err);
        }
    }, []);

    return (
        <div className="mx-auto my-4 max-w-full overflow-hidden">
            <ins className="adsbygoogle"
                style={{ display: 'block', textAlign: 'center' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXX" // Replace with your ad client ID
                data-ad-slot="YYYYYYYYYY"             // Replace with your ad slot ID
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </div>
    );
}
