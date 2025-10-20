
'use client';

import { useEffect, useState } from "react";
import { useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

export function AdBanner() {
  const [ad, setAd] = useState<{ image?: string; link?: string; text?: string } | null>(null);
  const [error, setError] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    const fetchAd = async () => {
      if (!firestore) return;
      try {
        const docRef = doc(firestore, "ads", "banner");
        const adSnap = await getDoc(docRef);
        if (adSnap.exists()) {
          setAd(adSnap.data());
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Ad load failed:", err);
        setError(true);
      }
    };
    fetchAd();
  }, [firestore]);

  if (error || !ad) {
    return (
      <div className="w-full h-32 my-8 flex justify-center items-center bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">Ad loading...</p>
      </div>
    );
  }

  return (
    <a href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="block my-8">
      <div className="w-full h-32 flex justify-center items-center rounded-md border bg-background hover:shadow-md transition">
        {ad.image ? (
          <img src={ad.image} alt="Ad banner" className="h-full object-contain rounded-md" />
        ) : (
          <p className="text-sm font-medium">{ad.text || "Sponsored Ad"}</p>
        )}
      </div>
    </a>
  );
}
