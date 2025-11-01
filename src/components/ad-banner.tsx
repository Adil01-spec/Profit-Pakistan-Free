
'use client';

import { useEffect, useState, useContext } from "react";
import { useFirebase } from "@/firebase/provider";
import { collection, getDocs, type Firestore } from "firebase/firestore";

export function AdBanner() {
  const [ads, setAds] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const { firestore } = useFirebase();

  useEffect(() => {
    const fetchAds = async (db: Firestore) => {
        try {
            const querySnapshot = await getDocs(collection(db, "ads"));
            const fetchedAds = querySnapshot.docs.map((doc) => doc.data());
            
            if (fetchedAds.length > 0) {
              setAds(fetchedAds);
            } else {
              // Fallback to local JSON if Firestore is empty or fails
              const res = await fetch("/ads.json");
              if (res.ok) {
                const fallbackAds = await res.json();
                setAds(fallbackAds);
              }
            }
        } catch (err) {
            console.error("Ad load from Firestore failed, using fallback:", err);
            try {
              const res = await fetch("/ads.json");
              if (res.ok) {
                const fallbackAds = await res.json();
                setAds(fallbackAds);
              }
            } catch (fallbackErr) {
                console.error("Fallback ads failed to load:", fallbackErr);
            }
        }
    };
    
    if (firestore) {
      fetchAds(firestore);
    }
  }, [firestore]);

  useEffect(() => {
    if (ads.length <= 1) return;

    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
        setIsFading(false);
      }, 500); // Fade duration
    }, 30000); // 30 seconds

    return () => clearInterval(timer);
  }, [ads]);

  if (ads.length === 0) {
    return (
      <div className="w-full my-8 h-24 flex justify-center items-center bg-muted rounded-md animate-pulse">
        <p className="text-sm text-muted-foreground">Ad loading...</p>
      </div>
    );
  }

  const ad = ads[currentIndex];

  return (
    <a href={ad.link || "#"} target="_blank" rel="noopener noreferrer" className="block my-8">
      <div className="w-full h-24 flex justify-center items-center rounded-md border bg-background hover:shadow-lg transition-all duration-300 overflow-hidden">
        {ad.image ? (
          <img
            src={ad.image}
            alt={ad.text || "Sponsored Ad"}
            className={`h-full w-full object-contain transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
          />
        ) : (
          <p className={`text-sm font-medium transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            {ad.text || "Sponsored Ad"}
          </p>
        )}
      </div>
    </a>
  );
}
