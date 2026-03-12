import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

function getDateTimeKey() {
  const now = new Date();
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}-${pad(now.getMilliseconds(), 3)}`;
}

/**
 * Log a UI error to Firestore `error_logs` collection with datetime as doc ID.
 */
export async function logErrorToFirestore(error: {
  message: string;
  stack?: string;
  componentStack?: string;
  source?: string;
}) {
  try {
    const user = auth.currentUser;
    const docId = getDateTimeKey();
    await setDoc(doc(db, "error_logs", docId), {
      email: user?.email || "anonymous",
      uid: user?.uid || null,
      message: error.message,
      stack: error.stack || null,
      componentStack: error.componentStack || null,
      source: error.source || "unknown",
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    console.error("Failed to log error to Firestore:", e);
  }
}

/**
 * Set up global error handlers that log to Firestore.
 */
export function setupGlobalErrorLogging() {
  window.addEventListener("error", (event) => {
    logErrorToFirestore({
      message: event.message,
      stack: event.error?.stack,
      source: "window.onerror",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    logErrorToFirestore({
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack,
      source: "unhandledrejection",
    });
  });
}
