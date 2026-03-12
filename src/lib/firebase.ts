import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent as firebaseLogEvent, Analytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Capacitor } from "@capacitor/core";

// Firebase config 
const firebaseConfig = {
  apiKey: "AIzaSyCgUKFHIk5E8O4pi2sm52WV93rubooY6ws",
  authDomain: "syllabus-tracker-bb443.firebaseapp.com",
  projectId: "syllabus-tracker-bb443",
  storageBucket: "syllabus-tracker-bb443.firebasestorage.app",
  messagingSenderId: "56419108715",
  appId: "1:56419108715:web:bb3ecc264cf58f79e2ae2e",
  measurementId: "G-RN89GFFB0G",
};

let analytics: Analytics | null = null;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const initFirebase = () => {
  try {
    if (!firebaseConfig.apiKey) {
      console.warn("Firebase: No API key configured. Analytics disabled.");
      return;
    }
    analytics = getAnalytics(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
};

const USER_PROFILE_STORAGE_KEY = "userProfile";

function saveUserProfileToStorage(displayName: string | null, email: string | null) {
  try {
    localStorage.setItem(
      USER_PROFILE_STORAGE_KEY,
      JSON.stringify({ displayName: displayName || null, email: email || null })
    );
  } catch {
    // ignore
  }
}

// Save or update user profile in Firestore and localStorage
export const saveUserToFirestore = async (user: User) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const providerData = user.providerData?.[0];
    const displayName = user.displayName || providerData?.displayName || null;
    const email = user.email || providerData?.email || null;

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email,
        displayName,
        photoURL: user.photoURL || providerData?.photoURL || null,
        phoneNumber: user.phoneNumber || providerData?.phoneNumber || null,
        providerId: providerData?.providerId || "unknown",
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        loginCount: 1,
      });
      console.log("New user profile created in Firestore");
    } else {
      const existing = userSnap.data();
      await setDoc(
        userRef,
        {
          email: email ?? existing?.email ?? null,
          displayName: displayName ?? existing?.displayName ?? null,
          photoURL: user.photoURL || providerData?.photoURL || existing?.photoURL || null,
          phoneNumber: user.phoneNumber || providerData?.phoneNumber || existing?.phoneNumber || null,
          emailVerified: user.emailVerified,
          lastLoginAt: serverTimestamp(),
          loginCount: (existing?.loginCount || 0) + 1,
        },
        { merge: true }
      );
      console.log("User profile updated in Firestore");
    }

    saveUserProfileToStorage(displayName, email);
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
  }
};

/** Get display name and email from localStorage; if missing and user is signed in, fetch from Firestore and cache. */
export const getCurrentUserProfile = async (): Promise<{
  displayName: string | null;
  email: string | null;
}> => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { displayName?: string; email?: string };
      return {
        displayName: parsed.displayName ?? null,
        email: parsed.email ?? null,
      };
    }
  } catch {
    // ignore
  }

  const currentUser = auth.currentUser;
  if (!currentUser) return { displayName: null, email: null };

  try {
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const displayName = (data?.displayName as string) ?? currentUser.displayName ?? null;
      const email = (data?.email as string) ?? currentUser.email ?? null;
      saveUserProfileToStorage(displayName, email);
      return { displayName, email };
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }

  const displayName = currentUser.displayName ?? null;
  const email = currentUser.email ?? null;
  saveUserProfileToStorage(displayName, email);
  return { displayName, email };
};

/**
 * Helper: wait for a short delay (used for retry logic)
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Google Sign-In — works on both Web and Android (Capacitor).
 *
 * NATIVE (Android):
 *   Uses @capacitor-firebase/authentication plugin for native Google Sign-In.
 *   Includes retry logic for intermittent "No credentials available" errors.
 *   Falls back to signInWithPopup if native plugin is not available.
 *
 * WEB:
 *   Uses signInWithPopup (works in iframes and preview environments).
 */
