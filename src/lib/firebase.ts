import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent as firebaseLogEvent, Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { Capacitor } from "@capacitor/core";

// Firebase config — these are all publishable client-side keys
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
    console.log("Firebase Analytics initialized");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
};

// Save or update user profile in Firestore
export const saveUserToFirestore = async (user: User) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // New user — create profile
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
      console.log("New user profile created in Firestore");
    } else {
      // Existing user — update last login
      await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      console.log("User last login updated in Firestore");
    }
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
  }
};

export const signInWithGoogle = async (): Promise<User | null> => {
  // Use redirect in embedded contexts (iframe) or on native (Capacitor) — popup often fails in WebView
  const useRedirect = window.self !== window.top || Capacitor.isNativePlatform();
  if (useRedirect) {
    await signInWithRedirect(auth, googleProvider);
    return null;
  }
  const result = await signInWithPopup(auth, googleProvider);
  if (result.user) {
    await saveUserToFirestore(result.user);
  }
  return result.user;
};

export const handleRedirectResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await saveUserToFirestore(result.user);
    }
    return result?.user ?? null;
  } catch (error) {
    console.error("Redirect result error:", error);
    return null;
  }
};

export const firebaseSignOut = async () => {
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
