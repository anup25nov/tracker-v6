/**
 * Environment configuration for Dev / Prod switching.
 *
 * Vite injects VITE_* env vars at build time.
 * - `npm run dev` or `npm run build:dev` → uses .env.development
 * - `npm run build` or `npm run build:android` → uses .env.production
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

// Production Firebase config (current/default)
const PROD_FIREBASE: FirebaseConfig = {
  apiKey: "AIzaSyCgUKFHIk5E8O4pi2sm52WV93rubooY6ws",
  authDomain: "syllabus-tracker-bb443.firebaseapp.com",
  projectId: "syllabus-tracker-bb443",
  storageBucket: "syllabus-tracker-bb443.firebasestorage.app",
  messagingSenderId: "56419108715",
  appId: "1:56419108715:web:bb3ecc264cf58f79e2ae2e",
  measurementId: "G-RN89GFFB0G",
};

// Dev Firebase config — override via .env.development VITE_FIREBASE_* vars
const DEV_FIREBASE: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || PROD_FIREBASE.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || PROD_FIREBASE.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || PROD_FIREBASE.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || PROD_FIREBASE.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || PROD_FIREBASE.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || PROD_FIREBASE.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || PROD_FIREBASE.measurementId,
};

/** true when running `vite dev` or `vite build --mode development` */
export const isDev = import.meta.env.DEV || import.meta.env.MODE === "development";

/** true when running `vite build` (production mode) */
export const isProd = import.meta.env.PROD && import.meta.env.MODE === "production";

/** Returns the Firebase config for the current environment */
export function getFirebaseConfig(): FirebaseConfig {
  return isDev ? DEV_FIREBASE : PROD_FIREBASE;
}

/** Current environment label for logging */
export const ENV_LABEL = isDev ? "DEV" : "PROD";