export const signInWithGoogle = async (): Promise<User | null> => {
  const { logAuthError } = await import("@/lib/authErrorLogger");

  if (Capacitor.isNativePlatform()) {
    const MAX_RETRIES = 2;

    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
      try {
        console.log(`[GoogleSignIn] Native attempt ${attempt}/${MAX_RETRIES + 1}`);

        // Dynamically import to avoid build errors when not installed
        const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");

        // Sign out from native layer first to clear stale credentials
        if (attempt > 1) {
          try {
            await FirebaseAuthentication.signOut();
            console.log("[GoogleSignIn] Cleared stale native session before retry");
            await delay(500);
          } catch {
            // ignore signout errors
          }
        }

        const result = await FirebaseAuthentication.signInWithGoogle();
        console.log("[GoogleSignIn] Native result:", JSON.stringify({
          hasCredential: !!result.credential,
          hasIdToken: !!result.credential?.idToken,
          hasAccessToken: !!result.credential?.accessToken,
          hasUser: !!result.user,
        }));

        // The native plugin may return the user directly via Firebase SDK link
        if (auth.currentUser) {
          await saveUserToFirestore(auth.currentUser);
          return auth.currentUser;
        }

        // Otherwise, use the credential to sign in with Firebase JS SDK
        if (result.credential?.idToken) {
          const credential = GoogleAuthProvider.credential(
            result.credential.idToken,
            result.credential.accessToken ?? undefined
          );
          const firebaseResult = await signInWithCredential(auth, credential);
          if (firebaseResult.user) {
            await saveUserToFirestore(firebaseResult.user);
          }
          return firebaseResult.user;
        }

        // No credential returned — this is the "No credentials available" scenario
        const noCredError = new Error("No credentials available from native Google Sign-In");
        (noCredError as any).code = "auth/no-credentials";

        if (attempt <= MAX_RETRIES) {
          console.warn(`[GoogleSignIn] No credential on attempt ${attempt}, retrying after delay...`);
          await logAuthError(noCredError, {
            signInMethod: "google-native",
            attemptNumber: attempt,
            additionalContext: { willRetry: true, resultKeys: Object.keys(result || {}) },
          });
          await delay(1000 * attempt); // progressive backoff
          continue;
        }

        // Final attempt failed
        await logAuthError(noCredError, {
          signInMethod: "google-native",
          attemptNumber: attempt,
          additionalContext: { willRetry: false, resultKeys: Object.keys(result || {}) },
        });
        throw noCredError;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        const code = (e as any)?.code || "";

        // User cancelled — don't retry, don't log as error
        if (
          code === "auth/popup-closed-by-user" ||
          msg.includes("canceled") ||
          msg.includes("cancelled") ||
          code === "auth/sign-in-cancelled"
        ) {
          await logAuthError(e, {
            signInMethod: "google-native",
            attemptNumber: attempt,
            additionalContext: { category: "user_cancelled" },
          });
          throw { code: "auth/popup-closed-by-user", message: "Sign-in cancelled by user" };
        }

        // Plugin not available — fall back to popup (no retry needed)
        if (msg.toLowerCase().includes("unimplemented") || code.toLowerCase().includes("unimplemented")) {
          console.warn("[GoogleSignIn] Native plugin not available, falling back to popup");
          try {
            const result = await signInWithPopup(auth, googleProvider);
            if (result.user) await saveUserToFirestore(result.user);
            return result.user;
          } catch (popupErr) {
            await logAuthError(popupErr, {
              signInMethod: "google-popup-fallback",
              attemptNumber: attempt,
            });
            throw popupErr;
          }
        }

        // For "no credentials" errors, retry
        if (
          (code === "auth/no-credentials" || msg.includes("No credentials")) &&
          attempt <= MAX_RETRIES
        ) {
          console.warn(`[GoogleSignIn] Retrying after error on attempt ${attempt}:`, msg);
          await delay(1000 * attempt);
          continue;
        }

        // Any other error — log and throw
        await logAuthError(e, {
          signInMethod: "google-native",
          attemptNumber: attempt,
          additionalContext: { category: "unexpected_error" },
        });
        throw e;
      }
    }

    // Should not reach here, but safety fallback
    throw new Error("Google Sign-In failed after all attempts");
  }

  // Web: popup
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) await saveUserToFirestore(result.user);
    return result.user;
  } catch (e) {
    await logAuthError(e, { signInMethod: "google-popup-web" });
    throw e;
  }
};

export const handleRedirectResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await saveUserToFirestore(result.user);
    }
    return result?.user ?? null;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("missing initial state") || msg.includes("sessionStorage")) {
      return null;
    }
    console.error("Redirect result error:", error);
    // Log redirect errors too
    try {
      const { logAuthError } = await import("@/lib/authErrorLogger");
      await logAuthError(error, { signInMethod: "google-redirect" });
    } catch { /* ignore */ }
    return null;
  }
};

export const firebaseSignOut = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      const { FirebaseAuthentication } = await import("@capacitor-firebase/authentication");
      await FirebaseAuthentication.signOut();
    } catch (_) {
      // Plugin not available, just sign out via Firebase JS
    }
  }
  localStorage.removeItem("skippedLogin");
  localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
  await signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const logEvent = (eventName: string, params?: Record<string, string | number>) => {
  if (analytics) {
    firebaseLogEvent(analytics, eventName, params);
  }
};

export const logScreenView = (screenName: string) => {
  logEvent("screen_view", { firebase_screen: screenName, firebase_screen_class: screenName });
};

export const logExamSelected = (examId: string) => {
  logEvent("exam_selected", { exam_id: examId });
};

export const logTopicToggled = (subjectId: string, topicId: string, completed: boolean) => {
  logEvent("topic_toggled", { subject_id: subjectId, topic_id: topicId, completed: completed ? "true" : "false" });
};

export const logMilestoneReached = (subjectId: string, milestone: number) => {
  logEvent("milestone_reached", { subject_id: subjectId, milestone: milestone });
};
