import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent as firebaseLogEvent, Analytics } from "firebase/analytics";

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

export const initFirebase = () => {
  try {
    if (!firebaseConfig.apiKey) {
      console.warn("Firebase: No API key configured. Analytics disabled.");
      return;
    }
    const app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    console.log("Firebase Analytics initialized");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
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
