import { collection, doc, setDoc, getDocs, deleteDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface PersonalizedQuizQuestion {
  type: "mcq" | "short";
  question: string;
  options?: string[];
  correctAnswer: string;
  solution: string;
}

export interface PersonalizedQuiz {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  quizType: "mcq" | "short" | "mixed";
  questions: PersonalizedQuizQuestion[];
  bestScore?: number;
  totalQuestions: number;
  attemptCount: number;
  createdAt: any;
  lastAttemptedAt?: any;
}

const COLLECTION = "personalized_quizzes";
const MAX_UPLOADS = 5;

/**
 * Save a generated quiz to Firestore.
 */
export async function savePersonalizedQuiz(
  userId: string,
  title: string,
  fileName: string,
  quizType: "mcq" | "short" | "mixed",
  questions: PersonalizedQuizQuestion[]
): Promise<string | null> {
  try {
    // Check upload limit
    const existing = await getUserQuizzes(userId);
    if (existing.length >= MAX_UPLOADS) {
      throw new Error(`Upload limit reached (${MAX_UPLOADS} max). Delete a quiz to add a new one.`);
    }

    const quizId = `${userId}_${Date.now()}`;
    const ref = doc(db, COLLECTION, quizId);
    await setDoc(ref, {
      userId,
      title,
      fileName,
      quizType,
      questions,
      totalQuestions: questions.length,
      attemptCount: 0,
      createdAt: serverTimestamp(),
    });
    return quizId;
  } catch (error) {
    console.error("Error saving personalized quiz:", error);
    throw error;
  }
}

/**
 * Get all quizzes for a user.
 */
export async function getUserQuizzes(userId: string): Promise<PersonalizedQuiz[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PersonalizedQuiz));
  } catch (error) {
    console.error("Error fetching user quizzes:", error);
    return [];
  }
}

/**
 * Update quiz after attempt (score, attempt count).
 */
export async function updateQuizAttempt(
  quizId: string,
  score: number
): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, quizId);
    // We need to read current to compare bestScore
    const { getDoc } = await import("firebase/firestore");
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data();
    const currentBest = data.bestScore ?? 0;
    await setDoc(ref, {
      bestScore: Math.max(currentBest, score),
      attemptCount: (data.attemptCount || 0) + 1,
      lastAttemptedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Error updating quiz attempt:", error);
  }
}

/**
 * Delete a quiz.
 */
export async function deletePersonalizedQuiz(quizId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, quizId));
  } catch (error) {
    console.error("Error deleting quiz:", error);
    throw error;
  }
}

/**
 * Get remaining upload slots.
 */
export async function getRemainingUploads(userId: string): Promise<number> {
  const quizzes = await getUserQuizzes(userId);
  return Math.max(0, MAX_UPLOADS - quizzes.length);
}
