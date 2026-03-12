import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Capacitor } from "@capacitor/core";

/** App version — update this when you release new versions */
const APP_VERSION = "1.0.0";

function generateDocId(): string {
  const now = new Date();
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  const random = Math.random().toString(36).substring(2, 8);
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}-${pad(now.getMilliseconds(), 3)}_${random}`;
}

function getDeviceInfo(): Record<string, string> {
  return {
    platform: Capacitor.getPlatform(), // 'android' | 'ios' | 'web'
    isNative: String(Capacitor.isNativePlatform()),
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenWidth: String(window.screen?.width || 0),
    screenHeight: String(window.screen?.height || 0),
  };
}

export interface AuthErrorDetails {
  error_message: string;
  error_code: string;
  stack_trace: string | null;
  platform: string;
  app_version: string;
  device: Record<string, string>;
  user_email: string | null;
  user_uid: string | null;
  sign_in_method: string;
  attempt_number?: number;
  additional_context?: Record<string, unknown>;
  url: string;
  timestamp: ReturnType<typeof serverTimestamp>;
}

/**
 * Log an authentication error to Firestore `auth_error_logs` collection.
 * This is fire-and-forget — never throws.
 */
export async function logAuthError(
  error: unknown,
  context: {
    signInMethod?: string;
    attemptNumber?: number;
    additionalContext?: Record<string, unknown>;
  } = {}
): Promise<void> {
  try {
    const err = error as any;
    const message = err?.message || String(error);
    const code = err?.code || err?.errorCode || "unknown";
    const stack = err?.stack || null;

    const user = auth.currentUser;
    const docId = generateDocId();

    const logEntry: AuthErrorDetails = {
      error_message: message,
      error_code: code,
      stack_trace: stack,
      platform: Capacitor.getPlatform(),
      app_version: APP_VERSION,
      device: getDeviceInfo(),
      user_email: user?.email || null,
      user_uid: user?.uid || null,
      sign_in_method: context.signInMethod || "google",
      attempt_number: context.attemptNumber,
      additional_context: context.additionalContext,
      url: window.location.href,
      timestamp: serverTimestamp(),
    };

    await setDoc(doc(db, "auth_error_logs", docId), logEntry);
    console.log("[AuthErrorLogger] Error logged to Firestore:", docId, code, message);
  } catch (loggingError) {
    // Last resort — don't let logging itself crash the app
    console.error("[AuthErrorLogger] Failed to log auth error:", loggingError);
    console.error("[AuthErrorLogger] Original error was:", error);
  }
}
