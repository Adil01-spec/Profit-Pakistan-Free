
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// A function to check if the essential Firebase config keys are provided.
function isFirebaseConfigValid(config: FirebaseOptions): boolean {
    return !!config.apiKey && !!config.projectId;
}

// Initialize Firebase only if the config is valid.
const app =
  !getApps().length && isFirebaseConfigValid(firebaseConfig)
    ? initializeApp(firebaseConfig)
    : getApps().length > 0 && isFirebaseConfigValid(firebaseConfig)
    ? getApp()
    : null;


// Throw an error in development if the config is missing.
if (process.env.NODE_ENV !== 'production' && !app) {
    console.error(
    'Firebase config is missing or invalid. ' +
    'Please ensure that NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID ' +
    'are set in your .env.local file and that you have restarted the development server.'
    );
}


export default app;
